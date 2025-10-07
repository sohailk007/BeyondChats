from rest_framework import serializers
from .models import Document, DocumentChunk

class DocumentChunkSerializer(serializers.ModelSerializer):
    class Meta:
        model = DocumentChunk
        fields = ['id', 'content', 'chunk_index', 'page_number']

class DocumentSerializer(serializers.ModelSerializer):
    chunks = DocumentChunkSerializer(many=True, read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'document_type', 'file', 'uploaded_at', 
            'processed', 'file_size', 'file_size_mb', 'page_count', 'chunks'
        ]
        read_only_fields = ['uploaded_at', 'processed', 'file_size', 'page_count']
    
    def get_file_size_mb(self, obj):
        if obj.file_size:
            return round(obj.file_size / (1024 * 1024), 2)
        return 0
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        document = super().create(validated_data)
        return document