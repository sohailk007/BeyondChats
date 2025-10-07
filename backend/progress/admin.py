from django.contrib import admin

# Register your models here.

from django.contrib import admin
from .models import UserProgress, StudySession, LearningGoal

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'document', 'total_quizzes_taken', 'average_score', 'last_activity')
    list_filter = ('last_activity',)
    search_fields = ('user__username', 'document__title')
    readonly_fields = ('last_activity',)

@admin.register(StudySession)
class StudySessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'document', 'session_type', 'start_time', 'end_time', 'time_spent')
    list_filter = ('session_type', 'start_time')
    search_fields = ('user__username', 'document__title')
    readonly_fields = ('start_time',)

@admin.register(LearningGoal)
class LearningGoalAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'target_date', 'current_progress', 'target_score', 'completed')
    list_filter = ('completed', 'target_date')
    search_fields = ('user__username', 'title')