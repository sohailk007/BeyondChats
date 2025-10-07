from django.contrib import admin

# Register your models here.

from django.contrib import admin
from .models import Quiz, Question, QuizAttempt, UserAnswer

class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0

class UserAnswerInline(admin.TabularInline):
    model = UserAnswer
    extra = 0
    readonly_fields = ('time_taken',)

@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('title', 'document', 'quiz_type', 'difficulty', 'created_at', 'questions_count')
    list_filter = ('quiz_type', 'difficulty', 'created_at')
    search_fields = ('title', 'document__title')
    inlines = [QuestionInline]

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('question_text', 'quiz', 'question_type', 'topic')
    list_filter = ('question_type', 'topic', 'quiz__quiz_type')
    search_fields = ('question_text', 'quiz__title')

@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ('user', 'quiz', 'score', 'total_questions', 'completed_at')
    list_filter = ('completed_at', 'quiz__quiz_type')
    search_fields = ('user__username', 'quiz__title')
    readonly_fields = ('completed_at', 'user_answers')
    inlines = [UserAnswerInline]

@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = ('attempt', 'question', 'is_correct', 'time_taken')
    list_filter = ('is_correct',)
    search_fields = ('attempt__user__username', 'question__question_text')
    readonly_fields = ('time_taken',)