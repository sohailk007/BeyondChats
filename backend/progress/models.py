from django.db import models
from documents.models import Document
from django.contrib.auth import get_user_model
User = get_user_model()


class UserProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='progress')
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='user_progress')
    total_quizzes_taken = models.IntegerField(default=0)
    total_questions_attempted = models.IntegerField(default=0)
    total_correct_answers = models.IntegerField(default=0)
    average_score = models.FloatField(default=0)
    strengths = models.JSONField(default=dict)  # {"topic": "score_percentage"}
    weaknesses = models.JSONField(default=dict) # {"topic": "score_percentage"}
    last_activity = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'document']
        verbose_name_plural = "User progress"
    
    def __str__(self):
        return f"{self.user.username} - {self.document.title}"

class StudySession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_sessions')
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='study_sessions')
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    session_type = models.CharField(
        max_length=20,
        choices=[('reading', 'Reading'), ('quiz', 'Quiz'), ('review', 'Review')],
        default='quiz'
    )
    quiz_type = models.CharField(
        max_length=10, 
        choices=[('mcq', 'MCQ'), ('saq', 'SAQ'), ('laq', 'LAQ')],
        blank=True, null=True
    )
    questions_attempted = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    time_spent = models.IntegerField(default=0)  # in seconds
    
    class Meta:
        ordering = ['-start_time']
    
    def __str__(self):
        return f"{self.user.username} - {self.document.title} - {self.start_time.date()}"

class LearningGoal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_goals')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    target_date = models.DateField()
    document = models.ForeignKey(Document, on_delete=models.CASCADE, null=True, blank=True)
    target_score = models.FloatField(default=80)  # Target average score
    current_progress = models.FloatField(default=0)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.title}"