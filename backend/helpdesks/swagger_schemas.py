from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, OpenApiRequest, extend_schema_view, extend_schema
from rest_framework import status

from .serializers import NotificationListSerializer, NotificationCreateSerializer, NotificationObjectSerializer, \
    QuestionListSerializer, QuestionCreateSerializer, QuestionSerializer, QuestionEditSerializer, FaqListSerializer, \
    FaqCreateSerializer, FaqSerializer, AnswerSerializer

notification_schama = extend_schema_view(
    get=extend_schema(
        summary='공지사항 목록 조회',
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, default=1),
            OpenApiParameter(name='size', type=int, location=OpenApiParameter.QUERY, default=10),
        ],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='공지사항 목록 조회 성공',
                response=NotificationListSerializer(many=True),
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 페이지 또는 사이즈 요청',
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
        summary='공지사항 등록',
        request=NotificationCreateSerializer,
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description='공지사항 등록 완료',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    )
)

check_notification_schema = extend_schema_view(
    get=extend_schema(
        summary='공지사항 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='공지사항 조회 성공',
                response=NotificationObjectSerializer
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='공지사항 미존재',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    ),
    delete=extend_schema(
        summary='공지사항 삭제',
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(description='공지사항 삭제 성공'),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='공지사항 미존재',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    )
)

question_schema = extend_schema_view(
    get=extend_schema(
        summary='질문 목록 조회',
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, default=1),
            OpenApiParameter(name='size', type=int, location=OpenApiParameter.QUERY, default=10),
            OpenApiParameter(name='category', type=str, location=OpenApiParameter.QUERY)
        ],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='질문 목록 조회 성공',
                response=QuestionListSerializer(many=True),
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 페이지 또는 사이즈 요청',
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
    ),
    post=extend_schema(
        summary='질문 등록',
        request=QuestionCreateSerializer,
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description='질문 등록 완료',
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
            )
        }
    )
)

question_detail_schema = extend_schema_view(
    get=extend_schema(
        summary='질문 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='질문 조회 성공',
                response=QuestionSerializer
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='질문 미존재',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    ),
    put=extend_schema(
        summary='질문 수정',
        request=QuestionEditSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='질문 수정 완료',
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
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='질문 미존재',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    ),
    delete=extend_schema(
        summary='질문 삭제',
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(description='질문 삭제 성공'),
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
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='질문 미존재',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    )
)

answer_schema = extend_schema_view(
    post=extend_schema(
        summary='답변 등록',
        request=AnswerSerializer,
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description='답변 등록 완료',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='질문 미존재',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    ),
    put=extend_schema(
        summary='답변 수정',
        request=AnswerSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='답변 수정 완료',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='질문 또는 답변 미존재',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    ),
    delete=extend_schema(
        summary='답변 삭제',
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(description='답변 삭제 성공'),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='질문 또는 답변 미존재',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    )
)

answer_admin_schema = extend_schema_view(
    post=extend_schema(
        summary='(관리자)답변 등록',
        request=AnswerSerializer,
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description='답변 등록 완료',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='질문 미존재',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    ),
    put=extend_schema(
        summary='(관리자)답변 수정',
        request=AnswerSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='답변 수정 완료',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='질문 또는 답변 미존재',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    ),
    delete=extend_schema(
        summary='(관리자)답변 삭제',
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(description='답변 삭제 성공'),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='질문 또는 답변 미존재',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    )
)

faq_schema = extend_schema_view(
    get=extend_schema(
        summary='자주 묻는 질문 목록 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='자주 묻는 질문 목록 조회 성공',
                response=FaqListSerializer(many=True),
            )
        }
    ),
    post=extend_schema(
        summary='자주 묻는 질문 등록',
        request=FaqCreateSerializer,
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description='자주 묻는 질문 등록 완료',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    )
)

faq_detail_schema = extend_schema_view(
    get=extend_schema(
        summary='자주 묻는 질문 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='자주 묻는 질문 조회 성공',
                response=FaqSerializer
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='자주 묻는 질문 미존재',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    ),
    delete=extend_schema(
        summary='자주 묻는 질문 삭제',
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(description='자주 묻는 질문 삭제 성공'),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='자주 묻는 질문 미존재',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
                }
            )
        }
    )
)