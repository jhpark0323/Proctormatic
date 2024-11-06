from rest_framework import serializers
from .models import Notification, Question, Faq, Answer


class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'

class NotificationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        exclude = ['content']

class NotificationObjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        exclude = ['id']

class QuestionCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ['category', 'title', 'content']

class QuestionListSerializer(serializers.ModelSerializer):
    organizer = serializers.CharField(source='user.name', read_only=True)
    class Meta:
        model = Question
        exclude = ['user', 'content']

class AnswerListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        exclude = ('id', 'question',)

class QuestionSerializer(serializers.ModelSerializer):
    organizer = serializers.CharField(source='user.name', read_only=True)
    answerList = AnswerListSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('organizer', 'category', 'title', 'content', 'created_at', 'updated_at', 'answerList')

class QuestionEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ('category', 'title', 'content',)

class AnswerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Answer
        fields = ('content',)

class FaqCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faq
        fields = '__all__'

class FaqListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faq
        fields = ('id', 'title',)

class FaqSerializer(serializers.ModelSerializer):
    class Meta:
        model = Faq
        fields = ('title', 'content',)