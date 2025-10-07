from django.shortcuts import render

# Create your views here.

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Avg, Sum
from .models import UserProgress, StudySession, LearningGoal
from .serializers import UserProgressSerializer, StudySessionSerializer, LearningGoalSerializer
from .utils import get_user_stats

class UserProgressViewSet(viewsets.ModelViewSet):
    serializer_class = UserProgressSerializer
    
    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get comprehensive user statistics
        """
        stats = get_user_stats(request.user)
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def overview(self, request):
        """
        Get progress overview for all documents
        """
        progress_data = self.get_queryset()
        serializer = self.get_serializer(progress_data, many=True)
        
        # Calculate overall progress
        total_documents = progress_data.count()
        total_quizzes = sum([p.total_quizzes_taken for p in progress_data])
        total_questions = sum([p.total_questions_attempted for p in progress_data])
        overall_accuracy = sum([p.average_score for p in progress_data]) / total_documents if total_documents > 0 else 0
        
        return Response({
            'progress_data': serializer.data,
            'summary': {
                'total_documents': total_documents,
                'total_quizzes': total_quizzes,
                'total_questions': total_questions,
                'overall_accuracy': round(overall_accuracy, 2)
            }
        })

class StudySessionViewSet(viewsets.ModelViewSet):
    serializer_class = StudySessionSerializer
    
    def get_queryset(self):
        return StudySession.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get recent study sessions
        """
        sessions = self.get_queryset().order_by('-start_time')[:10]
        serializer = self.get_serializer(sessions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def start(self, request):
        """
        Start a new study session
        """
        document_id = request.data.get('document_id')
        session_type = request.data.get('session_type', 'quiz')
        quiz_type = request.data.get('quiz_type')
        
        from documents.models import Document
        try:
            document = Document.objects.get(id=document_id, user=request.user)
            
            session = StudySession.objects.create(
                user=request.user,
                document=document,
                session_type=session_type,
                quiz_type=quiz_type
            )
            
            return Response(StudySessionSerializer(session).data)
            
        except Document.DoesNotExist:
            return Response(
                {'error': 'Document not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def end(self, request, pk=None):
        """
        End a study session
        """
        session = self.get_object()
        session.end_time = timezone.now()
        session.save()
        
        return Response(StudySessionSerializer(session).data)

class LearningGoalViewSet(viewsets.ModelViewSet):
    serializer_class = LearningGoalSerializer
    
    def get_queryset(self):
        return LearningGoal.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """
        Update progress for a learning goal
        """
        goal = self.get_object()
        progress = request.data.get('progress', 0)
        
        goal.current_progress = min(progress, goal.target_score)
        
        # Check if goal is completed
        if goal.current_progress >= goal.target_score:
            goal.completed = True
        
        goal.save()
        
        return Response(LearningGoalSerializer(goal).data)