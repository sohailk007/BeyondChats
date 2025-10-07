from rest_framework import serializers
from .models import Quiz, Question, QuizAttempt, UserAnswer

class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            'id', 'question_text', 'question_type', 'option_a', 'option_b', 
            'option_c', 'option_d', 'correct_answer', 'expected_answer', 
            'explanation', 'topic'
        ]

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)
    document_title = serializers.CharField(source='document.title', read_only=True)
    
    class Meta:
        model = Quiz
        fields = [
            'id', 'document', 'document_title', 'quiz_type', 'title', 
            'created_at', 'questions_count', 'difficulty', 'questions'
        ]

class UserAnswerSerializer(serializers.ModelSerializer):
    question_text = serializers.CharField(source='question.question_text', read_only=True)
    
    class Meta:
        model = UserAnswer
        fields = [
            'id', 'question', 'question_text', 'user_answer', 
            'is_correct', 'feedback', 'time_taken'
        ]

class QuizAttemptSerializer(serializers.ModelSerializer):
    quiz_title = serializers.CharField(source='quiz.title', read_only=True)
    document_title = serializers.CharField(source='quiz.document.title', read_only=True)
    user_answers = UserAnswerSerializer(many=True, read_only=True)
    percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'quiz', 'quiz_title', 'document_title', 'score', 
            'total_questions', 'percentage', 'completed_at', 'time_taken',
            'user_answers', 'user_answers'
        ]
    
    def get_percentage(self, obj):
        if obj.total_questions > 0:
            return round((obj.score / obj.total_questions) * 100, 2)
        return 0

class QuizGenerateSerializer(serializers.Serializer):
    document_id = serializers.IntegerField(required=True)
    quiz_type = serializers.ChoiceField(choices=Quiz.QUIZ_TYPES, required=True)
    questions_count = serializers.IntegerField(min_value=1, max_value=20, default=5)
    difficulty = serializers.ChoiceField(
        choices=[('easy', 'Easy'), ('medium', 'Medium'), ('hard', 'Hard')],
        default='medium'
    )

class QuizSubmitSerializer(serializers.Serializer):
    answers = serializers.ListField(
        child=serializers.DictField(),
        required=True
    )
    time_taken = serializers.IntegerField(min_value=0, default=0)