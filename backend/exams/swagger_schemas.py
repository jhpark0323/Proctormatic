from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, OpenApiRequest, extend_schema_view, extend_schema
from rest_framework import status

from .serializers import ExamSerializer, ScheduledExamListSerializer, OngoingExamListSerializer, \
    CompletedExamListSerializer, TakerDetailSerializer, ExamDetailSerializer

create_exam_schema = extend_schema_view(
    post=extend_schema(
        summary='시험 생성',
        request=ExamSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='시험 예약 성공',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='요청 데이터가 유효하지 않거나 서비스 요금이 부족한 경우',
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
                description='권한 없음',
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
                description='응시 시작 시간 설정 오류',
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

scheduled_exam_list_schema = extend_schema_view(
    get=extend_schema(
        summary='예약된 시험 조회',
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, default=1),
            OpenApiParameter(name='size', type=int, location=OpenApiParameter.QUERY, default=10),
        ],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='예약된 시험 목록 조회 성공',
                response=ScheduledExamListSerializer(many=True)
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
                description='권한 없음',
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

ongoing_exam_list_schema = extend_schema_view(
    get=extend_schema(
        summary='진행 중인 시험 조회',
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, default=1),
            OpenApiParameter(name='size', type=int, location=OpenApiParameter.QUERY, default=10),
        ],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='진행 중인 시험 목록 조회 성공',
                response=OngoingExamListSerializer(many=True)
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
                description='권한 없음',
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

completed_exam_list_schema = extend_schema_view(
    get=extend_schema(
        summary='완료된 시험 조회',
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, default=1),
            OpenApiParameter(name='size', type=int, location=OpenApiParameter.QUERY, default=10),
        ],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='완료된  시험 목록 조회 성공',
                response=CompletedExamListSerializer(many=True)
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
                description='권한 없음',
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

exam_detail_schema = extend_schema_view(
    get=extend_schema(
        summary='시험 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='시험 조회 성공',
                response=ExamDetailSerializer
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
                description='권한 없음',
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
                description='시험 미존재',
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
        summary='시험 정보 수정',
        request=ExamSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='시험 정보 수정 완료',
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
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description='권한 없음',
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
                description='시간 또는 비용 입력 오류',
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
    delete=extend_schema(
        summary='시험 삭제',
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(description='시험 삭제 성공'),
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
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description='권한 없음',
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
                description='시간 또는 비용 입력 오류',
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

taker_result_view_schema = extend_schema_view(
    get=extend_schema(
        summary='응시 결과 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='응시 결과 조회 성공',
                response=TakerDetailSerializer
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 요청',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
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
                description='권한 없음',
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
                description='시험 또는 응시자 미존재',
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

