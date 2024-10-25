from rest_framework.decorators import api_view
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.response import Response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

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
@api_view(['GET'])
def handle_coin(request):
    if request.method == 'GET':
        user_id = request.auth['id']
        user = User.objects.get(pk=user_id)
        return Response({'coin': user.coin_amount}, status=status.HTTP_200_OK)