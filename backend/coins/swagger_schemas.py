from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, OpenApiRequest, extend_schema_view, extend_schema
from rest_framework import status

from .serializers import CoinCodeCreateSerializer, CoinCodeSerializer, CoinHistorySerializer

coin_schema = extend_schema_view(
    get=extend_schema(
        summary='적립금 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='적립금 조회 성공',
                response={
                    'type': 'object',
                    'properties': {
                        'coin': {
                            'type': 'integer',
                        }
                    }
                }
            )
        }
    ),
    post=extend_schema(
        summary='적립금 충전',
        request=CoinCodeCreateSerializer,
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description='적립금 충전 완료',
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
                description='적립금 코드 미입력',
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
                description='적립금 코드 미존재',
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

create_coin_code_schema = extend_schema_view(
    post=extend_schema(
        summary='적립금 코드 등록',
        request=CoinCodeSerializer,
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description='코드 생성 완료',
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

coin_history_schema = extend_schema_view(
    get=extend_schema(
        summary='적립금 사용내역 조회',
        parameters=[
            OpenApiParameter(name='type', type=str, location=OpenApiParameter.QUERY),
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, default=1),
            OpenApiParameter(name='size', type=int, location=OpenApiParameter.QUERY, default=10),
        ],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='적립금 사용내역 조회 성공',
                response=CoinHistorySerializer(many=True)
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 페이지 또는 사이즈 요청',
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
            )
        }
    )
)