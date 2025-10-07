from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from .models import Quiz, Question, QuizAttempt, UserAnswer
from .serializers import (
    QuizSerializer, QuestionSerializer, QuizAttemptSerializer,
    QuizGenerateSerializer, QuizSubmitSerializer
)
from .utils import generate_quiz_questions, evaluate_answer

class QuizViewSet(viewsets.ModelViewSet):
    serializer_class = QuizSerializer
    
    def get_queryset(self):
        return Quiz.objects.filter(document__user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def generate(self, request):
        serializer = QuizGenerateSerializer(data=request.data)
        if serializer.is_valid():
            try:
                quiz = generate_quiz_questions(
                    document_id=serializer.validated_data['document_id'],
                    quiz_type=serializer.validated_data['quiz_type'],
                    questions_count=serializer.validated_data['questions_count'],
                    user=request.user,
                    difficulty=serializer.validated_data['difficulty']
                )
                return Response(QuizSerializer(quiz).data)
            except Exception as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class QuizAttemptViewSet(viewsets.ModelViewSet):
    serializer_class = QuizAttemptSerializer
    
    def get_queryset(self):
        return QuizAttempt.objects.filter(user=self.request.user)
    
    def create(self, request, *args, **kwargs):
        quiz_id = request.data.get('quiz_id')
        try:
            quiz = Quiz.objects.get(id=quiz_id, document__user=request.user)
            
            # Create new attempt
            attempt = QuizAttempt.objects.create(
                user=request.user,
                quiz=quiz,
                total_questions=quiz.questions_count,
                score=0
            )
            
            return Response(QuizAttemptSerializer(attempt).data)
            
        except Quiz.DoesNotExist:
            return Response(
                {'error': 'Quiz not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        attempt = self.get_object()
        serializer = QuizSubmitSerializer(data=request.data)
        
        if serializer.is_valid():
            answers = serializer.validated_data['answers']
            time_taken = serializer.validated_data['time_taken']
            
            try:
                score = 0
                
                # Process each answer
                for answer_data in answers:
                    question_id = answer_data.get('question_id')
                    user_answer = answer_data.get('answer', '')
                    question_time = answer_data.get('time_taken', 0)
                    
                    try:
                        question = Question.objects.get(id=question_id, quiz=attempt.quiz)
                        
                        # Evaluate answer
                        is_correct, feedback = evaluate_answer(question, user_answer)
                        
                        if is_correct:
                            score += 1
                        
                        # Save user answer
                        UserAnswer.objects.create(
                            attempt=attempt,
                            question=question,
                            user_answer=user_answer,
                            is_correct=is_correct,
                            feedback=feedback,
                            time_taken=question_time
                        )
                        
                    except Question.DoesNotExist:
                        continue
                
                # Update attempt
                attempt.score = score
                attempt.time_taken = time_taken
                attempt.user_answers = answers  # Store raw answers
                attempt.save()
                
                # Update user progress
                from progress.utils import update_user_progress
                update_user_progress(attempt)
                
                return Response({
                    'score': score,
                    'total_questions': attempt.total_questions,
                    'percentage': round((score / attempt.total_questions) * 100, 2),
                    'attempt_id': attempt.id
                })
                
            except Exception as e:
                return Response(
                    {'error': f'Error processing answers: {str(e)}'},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get user's quiz statistics
        """
        user_attempts = QuizAttempt.objects.filter(user=request.user)
        
        total_attempts = user_attempts.count()
        average_score = user_attempts.aggregate(avg_score=Avg('score'))['avg_score'] or 0
        total_questions_answered = UserAnswer.objects.filter(attempt__user=request.user).count()
        
        # Quiz type distribution
        quiz_type_stats = user_attempts.values('quiz__quiz_type').annotate(
            count=Count('id'),
            avg_score=Avg('score')
        )
        
        return Response({
            'total_attempts': total_attempts,
            'average_score': round(average_score, 2),
            'total_questions_answered': total_questions_answered,
            'quiz_type_breakdown': list(quiz_type_stats)
        })