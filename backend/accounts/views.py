import re
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from jwt import decode
from jwt.exceptions import ExpiredSignatureError, InvalidTokenError
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import check_password
from django_redis import get_redis_connection
from django.conf import settings

from proctormatic.utils import ok_response, ok_with_data_response, bad_request_response, conflict_response, \
    created_response, no_content_response, bad_request_invalid_data_response, unauthorized_response, not_found_response
from .authentications import CustomAuthentication
from .utils import generate_verification_code, send_verification_email, save_verification_code_to_redis
from .serializers import CustomTokenObtainPairSerializer, SendEmailVerificationSerializer, EmailVerificationSerializer, \
    UserSerializer, UserInfoSerializer, EditMarketingSerializer, FindEmailRequestSerializer, \
    FindEmailResponseSerializer, ResetPasswordRequestSerializer, ResetPasswordEmailCheckSerializer, LoginSerializer, \
    ResetPasswordSerializer
from .swagger_schemas import email_verification_schema, user_schema, token_schema, find_email_schema, \
    reset_password_schema, reset_password_without_login_schema

User = get_user_model()


@email_verification_schema
@api_view(['GET', 'POST', 'PUT'])
@permission_classes([AllowAny])
def handle_email_verification(request):
    if request.method == 'GET':
        email = request.query_params.get('email')

        if not is_valid_email(email):
            return bad_request_response('이메일 형식을 확인해주세요.')

        if email:
            email_exists = User.objects.filter(email=email).exists()
            return ok_with_data_response({'isAlreadyExists': email_exists})
        else:
            return bad_request_response('이메일을 입력해주세요.')

    elif request.method == 'POST':
        serializer = SendEmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            re_enter = serializer.validated_data.get('re_enter')

            if re_enter == False:
                if User.objects.filter(email=email).exists():
                    return conflict_response('이미 존재하는 이메일입니다. 다른 이메일을 사용해주세요.')

            code = generate_verification_code()
            send_verification_email(email, code)
            save_verification_code_to_redis(email, code)

            return ok_response('인증번호를 발송했습니다.')

        error_message = next(iter(serializer.errors.values()))[0]
        return bad_request_response(error_message)

    elif request.method == 'PUT':
        serializer = EmailVerificationSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            code = serializer.validated_data.get('code')

            redis_conn = get_redis_connection('default')
            stored_code = redis_conn.get(f'verification_code:{email}')

            if stored_code is None:
                return bad_request_response('인증번호가 만료되었습니다.')

            if stored_code.decode('utf-8') == code:
                return ok_response('이메일 인증이 완료되었습니다.')
            else:
                return bad_request_response('잘못된 인증번호입니다.')

        error_message = next(iter(serializer.errors.values()))[0]
        return bad_request_response(error_message)


@user_schema
@api_view(['GET', 'POST', 'PUT', 'PATCH'])
@authentication_classes([CustomAuthentication])
@permission_classes([AllowAny])
def handle_user(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            if User.objects.filter(email=email).exists():
                return conflict_response('이미 존재하는 이메일입니다. 다른 이메일을 이용해주세요.')

            serializer.save()
            return created_response('회원가입이 완료되었습니다.')

        error_message = next(iter(serializer.errors.values()))[0]
        return bad_request_response(error_message)

    user = request.user

    if request.method == 'GET':
        serializer = UserInfoSerializer(user)
        return ok_with_data_response(serializer.data)

    elif request.method == 'PUT':
        serializer = EditMarketingSerializer(data=request.data)
        if serializer.is_valid():
            user.marketing = serializer.data.get('marketing')
            user.save()
            return ok_response('마케팅 활용 및 광고 수신 여부가 수정되었습니다.')
        return bad_request_invalid_data_response()

    elif request.method == 'PATCH':
        user.is_active = False
        user.save()
        return no_content_response('회원 탈퇴를 완료했습니다.')


@token_schema
@api_view(['POST', 'PATCH'])
@permission_classes([AllowAny])
def handle_token(request):
    if request.method == 'POST':
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data.get('user')

            token_serializer = CustomTokenObtainPairSerializer()
            token_serializer.user = user
            token_data = token_serializer.validate({})
            return ok_with_data_response(token_data)

        error_message = next(iter(serializer.errors.values()))[0]
        return bad_request_response(error_message)

    elif request.method == 'PATCH':
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return bad_request_response('refresh token이 입력되지 않았습니다.')

        try:
            try:
                decode(refresh_token, settings.SECRET_KEY, algorithms=['HS256'])
            except ExpiredSignatureError:
                return unauthorized_response('토큰이 만료되었습니다. 다시 로그인 해주세요.')
            except InvalidTokenError:
                return bad_request_response('유효하지 않은 토큰입니다.')

            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)
            return ok_with_data_response({'access': new_access_token})

        except TokenError:
            return bad_request_response('토큰 오류가 발생했습니다. 다시 시도해 주세요.')


@find_email_schema
@api_view(['POST'])
@permission_classes([AllowAny])
def find_email(request):
    request_serializer = FindEmailRequestSerializer(data=request.data)
    if request_serializer.is_valid():
        name = request_serializer.validated_data.get('name')
        birth = request_serializer.validated_data.get('birth')
        user_list = User.objects.filter(name=name, birth=birth, is_active=True).order_by('-created_at')

        response_serializer = FindEmailResponseSerializer(user_list, many=True)
        return ok_with_data_response({
            'emailList': response_serializer.data,
            'size': len(response_serializer.data),
        })

    error_message = next(iter(request_serializer.errors.values()))[0]
    return bad_request_response(error_message)


@reset_password_schema
@api_view(['POST', 'PUT'])
@authentication_classes([CustomAuthentication])
@permission_classes([AllowAny])
def reset_password(request):
    if request.method == 'POST':
        serializer = ResetPasswordRequestSerializer(data=request.data)

        if serializer.is_valid():
            name = serializer.validated_data.get('name')
            email = serializer.validated_data.get('email')

            if not User.objects.filter(name=name, email=email, is_active=True).exists():
                return not_found_response('가입된 회원이 아닙니다. 성명과 이메일을 확인해주세요.')

            code = generate_verification_code()
            send_verification_email(email, code)
            save_verification_code_to_redis(email, code)

            return ok_response('인증번호를 발송했습니다.')

        error_message = next(iter(serializer.errors.values()))[0]
        return bad_request_response(error_message)

    elif request.method == 'PUT':
        user = request.user

        serializer = ResetPasswordEmailCheckSerializer(data=request.data)
        if serializer.is_valid():
            password1 = serializer.validated_data.get('password1')
            password2 = serializer.validated_data.get('password2')
            return update_password(user, password1, password2)

        error_message = next(iter(serializer.errors.values()))[0]
        return bad_request_response(error_message)


@reset_password_without_login_schema
@api_view(['PUT'])
@permission_classes([AllowAny])
def reset_password_without_login(request):
    if request.method == 'PUT':
        serializer = ResetPasswordSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            password1 = serializer.validated_data.get('password1')
            password2 = serializer.validated_data.get('password2')

            user = User.objects.filter(email=email, is_active=True).first()

            if user is None:
                return not_found_response('가입되지 않은 사용자입니다.')
            return update_password(user, password1, password2)

        error_message = next(iter(serializer.errors.values()))[0]
        return bad_request_response(error_message)


def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

    if re.match(email_regex, email):
        return True
    return False


def update_password(user, password1, password2):
    if password1 != password2:
        return bad_request_response('비밀번호가 일치하지 않습니다.')
    if len(password1) < 8:
        return bad_request_response('비밀번호는 최소 8자리입니다.')
    if check_password(password1, user.password):
        return conflict_response('기존 비밀번호와 다른 비밀번호를 입력해주세요.')

    user.set_password(password1)
    user.save()
    return ok_response('비밀번호가 성공적으로 변경되었습니다.')