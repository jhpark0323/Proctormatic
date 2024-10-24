from .models import Notification
from .serializers import NotificationCreateSerializer
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

@swagger_auto_schema(
    method='post',
    request_body=NotificationCreateSerializer,
    responses={
        201: openapi.Response('공지 생성 완료', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )),
        400: openapi.Response('공지 생성 실패', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )),
    }
)
@api_view(['POST'])
def create_notification(request):
    serializer = NotificationCreateSerializer(data=request.data)
    print(serializer.errors)
    if serializer.is_valid():
        serializer.save()
        return Response({'message': '공지사항이 등록되었습니다.'}, status=status.HTTP_201_CREATED)
    return Response({'message': '잘못된 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)

