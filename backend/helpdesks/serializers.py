from rest_framework import serializers
from .models import Notification
from django.contrib.auth import get_user_model

class NotificationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['title', 'content']

class NotificationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        exclude = ['content']

