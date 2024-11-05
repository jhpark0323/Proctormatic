from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, OpenApiRequest, extend_schema_view, extend_schema
from rest_framework import status

from .serializers import SendEmailVerificationSerializer, EmailVerificationSerializer, UserSerializer, \
    FindEmailRequestSerializer, FindEmailResponseSerializer, ResetPasswordEmailCheckSerializer, \
    ResetPasswordRequestSerializer

email_verification_schema = extend_schema_view(
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
        request=SendEmailVerificationSerializer,
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
        summary='이메일 인증',
        request=EmailVerificationSerializer,
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

user_schema = extend_schema_view(
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

token_schema = extend_schema_view(
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

find_email_schema = extend_schema_view(
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

reset_password_schema = extend_schema_view(
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
