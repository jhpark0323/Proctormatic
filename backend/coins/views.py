from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from django.core.paginator import Paginator

from accounts.authentications import CustomAuthentication
from proctormatic.utils import ok_with_data_response, not_found_response, created_response, bad_request_response
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
        return ok_with_data_response({'coin': user.coin_amount})
    elif request.method == 'POST':
        serializer = CoinCodeCreateSerializer(data=request.data)
        if serializer.is_valid():
            code = serializer.validated_data.get('code')

            if not CoinCode.objects.filter(code=code).exists():
                return not_found_response('해당 적립금 코드가 존재하지 않습니다.')
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
                return created_response('적립금 충전 완료')

        error_message = next(iter(serializer.errors.values()))[0]
        return bad_request_response(error_message)


@create_coin_code_schema
@api_view(['POST'])
@permission_classes([AllowAny])
def create_coin_code(request):
    serializer = CoinCodeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return created_response('코드 생성 완료')


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
        return bad_request_response('잘못된 페이지 요청입니다.')
    if int(size) <= 0:
        return bad_request_response('잘못된 사이즈 요청입니다.')

    paginator = Paginator(history, size)
    paginated_history = paginator.get_page(page)

    serializer = CoinHistorySerializer(paginated_history, many=True)
    return ok_with_data_response({
        'coinList': serializer.data,
        "prev": paginated_history.has_previous(),
        "next": paginated_history.has_next(),
        "totalPage": paginator.num_pages,
    })