from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from datetime import datetime
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

class EditMarketingSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('marketing',)

class FindEmailRequestSerializer(serializers.ModelSerializer):
    birth = serializers.CharField()

    class Meta:
        model = User
        fields = ('name', 'birth',)

    def to_internal_value(self, data):
        validated_data = super().to_internal_value(data)

        birth_str = validated_data.get('birth')
        try:
            validated_data['birth'] = datetime.strptime(birth_str, '%y%m%d').date()
        except ValueError:
            raise serializers.ValidationError({"message": "날짜 형식이 올바르지 않습니다. YYMMDD 형식이어야 합니다."})

        return validated_data

class FindEmailResponseSerializer(serializers.ModelSerializer):
    joined_on = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('email', 'joined_on',)

    def get_joined_on(self, instance):
        return instance.created_at.strftime('%Y-%m-%d')