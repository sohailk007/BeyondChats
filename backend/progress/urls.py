from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserProgressViewSet, StudySessionViewSet, LearningGoalViewSet

router = DefaultRouter()
router.register(r'progress', UserProgressViewSet, basename='userprogress')
router.register(r'sessions', StudySessionViewSet, basename='studysession')
router.register(r'goals', LearningGoalViewSet, basename='learninggoal')

urlpatterns = [
    path('', include(router.urls)),
]