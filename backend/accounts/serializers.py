from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        user = self.user

        token = super().get_token(user)
        token['role'] = 'host'
        token['id'] = user.id

        return {
            'access': str(token.access_token),
            'refresh': str(token),
        }

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['name', 'email', 'password', 'birth', 'policy', 'marketing']
        extra_kwargs = {'password': {'write_only': True, 'min_length': 8}}

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        exclude = ['id', 'password', 'policy', 'is_active', 'last_login']