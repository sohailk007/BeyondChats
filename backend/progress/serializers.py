from rest_framework import serializers
from .models import UserProgress, StudySession, LearningGoal

class UserProgressSerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source='document.title', read_only=True)
    overall_score = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = UserProgress
        fields = [
            'id', 'document', 'document_title', 'total_quizzes_taken',
            'total_questions_attempted', 'total_correct_answers', 'average_score',
            'overall_score', 'completion_percentage', 'strengths', 'weaknesses',
            'last_activity'
        ]
    
    def get_overall_score(self, obj):
        if obj.total_questions_attempted > 0:
            return round((obj.total_correct_answers / obj.total_questions_attempted) * 100, 2)
        return 0
    
    def get_completion_percentage(self, obj):
        # This could be enhanced based on document complexity
        max_possible_quizzes = 10  # Example threshold
        return min(round((obj.total_quizzes_taken / max_possible_quizzes) * 100, 2), 100)

class StudySessionSerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source='document.title', read_only=True)
    duration_minutes = serializers.SerializerMethodField()
    accuracy = serializers.SerializerMethodField()
    
    class Meta:
        model = StudySession
        fields = [
            'id', 'document', 'document_title', 'start_time', 'end_time',
            'session_type', 'quiz_type', 'questions_attempted', 'correct_answers',
            'time_spent', 'duration_minutes', 'accuracy'
        ]
    
    def get_duration_minutes(self, obj):
        return round(obj.time_spent / 60, 2) if obj.time_spent else 0
    
    def get_accuracy(self, obj):
        if obj.questions_attempted > 0:
            return round((obj.correct_answers / obj.questions_attempted) * 100, 2)
        return 0

class LearningGoalSerializer(serializers.ModelSerializer):
    document_title = serializers.CharField(source='document.title', read_only=True, allow_null=True)
    days_remaining = serializers.SerializerMethodField()
    progress_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = LearningGoal
        fields = [
            'id', 'title', 'description', 'target_date', 'document', 'document_title',
            'target_score', 'current_progress', 'completed', 'created_at',
            'days_remaining', 'progress_percentage'
        ]
    
    def get_days_remaining(self, obj):
        from django.utils import timezone
        remaining = (obj.target_date - timezone.now().date()).days
        return max(0, remaining)
    
    def get_progress_percentage(self, obj):
        return min(round((obj.current_progress / obj.target_score) * 100, 2), 100)