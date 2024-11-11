from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, OpenApiRequest, extend_schema_view, extend_schema
from rest_framework import status

from .serializers import TakerSerializer

add_taker_schema = extend_schema_view(
    post=extend_schema(
        summary='응시자 등록',
        request=TakerSerializer,
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description='응시자 등록 성공',
                response={
                    'type': 'object',
                    'properties': {
                        'access': {
                            'type': 'string',
                        }
                    }
                }
            ),
            status.HTTP_200_OK: OpenApiResponse(
                description='이미 등록된 응시자의 토큰 재발급',
                response={
                    'type': 'object',
                    'properties': {
                        'access': {
                            'type': 'string',
                        }
                    }
                }
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 요청, 시험이 종료되었는데 요청하는 경우',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description='이미 퇴실한 사용자, 권한이 없는 경우',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string',
                            'example': '이미 퇴실한 사용자입니다.'
                        },
                    },
                }
            ),
            status.HTTP_429_TOO_MANY_REQUESTS: OpenApiResponse(
                description='시험 응시 인원 초과',
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
        summary='시험 종료',
        responses={
            status.HTTP_200_OK: OpenApiResponse(description='시험 종료 성공'),
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
                description='퇴실 불가능',
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

check_email_schema = extend_schema_view(
    get=extend_schema(
        summary='이메일 중복 체크',
        parameters=[
            OpenApiParameter(name='id', type=str, location=OpenApiParameter.QUERY, required=True),
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
                description='잘못된 이메일 형식 또는 시험 ID, 이메일 미제공',
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
                description='존재하지 않는 시험',
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
        summary='이메일 인증번호 발송',
        request=OpenApiRequest({
            'type': 'object',
            'properties': {
                'id': {
                  'type': 'integer'
                },
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

update_taker_schema = extend_schema_view(
    patch=extend_schema(
        summary='신분증 등록',
        request=OpenApiRequest({
            'type': 'object',
            'properties': {
                'id_photo': {
                    'type': 'file'
                },
                'birth': {
                    'type': 'string',
                },
                'verification_rate': {
                    'type': 'integer',
                }
            }
        }),
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='응시자 정보 업데이트 성공',
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
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description='해당하는 role 사용자가 아님',
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
                description='존재하지 않는 응시자',
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

add_web_cam_schame = extend_schema_view(
    post=extend_schema(
        summary='웹캠 파일 추가',
        request=OpenApiRequest({
            'type': 'object',
            'properties': {
                'web_cam': {
                    'type': 'file'
                },
                'start_time': {
                    'type': 'string',
                },
                'end_time': {
                    'type': 'string',
                }
            }
        }),
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='웹캠 저장 성공',
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
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description='해당하는 role 사용자가 아님',
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
                description='존재하지 않는 응시자',
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
add_abnormal_schema = extend_schema(
    summary="이상행동 추가",
    description="특정 taker에게 이상 상태를 추가합니다.",
    request=OpenApiRequest({
        'type': 'object',
        'properties': {
            'type': {
                'type': 'string',
                'enum': [
                    'eyesight', 'absence', 'overcrowded', 'paper', 'pen',
                    'cup', 'watch', 'earphone', 'mobilephone', 'etc'
                ]
            },
            'detected_time': {
                'type': 'string',
                'format': 'time',
                'description': '이상이 감지된 시간 (HH:MM:SS 형식)'
            },
            'end_time': {
                'type': 'string',
                'format': 'time',
                'description': '이상이 종료된 시간 (HH:MM:SS 형식)'
            }
        },
        'required': ['type', 'detected_time', 'end_time']
    }),
    responses={
        status.HTTP_201_CREATED: OpenApiResponse(
            description="이상 상태 추가 성공",
            response={
                'type': 'object',
                'properties': {
                    'message': {
                        'type': 'string',
                        'example': "이상행동 영상이 등록되었습니다."
                    }
                }
            }
        ),
        status.HTTP_400_BAD_REQUEST: OpenApiResponse(
            description="잘못된 요청 데이터 또는 시간 값 오류",
            response={
                'type': 'object',
                'properties': {
                    'message': {'type': 'string'}
                }
            }
        )
    }
)