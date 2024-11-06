from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from datetime import date, datetime
from django.contrib.auth import get_user_model, authenticate

User = get_user_model()

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
    email = serializers.EmailField(
        error_messages={
            'required': '이메일을 입력해주세요.',
            'blank': '이메일을 입력해주세요.',
            'invalid': '이메일 형식을 확인해주세요.'
        }
    )

class EmailVerificationSerializer(serializers.Serializer):
    email = serializers.EmailField(
        error_messages={
            'required': '이메일을 입력해주세요.',
            'blank': '이메일을 입력해주세요.',
            'invalid': '이메일 형식을 확인해주세요.'
        }
    )
    code = serializers.CharField(
        error_messages={
            'required': '인증번호를 입력해주세요.',
            'blank': '인증번호를 입력해주세요.'
        }
    )

class UserSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(
        error_messages={
            'invalid': "잘못된 이메일 형식입니다."
        }
    )
    birth = serializers.CharField(
        error_messages={
            'invalid': "날짜 형식이 올바르지 않습니다. YYYYMMDD 형식이어야 합니다."
        }
    )

    class Meta:
        model = User
        fields = ('name', 'email', 'password', 'birth', 'policy', 'marketing',)
        extra_kwargs = {'password': {'write_only': True, 'min_length': 8}}

    def validate_birth(self, value):
        if not value.isdigit() or len(value) != 8:
            raise serializers.ValidationError("날짜 형식이 올바르지 않습니다. YYYYMMDD 형식이어야 합니다.")

        try:
            birth = datetime.strptime(value, '%Y%m%d')
            if birth.date() > date.today():
                raise serializers.ValidationError('생년월일은 오늘 날짜 이전이어야 합니다.')
        except ValueError:
            raise serializers.ValidationError("날짜 형식이 올바르지 않습니다. YYYYMMDD 형식이어야 합니다.")

        return birth

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
    email = serializers.EmailField(
        error_messages={
            'required': '이메일을 입력해주세요.',
            'blank': '이메일을 입력해주세요.',
            'invalid': '이메일 형식을 확인해주세요.'
        }
    )
    password = serializers.CharField(
        write_only=True,
        error_messages={
            'required': '비밀번호를 입력해주세요.',
            'blank': '비밀번호를 입력해주세요.',
        }
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

        if not user.is_active:
            raise serializers.ValidationError('탈퇴한 사용자입니다.')

        data['user'] = user
        return data

class FindEmailRequestSerializer(serializers.ModelSerializer):
    birth = serializers.CharField(
        error_messages={
            'invalid': "날짜 형식이 올바르지 않습니다. YYYYMMDD 형식이어야 합니다."
        }
    )

    class Meta:
        model = User
        fields = ('name', 'birth',)

    def validate_birth(self, value):
        if not value.isdigit() or len(value) != 8:
            raise serializers.ValidationError("날짜 형식이 올바르지 않습니다. YYYYMMDD 형식이어야 합니다.")

        try:
            birth = datetime.strptime(value, '%Y%m%d')
            if birth.date() > date.today():
                raise serializers.ValidationError('생년월일은 오늘 날짜 이전이어야 합니다.')
        except ValueError:
            raise serializers.ValidationError("날짜 형식이 올바르지 않습니다. YYYYMMDD 형식이어야 합니다.")

        return birth

class FindEmailResponseSerializer(serializers.ModelSerializer):
    joined_on = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('email', 'joined_on',)

    def get_joined_on(self, instance):
        return instance.created_at.strftime('%Y-%m-%d')

class ResetPasswordRequestSerializer(serializers.Serializer):
    name = serializers.CharField(required=True, error_messages={
        'required': '성명을 입력해주세요.',
        'blank': '성명을 입력해주세요.',
    })
    email = serializers.EmailField(required=True, error_messages={
        'required': '이메일을 입력해주세요.',
        'blank': '이메일을 입력해주세요.',
        'invalid': '잘못된 이메일 형식입니다.',
    })

class ResetPasswordEmailCheckSerializer(serializers.Serializer):
    password1 = serializers.CharField(required=True, error_messages={
        'required': '비밀번호가 입력되지 않았습니다.'
    })
    password2 = serializers.CharField(required=True, error_messages={
        'required': '비밀번호 확인이 입력되지 않았습니다.'
    })