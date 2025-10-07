from django.utils import timezone
from quizzes.models import QuizAttempt, UserAnswer
from documents.models import Document
from .models import UserProgress, StudySession
from django.db.models import Avg


def update_user_progress(quiz_attempt):
    """
    Update user progress based on quiz attempt
    """
    user = quiz_attempt.user
    document = quiz_attempt.quiz.document
    
    # Get or create user progress
    progress, created = UserProgress.objects.get_or_create(
        user=user,
        document=document,
        defaults={
            'total_quizzes_taken': 0,
            'total_questions_attempted': 0,
            'total_correct_answers': 0,
            'average_score': 0
        }
    )
    
    # Update basic stats
    progress.total_quizzes_taken += 1
    progress.total_questions_attempted += quiz_attempt.total_questions
    progress.total_correct_answers += quiz_attempt.score
    
    # Calculate average score
    if progress.total_questions_attempted > 0:
        progress.average_score = (
            progress.total_correct_answers / progress.total_questions_attempted
        ) * 100
    
    # Update strengths and weaknesses based on question topics
    update_topic_analysis(progress, quiz_attempt)
    
    progress.save()
    
    # Create or update study session
    update_study_session(user, document, quiz_attempt)

def update_topic_analysis(progress, quiz_attempt):
    """
    Analyze user performance by topic to identify strengths and weaknesses
    """
    user_answers = UserAnswer.objects.filter(attempt=quiz_attempt)
    
    topic_performance = {}
    
    for user_answer in user_answers:
        topic = user_answer.question.topic or 'General'
        
        if topic not in topic_performance:
            topic_performance[topic] = {'correct': 0, 'total': 0}
        
        topic_performance[topic]['total'] += 1
        if user_answer.is_correct:
            topic_performance[topic]['correct'] += 1
    
    # Update strengths and weaknesses
    strengths = {}
    weaknesses = {}
    
    for topic, stats in topic_performance.items():
        accuracy = (stats['correct'] / stats['total']) * 100
        
        if accuracy >= 70:  # Strength threshold
            strengths[topic] = round(accuracy, 2)
        elif accuracy <= 40:  # Weakness threshold  
            weaknesses[topic] = round(accuracy, 2)
    
    progress.strengths = strengths
    progress.weaknesses = weaknesses

def update_study_session(user, document, quiz_attempt):
    """
    Update study session with quiz attempt data
    """
    # Find active session or create new one
    session = StudySession.objects.filter(
        user=user,
        document=document,
        end_time__isnull=True
    ).first()
    
    if not session:
        session = StudySession.objects.create(
            user=user,
            document=document,
            session_type='quiz',
            quiz_type=quiz_attempt.quiz.quiz_type
        )
    
    # Update session stats
    session.questions_attempted += quiz_attempt.total_questions
    session.correct_answers += quiz_attempt.score
    session.time_spent += quiz_attempt.time_taken
    session.end_time = timezone.now()
    session.save()

def get_user_stats(user):
    """
    Get comprehensive user statistics
    """
    progress_data = UserProgress.objects.filter(user=user)
    quiz_attempts = QuizAttempt.objects.filter(user=user)
    
    total_documents = progress_data.count()
    total_quizzes = quiz_attempts.count()
    total_questions = sum([p.total_questions_attempted for p in progress_data])
    
    # Calculate overall accuracy
    total_correct = sum([p.total_correct_answers for p in progress_data])
    overall_accuracy = (total_correct / total_questions * 100) if total_questions > 0 else 0
    
    # Recent activity
    recent_sessions = StudySession.objects.filter(user=user).order_by('-start_time')[:5]
    
    # Learning trends (last 7 days)
    from datetime import timedelta
    week_ago = timezone.now() - timedelta(days=7)
    recent_attempts = quiz_attempts.filter(completed_at__gte=week_ago)
    
    daily_stats = {}
    for i in range(7):
        date = (timezone.now() - timedelta(days=i)).date()
        day_attempts = recent_attempts.filter(completed_at__date=date)
        daily_stats[str(date)] = {
            'quizzes': day_attempts.count(),
            'average_score': day_attempts.aggregate(avg=Avg('score'))['avg'] or 0
        }
    
    return {
        'total_documents': total_documents,
        'total_quizzes': total_quizzes,
        'total_questions': total_questions,
        'overall_accuracy': round(overall_accuracy, 2),
        'recent_sessions': recent_sessions.count(),
        'daily_stats': daily_stats,
        'strengths': get_overall_strengths(progress_data),
        'weaknesses': get_overall_weaknesses(progress_data)
    }

def get_overall_strengths(progress_data):
    """
    Get overall strengths across all documents
    """
    all_strengths = {}
    for progress in progress_data:
        for topic, score in progress.strengths.items():
            if topic in all_strengths:
                all_strengths[topic].append(score)
            else:
                all_strengths[topic] = [score]
    
    # Average scores per topic
    return {topic: round(sum(scores) / len(scores), 2) 
            for topic, scores in all_strengths.items()}

def get_overall_weaknesses(progress_data):
    """
    Get overall weaknesses across all documents  
    """
    all_weaknesses = {}
    for progress in progress_data:
        for topic, score in progress.weaknesses.items():
            if topic in all_weaknesses:
                all_weaknesses[topic].append(score)
            else:
                all_weaknesses[topic] = [score]
    
    return {topic: round(sum(scores) / len(scores), 2)
            for topic, scores in all_weaknesses.items()}