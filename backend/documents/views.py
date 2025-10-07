from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from .models import Document
from .serializers import DocumentSerializer
from .utils import process_pdf, search_documents

class DocumentViewSet(viewsets.ModelViewSet):
    serializer_class = DocumentSerializer
    parser_classes = (MultiPartParser, FormParser)
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['document_type', 'processed']
    
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        document = serializer.save(user=self.request.user)
        # Process PDF in background
        process_pdf.delay(document.id)
    
    def create(self, request, *args, **kwargs):
        # Check if user has reached upload limit (optional)
        user_docs_count = Document.objects.filter(user=request.user).count()
        if user_docs_count >= 50:  # Limit to 50 documents per user
            return Response(
                {"error": "Document upload limit reached. Maximum 50 documents allowed."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        return super().create(request, *args, **kwargs)
    
    @action(detail=False, methods=['post'])
    def search(self, request):
        query = request.data.get('query', '').strip()
        document_id = request.data.get('document_id')
        
        if not query:
            return Response(
                {"error": "Query parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if document_id:
            documents = Document.objects.filter(id=document_id, user=request.user, processed=True)
        else:
            documents = Document.objects.filter(user=request.user, processed=True)
        
        if not documents.exists():
            return Response(
                {"error": "No processed documents found"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        results = search_documents(query, documents)
        return Response({
            'query': query,
            'results': results,
            'total_results': len(results)
        })
    
    @action(detail=True, methods=['post'])
    def reprocess(self, request, pk=None):
        document = self.get_object()
        document.processed = False
        document.save()
        
        # Delete existing chunks
        document.chunks.all().delete()
        
        # Reprocess document
        process_pdf.delay(document.id)
        
        return Response({"message": "Document reprocessing started"})