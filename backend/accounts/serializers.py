from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from datetime import date, datetime
from django.contrib.auth import get_user_model, authenticate

from proctormatic.fields import CustomCharField, CustomEmailField, CustomCharFieldWithConsonant

User = get_user_model()
DATE_FORMAT_ERROR = '날짜 형식이 올바르지 않습니다. YYYYMMDD 형식이어야 합니다.'


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        user = self.user

        token = super().get_token(user)
        token['role'] = 'host'

        return {
            'access': str(token.access_token),
            'refresh': str(token),
        }

class SendEmailVerificationSerializer(serializers.Serializer):
    email = CustomEmailField()
    re_enter = serializers.BooleanField(required=False, default=False)

class EmailVerificationSerializer(serializers.Serializer):
    email = CustomEmailField()
    code = CustomCharField(label='인증번호')

class UserSerializer(serializers.ModelSerializer):
    email = CustomEmailField()
    birth = CustomCharField(
        max_length=8,
        min_length=8,
        error_messages={
            'invalid': DATE_FORMAT_ERROR,
            'min_length': DATE_FORMAT_ERROR,
            'max_length': DATE_FORMAT_ERROR
        }
    )

    class Meta:
        model = User
        fields = ('name', 'email', 'password', 'birth', 'policy', 'marketing',)
        extra_kwargs = {'password': {'write_only': True, 'min_length': 8}}

    def validate_birth(self, value):
        try:
            birth = datetime.strptime(value, '%Y%m%d')
            if birth.date() > date.today():
                raise serializers.ValidationError('생년월일은 오늘 날짜 이전이어야 합니다.')
        except ValueError:
            raise serializers.ValidationError(DATE_FORMAT_ERROR)

        return value

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

class LoginSerializer(serializers.Serializer):
    email = CustomEmailField()
    password = CustomCharField(
        write_only=True,
        label='비밀번호'
    )

    def validate_email(self, value):
        if not User.objects.filter(email=value, is_active=True).exists():
            raise serializers.ValidationError('입력한 이메일은 등록되어 있지 않습니다.')
        return value

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(email=email, password=password)
        if user is None:
            if User.objects.filter(email=email).exists():
                raise serializers.ValidationError('비밀번호가 일치하지 않습니다. 확인 후 다시 시도해 주세요.')
            raise serializers.ValidationError('입력한 이메일은 등록되어 있지 않습니다.')

        data['user'] = user
        return data

class FindEmailRequestSerializer(serializers.ModelSerializer):
    birth = CustomCharField(
        max_length=8,
        min_length=8,
        error_messages={
            'invalid': DATE_FORMAT_ERROR,
            'min_length': DATE_FORMAT_ERROR,
            'max_length': DATE_FORMAT_ERROR
        }
    )

    class Meta:
        model = User
        fields = ('name', 'birth',)

    def validate_birth(self, value):
        try:
            birth = datetime.strptime(value, '%Y%m%d')
            if birth.date() > date.today():
                raise serializers.ValidationError('생년월일은 오늘 날짜 이전이어야 합니다.')
        except ValueError:
            raise serializers.ValidationError(DATE_FORMAT_ERROR)

        return value

class FindEmailResponseSerializer(serializers.ModelSerializer):
    joined_on = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('email', 'joined_on',)

    def get_joined_on(self, instance):
        return instance.created_at.strftime('%Y-%m-%d')

class ResetPasswordRequestSerializer(serializers.Serializer):
    name = CustomCharFieldWithConsonant(label='성명')
    email = CustomEmailField()

class ResetPasswordEmailCheckSerializer(serializers.Serializer):
    password1 = CustomCharField(label='비밀번호')
    password2 = CustomCharField(label='비밀번호 확인')

class ResetPasswordSerializer(serializers.Serializer):
    email = CustomEmailField()
    password1 = CustomCharField(label='비밀번호')
    password2 = CustomCharField(label='비밀번호 확인')