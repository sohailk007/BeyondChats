from django.db import models
from documents.models import Document
from django.contrib.auth import get_user_model
User = get_user_model()

class Quiz(models.Model):
    QUIZ_TYPES = (
        ('mcq', 'Multiple Choice'),
        ('saq', 'Short Answer'),
        ('laq', 'Long Answer'),
    )
    
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='quizzes')
    quiz_type = models.CharField(max_length=10, choices=QUIZ_TYPES)
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    questions_count = models.IntegerField(default=5)
    difficulty = models.CharField(
        max_length=10, 
        choices=(('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')),
        default='medium'
    )
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.quiz_type})"

class Question(models.Model):
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    question_type = models.CharField(max_length=10, choices=Quiz.QUIZ_TYPES)
    
    # For MCQs
    option_a = models.TextField(blank=True, null=True)
    option_b = models.TextField(blank=True, null=True)
    option_c = models.TextField(blank=True, null=True)
    option_d = models.TextField(blank=True, null=True)
    correct_answer = models.CharField(max_length=1, blank=True, null=True)  # a, b, c, d
    
    # For SAQs/LAQs
    expected_answer = models.TextField(blank=True, null=True)
    explanation = models.TextField(blank=True, null=True)
    topic = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        ordering = ['id']
    
    def __str__(self):
        return f"Q: {self.question_text[:50]}..."

class QuizAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    quiz = models.ForeignKey(Quiz, on_delete=models.CASCADE, related_name='attempts')
    score = models.FloatField(default=0)
    total_questions = models.IntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)
    time_taken = models.IntegerField(default=0)  # in seconds
    user_answers = models.JSONField(default=dict)  # Store all user answers
    
    class Meta:
        ordering = ['-completed_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.quiz.title} - {self.score}/{self.total_questions}"

class UserAnswer(models.Model):
    attempt = models.ForeignKey(QuizAttempt, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    user_answer = models.TextField()
    is_correct = models.BooleanField(default=False)
    feedback = models.TextField(blank=True, null=True)
    time_taken = models.IntegerField(default=0)  # in seconds
    
    class Meta:
        unique_together = ['attempt', 'question']
    
    def __str__(self):
        return f"Answer for Q{self.question.id} in Attempt {self.attempt.id}"