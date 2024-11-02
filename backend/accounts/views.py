import re
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.hashers import check_password
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter, OpenApiResponse, OpenApiRequest
from django_redis import get_redis_connection

from .utils import generate_verification_code, send_verification_email, save_verification_code_to_redis
from .serializers import CustomTokenObtainPairSerializer, UserSerializer, UserInfoSerializer, EditMarketingSerializer, \
    FindEmailRequestSerializer, FindEmailResponseSerializer, ResetPasswordRequestSerializer, \
    ResetPasswordEmailCheckSerializer

User = get_user_model()


@extend_schema_view(
    get=extend_schema(
        summary='이메일 중복체크',
        parameters=[
            OpenApiParameter(name='email', type=str, location=OpenApiParameter.QUERY, required=True)
        ],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='이메일 중복체크 결과',
                response={
                    'type': 'object',
                    'properties': {
                        'isAlreadyExists': {
                            'type': 'boolean',
                        }
                    }
                }
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 이메일 형식 또는 이메일 미제공',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
        }
    ),
    post=extend_schema(
        summary='이메일 인증번호 발송',
        request=OpenApiRequest({
            'type': 'object',
            'properties': {
                'email': {
                    'type': 'string',
                }
            }
        }),
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='인증번호 발송 성공',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 이메일 형식 또는 이메일 미제공',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
        }
    ),
    put=extend_schema(
        summary='이메일 인증',
        request=OpenApiRequest({
            'type': 'object',
            'properties': {
                'email': {
                    'type': 'string',
                },
                'code': {
                    'type': 'string',
                }
            }
        }),
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='인증번호 인증 완료',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 인증번호 또는 만료된 인증번호',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
        }
    )
)
@api_view(['GET', 'POST', 'PUT'])
@permission_classes([AllowAny])
def handle_email_verification(request):
    if request.method == 'GET':
        email = request.query_params.get('email')

        if not is_valid_email(email):
            return Response({'message': '이메일 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

        if email:
            email_exists = User.objects.filter(email=email).exists()
            return Response({'isAlreadyExists': email_exists}, status=status.HTTP_200_OK)
        else:
            return Response({'message': '이메일을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'POST':
        email = request.data.get('email')
        if email:
            if not is_valid_email(email):
                return Response({'message': '이메일 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

            code = generate_verification_code()
            send_verification_email(email, code)
            save_verification_code_to_redis(email, code)

            return Response({'message': '인증번호를 발송했습니다.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': '이메일을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        email = request.data.get('email')
        code = request.data.get('code')

        if not email:
            return Response({'message': '이메일을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
        if not code:
            return Response({'message': '인증번호를 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

        redis_conn = get_redis_connection('default')
        stored_code = redis_conn.get(f'verification_code:{email}')

        if stored_code is None:
            return Response({'message': '인증번호가 만료되었습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        if stored_code.decode('utf-8') == code:
            return Response({'message': '이메일 인증이 완료되었습니다.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': '잘못된 인증번호입니다.'}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    get=extend_schema(
        summary='회원정보 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='회원정보 조회 성공',
                response=UserSerializer
            ),
            status.HTTP_401_UNAUTHORIZED: OpenApiResponse(
                description='인증 실패',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            )
        }
    ),
    post=extend_schema(
        summary='회원가입',
        request=UserSerializer,
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description='회원가입 성공',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 요청',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
            status.HTTP_409_CONFLICT: OpenApiResponse(
                description='이미 존재하는 이메일',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            )
        }
    ),
    put=extend_schema(
        summary='마케팅 활용 및 광고 수신 여부 수정',
        request=OpenApiRequest({
            'type': 'object',
            'properties': {
                'marketing': {
                    'type': 'boolean',
                }
            }
        }),
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='마케팅 활용 및 광고 수신 여부 수정 완료',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 인증번호 또는 만료된 인증번호',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
        }
    ),
    patch=extend_schema(
        summary='회원 탈퇴',
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(description='회원 탈퇴 성공'),
            status.HTTP_401_UNAUTHORIZED: OpenApiResponse(
                description='인증 실패',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            )
        }
    )
)
@api_view(['GET', 'POST', 'PUT', 'PATCH'])
@permission_classes([AllowAny])
def handle_user(request):
    if request.method == 'POST':
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get('email')
            if User.objects.filter(email=email).exists():
                return Response({'message': '이미 존재하는 이메일입니다. 다른 이메일을 이용해주세요.'}, status=status.HTTP_409_CONFLICT)

            serializer.save()
            return Response({"message": "회원가입이 완료되었습니다."}, status=status.HTTP_201_CREATED)

        error_message = next(iter(serializer.errors.values()))[0]
        return Response({"message": error_message}, status=status.HTTP_400_BAD_REQUEST)
    else:
        if not request.user.is_authenticated:
            return Response({'message': '만료된 토큰입니다.'}, status=status.HTTP_401_UNAUTHORIZED)

        user = find_user_by_token(request)

        if request.method == 'GET':
            serializer = UserInfoSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)

        elif request.method == 'PUT':

            serializer = EditMarketingSerializer(data=request.data)
            if serializer.is_valid():
                user.marketing = serializer.data.get('marketing')
                user.save()
                return Response({'message': '마케팅 활용 및 광고 수신 여부가 수정되었습니다.'}, status=status.HTTP_200_OK)

        elif request.method == 'PATCH':
            user.is_active = False
            user.save()
            return Response({'message': '회원 탈퇴를 완료했습니다.'}, status=status.HTTP_204_NO_CONTENT)


@extend_schema_view(
    post=extend_schema(
        summary='로그인',
        request=OpenApiRequest({
            'type': 'object',
            'properties': {
                'email': {
                    'type': 'string',
                },
                'password': {
                    'type': 'string',
                }
            }
        }),
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description='로그인 성공',
                response={
                    'type': 'object',
                    'properties': {
                        'access': {
                            'type': 'string'
                        },
                        'refresh': {
                            'type': 'string'
                        }
                    }
                }
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 요청',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
            status.HTTP_401_UNAUTHORIZED: OpenApiResponse(
                description='인증 실패 or 탈퇴한 사용자',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            )
        }
    ),
    patch=extend_schema(
        summary='accessToken 재발급',
        request=OpenApiRequest({
            'type': 'object',
            'properties': {
                'refresh': {
                    'type': 'string',
                }
            }
        }),
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='토큰 재발급 성공',
                response={
                    'type': 'object',
                    'properties': {
                        'access': {
                            'type': 'string'
                        },
                    }
                }
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 요청',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            )
        }
    )
)
@api_view(['POST', 'PATCH'])
@permission_classes([AllowAny])
def handle_token(request):
    if request.method == 'POST':
        email = request.data.get('email')
        password = request.data.get('password')

        if not email:
            return Response({'message': '이메일을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

        if not password:
            return Response({'message': '비밀번호를 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email, is_active=True).first()
        if user is None:
            return Response({'message': '입력한 이메일은 등록되어 있지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(email=email, password=password)
        if user is None:
            return Response({'message': '비밀번호가 일치하지 않습니다. 확인 후 다시 시도해 주세요.'}, status=status.HTTP_400_BAD_REQUEST)

        if not user.is_active:
            return Response({'message': '탈퇴한 사용자입니다.'}, status=status.HTTP_401_UNAUTHORIZED)

        serializer = CustomTokenObtainPairSerializer()
        serializer.user = user
        token_data = serializer.validate({})
        return Response(token_data, status=status.HTTP_200_OK)

    elif request.method == 'PATCH':
        refresh_token = request.data.get('refresh')

        if not refresh_token:
            return Response({'message': 'refresh token이 입력되지 않았습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            refresh = RefreshToken(refresh_token)
            new_access_token = str(refresh.access_token)
            return Response({'access': new_access_token}, status=status.HTTP_200_OK)

        except TokenError as e:
            if isinstance(e, InvalidToken):
                return Response({'message': '유효하지 않은 토큰입니다.'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'message': '토큰이 만료되었습니다. 다시 로그인 해주세요.'}, status=status.HTTP_401_UNAUTHORIZED)

@extend_schema_view(
    post=extend_schema(
        summary='이메일 찾기',
        request=FindEmailRequestSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='이메일 찾기 성공',
                response=FindEmailResponseSerializer(many=True)
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 요청',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            )
        }
    )
)
@api_view(['POST'])
@permission_classes([AllowAny])
def find_email(request):
    request_serializer = FindEmailRequestSerializer(data=request.data)
    if request_serializer.is_valid():
        name = request_serializer.validated_data.get('name')
        birth = request_serializer.validated_data.get('birth')
        user_list = User.objects.filter(name=name, birth=birth, is_active=True).order_by('-created_at')

        response_serializer = FindEmailResponseSerializer(user_list, many=True)
        return Response({
            'emailList': response_serializer.data,
            'size': len(response_serializer.data)
        }, status=status.HTTP_200_OK)

    error_message = next(iter(request_serializer.errors.values()))[0]
    return Response({"message": error_message}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    post=extend_schema(
        summary='비밀번호 재설정 이메일 인증번호 발송',
        request=ResetPasswordRequestSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='인증번호 발송 성공',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 이메일 형식 또는 이메일 미제공',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='존재하지 않는 회원',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            )
        }
    ),
    put=extend_schema(
        summary='비밀번호 재설정',
        request=ResetPasswordEmailCheckSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='비밀번호 재설정 완료',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='비밀번호 미입력 또는 불일치',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
            status.HTTP_401_UNAUTHORIZED: OpenApiResponse(
                description='인증 실패',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            )
        }
    )
)
@api_view(['POST', 'PUT'])
@permission_classes([AllowAny])
def reset_password(request):
    if request.method == 'POST':
        serializer = ResetPasswordRequestSerializer(data=request.data)

        if serializer.is_valid():
            name = serializer.validated_data.get('name')
            email = serializer.validated_data.get('email')

            if not User.objects.filter(name=name, email=email, is_active=True).exists():
                return Response({'message': '가입된 회원이 아닙니다. 성명과 이메일을 확인해주세요.'}, status=status.HTTP_404_NOT_FOUND)

            code = generate_verification_code()
            send_verification_email(email, code)
            save_verification_code_to_redis(email, code)

            return Response({'message': '인증번호를 발송했습니다.'}, status=status.HTTP_200_OK)

        error_message = next(iter(serializer.errors.values()))[0]
        return Response({'message': error_message}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        if not request.user.is_authenticated:
            return Response({'message': '만료된 토큰입니다.'}, status=status.HTTP_401_UNAUTHORIZED)

        user = find_user_by_token(request)

        serializer = ResetPasswordEmailCheckSerializer(data=request.data)
        if serializer.is_valid():
            password1 = serializer.validated_data.get('password1')
            password2 = serializer.validated_data.get('password2')

            if password1 != password2:
                return Response({'message': '비밀번호가 일치하지 않습니다.'}, status=status.HTTP_400_BAD_REQUEST)
            if len(password1) < 8:
                return Response({'message': '비밀번호는 최소 8자리입니다.'}, status=status.HTTP_400_BAD_REQUEST)
            if check_password(password1, user.password):
                return Response({'message': '기존 비밀번호와 동일합니다. 새로운 비밀번호를 입력해주세요.'}, status=status.HTTP_409_CONFLICT)

            user.set_password(password1)
            user.save()
            return Response({'message': '비밀번호가 성공적으로 변경되었습니다.'}, status=status.HTTP_200_OK)


def find_user_by_token(request):
    user_id = request.auth['user_id']
    user = User.objects.get(pk=user_id)

    if not user.is_active:
        return Response({'message': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
    return user


def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'

    if re.match(email_regex, email):
        return True
    return False
