from email.policy import default

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator
from rest_framework import status
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter, OpenApiResponse, OpenApiRequest
from .models import Coin, CoinCode
from .serializers import CoinCodeSerializer, CoinCodeCreateSerializer, CoinSerializer, CoinHistorySerializer

User = get_user_model()


@extend_schema_view(
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
@api_view(['GET', 'POST'])
def handle_coin(request):
    user = find_user_by_token(request)

    if request.method == 'GET':
        return Response({'coin': user.coin_amount}, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        serializer = CoinCodeCreateSerializer(data=request.data)
        if serializer.is_valid():
            code = serializer.validated_data.get('code')

            if not CoinCode.objects.filter(code=code).exists():
                return Response({'message': '해당 적립금 코드가 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)
            coin_code = CoinCode.objects.get(code=code)

            user.coin_amount += coin_code.amount
            user.save()

            coin_data = {
                'user': user.id,
                'type': 'charge',
                'amount': coin_code.amount,
            }

            serializer = CoinSerializer(data=coin_data)
            if serializer.is_valid(raise_exception=True):
                serializer.save()
                return Response({'message': '적립금 충전 완료'}, status=status.HTTP_201_CREATED)


@extend_schema_view(
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
@api_view(['POST'])
@permission_classes([AllowAny])
def create_coin_code(request):
    serializer = CoinCodeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': '코드 생성 완료'}, status=status.HTTP_201_CREATED)


@extend_schema_view(
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
@api_view(['GET'])
def coin_history(request):
    user = find_user_by_token(request)

    coin_type = request.query_params.get('type')
    history = Coin.objects.filter(user=user.id).order_by('-created_at')
    if coin_type in ['charge', 'use', 'refund']:
        history = history.filter(type=coin_type)

    page = request.GET.get('page', 1)
    size = request.GET.get('size', 10)

    paginator = Paginator(history, size)
    paginated_history = paginator.get_page(page)

    if int(page) <= 0:
        return Response({'message': '잘못된 페이지 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)
    if int(size) <= 0:
        return Response({'message': '잘못된 사이즈 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)

    serializer = CoinHistorySerializer(paginated_history, many=True)
    return Response({
        'coinList': serializer.data,
        "prev": paginated_history.has_previous(),
        "next": paginated_history.has_next(),
        "totalPage": paginator.num_pages,
    }, status=status.HTTP_200_OK)


def find_user_by_token(request):
    user_id = request.auth['user_id']
    user = User.objects.get(pk=user_id)

    if not user.is_active:
        return Response({'message': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
    return user