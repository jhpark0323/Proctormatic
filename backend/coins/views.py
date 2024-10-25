from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from coins.models import CoinCode
from coins.serializers import CoinCodeSerializer, CoinCodeCreateSerializer, CoinSerializer

User = get_user_model()

@swagger_auto_schema(
    method='get',
    operation_summary="적립금 조회",
    manual_parameters=[
        openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING)
    ],
    responses={
        200: openapi.Response('적립금 조회 성공', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'isAlreadyExists': openapi.Schema(type=openapi.TYPE_BOOLEAN),
            }
        ))
    }
)
@swagger_auto_schema(
    method='post',
    operation_summary="적립금 충전",
    manual_parameters=[
        openapi.Parameter('Authorization', openapi.IN_HEADER, type=openapi.TYPE_STRING)
    ],
    request_body=CoinCodeCreateSerializer,
    responses={
        201: openapi.Response('적립금 충전 완료', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )),
        400: openapi.Response('적립금 코드를 입력해주세요', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )),
        404: openapi.Response('해당 적립금 코드가 존재하지 않습니다.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        ))
    }
)
@api_view(['GET', 'POST'])
def handle_coin(request):
    user_id = request.auth['id']
    user = User.objects.get(pk=user_id)

    if request.method == 'GET':
        return Response({'coin': user.coin_amount}, status=status.HTTP_200_OK)
    elif request.method == 'POST':
        code = request.data.get('code', None)

        if not code:
            return Response({'message': '적립금 코드를 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

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

@swagger_auto_schema(
    method='post',
    operation_summary="적립금 코드 등록",
    request_body=CoinCodeSerializer,
    responses={
        201: openapi.Response('코드 생성 완료', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING),
            }
        ))
    }
)
@api_view(['POST'])
@permission_classes([AllowAny])
def create_coin_code(request):
    serializer = CoinCodeSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': '코드 생성 완료'}, status=status.HTTP_201_CREATED)