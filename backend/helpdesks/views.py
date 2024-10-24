from .models import Notification
from .serializers import NotificationCreateSerializer, NotificationListSerializer
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.core.paginator import Paginator

@swagger_auto_schema(
    method='get',
    operation_summary="공지사항 목록 조회",
    operation_description="공지사항의 목록을 페이지네이션 방식으로 가져옵니다. \n페이지 번호와 페이지당 항목 수를 쿼리 파라미터로 입력할 수 있습니다. \npage default = 1, size default = 10",
    manual_parameters=[
        openapi.Parameter('page', openapi.IN_QUERY, description="페이지 번호", type=openapi.TYPE_INTEGER),
        openapi.Parameter('size', openapi.IN_QUERY, description="페이지 당 항목 수", type=openapi.TYPE_INTEGER)
    ],
    responses={
        200: openapi.Response('성공', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'notificationList': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(type=openapi.TYPE_OBJECT, properties={
                        'id': openapi.Schema(type=openapi.TYPE_INTEGER),
                        'title': openapi.Schema(type=openapi.TYPE_STRING),
                        'created_at': openapi.Schema(type=openapi.TYPE_STRING, format='date-time'),
                    })
                ),
                'prev': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                'next': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                'totalPage': openapi.Schema(type=openapi.TYPE_INTEGER),
            }
        )),
        400: openapi.Response('잘못된 요청', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'status': openapi.Schema(type=openapi.TYPE_INTEGER, description='HTTP 상태 코드'),
                'message': openapi.Schema(type=openapi.TYPE_STRING, description='에러 메시지'),
            },
            example={
                "status": 400,
                "message": "잘못된 요청입니다."
            }
        )),
        403: openapi.Response('권한 없음', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'status': openapi.Schema(type=openapi.TYPE_INTEGER, description='HTTP 상태 코드'),
                'message': openapi.Schema(type=openapi.TYPE_STRING, description='에러 메시지'),
            },
            example={
                "status": 403,
                "message": "권한이 없습니다."
            }
        )),
        404: openapi.Response('잘못된 페이지 요청', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'status': openapi.Schema(type=openapi.TYPE_INTEGER, description='HTTP 상태 코드'),
                'message': openapi.Schema(type=openapi.TYPE_STRING, description='에러 메시지'),
            },
            example={
                "status": 404,
                "message": "잘못된 페이지 요청입니다."
            }
        )),
    }
)
@api_view(['GET','POST'])
def notification(request):
    if request.method == 'POST':
        serializer = NotificationCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': '공지사항이 등록되었습니다.'}, status=status.HTTP_201_CREATED)
        return Response({'message': '잘못된 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)
    else:
        notifications = Notification.objects.all()
        page = request.GET.get('page', 1)
        size = request.GET.get('size', 10)
        paginator = Paginator(notifications, size)
        page_obj = paginator.get_page(page)
        serializer = NotificationListSerializer(page_obj, many=True)
        data = {
            "notificationList": serializer.data,
            "prev": page_obj.has_previous(),
            "next": page_obj.has_next(),
            "totalPage": paginator.num_pages,
        }
        return Response(data, status=status.HTTP_200_OK)
