from rest_framework import serializers
from .models import Notification, Question, Faq


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