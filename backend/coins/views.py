from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator
from rest_framework import status
from rest_framework.response import Response

from accounts.authentications import CustomAuthentication
from .models import Coin, CoinCode
from .serializers import CoinCodeSerializer, CoinCodeCreateSerializer, CoinSerializer, CoinHistorySerializer
from .swagger_schemas import coin_schema, create_coin_code_schema, coin_history_schema

User = get_user_model()


@coin_schema
@api_view(['GET', 'POST'])
@authentication_classes([CustomAuthentication])
def handle_coin(request):
    user = request.user

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

        error_message = next(iter(serializer.errors.values()))[0]
        return Response({'message': error_message}, status=status.HTTP_400_BAD_REQUEST)


@create_coin_code_schema
@api_view(['POST'])
@permission_classes([AllowAny])
def create_coin_code(request):
    serializer = CoinCodeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': '코드 생성 완료'}, status=status.HTTP_201_CREATED)


@coin_history_schema
@api_view(['GET'])
@authentication_classes([CustomAuthentication])
def coin_history(request):
    user = request.user

    coin_type = request.query_params.get('type')
    history = Coin.objects.filter(user=user.id).order_by('-created_at')
    if coin_type in ['charge', 'use', 'refund']:
        history = history.filter(type=coin_type)

    page = request.GET.get('page', 1)
    size = request.GET.get('size', 10)

    if int(page) <= 0:
        return Response({'message': '잘못된 페이지 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)
    if int(size) <= 0:
        return Response({'message': '잘못된 사이즈 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)

    paginator = Paginator(history, size)
    paginated_history = paginator.get_page(page)

    serializer = CoinHistorySerializer(paginated_history, many=True)
    return Response({
        'coinList': serializer.data,
        "prev": paginated_history.has_previous(),
        "next": paginated_history.has_next(),
        "totalPage": paginator.num_pages,
    }, status=status.HTTP_200_OK)