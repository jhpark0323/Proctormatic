from .models import Notification, Question, Faq
from .serializers import NotificationCreateSerializer, NotificationListSerializer, NotificationObjectSerializer, \
    FaqCreateSerializer, FaqListSerializer, FaqSerializer
from .serializers import QuestionCreateSerializer, QuestionListSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
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
                        'created_at': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME),
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
                'message': openapi.Schema(type=openapi.TYPE_STRING, description='에러 메시지'),
            }
        )),
        403: openapi.Response('권한 없음', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, description='에러 메시지'),
            }
        )),
        404: openapi.Response('잘못된 페이지 요청', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, description='에러 메시지'),
            }
        )),
    }
)
@swagger_auto_schema(
    method='post',
    operation_summary="공지사항 등록",
    operation_description="새로운 공지사항을 등록합니다.",
    request_body=NotificationCreateSerializer,
        manual_parameters=[
        openapi.Parameter(
            'Authorization',
            openapi.IN_HEADER,
            description="Bearer 액세스 토큰",
            type=openapi.TYPE_STRING,
            required=True,
        ),
    ],
    responses={
        201: openapi.Response('성공', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING),
            }
        )),
        400: openapi.Response('잘못된 요청', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, description='에러 메시지'),
            }
        )),
    }
)
@api_view(['POST', 'GET'])
@permission_classes([AllowAny])
def notification(request):
    if request.method == 'POST':
        if request.auth['role'] != 'host':
            return Response({'message': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = NotificationCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': '공지사항이 등록되었습니다.'}, status=status.HTTP_201_CREATED)
        return Response({'message': '잘못된 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'GET':
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


@swagger_auto_schema(
    method='GET',
    operation_summary="공지사항 조회",
    operation_description="공지사항 조회페이지",
    responses={
        200: openapi.Response('성공', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'title': openapi.Schema(type=openapi.TYPE_STRING),
                'content': openapi.Schema(type=openapi.TYPE_STRING),
                'created_at': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME),
            }
        )),
        404: openapi.Response('존재하지 않는 공지사항입니다.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, description='에러 메시지'),
            }
        )),
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def check_notification(request, notification_id):
    try:
        notification = Notification.objects.get(pk=notification_id)
    except:
        return Response({'message': '공지 사항이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)
    serializer = NotificationObjectSerializer(notification)
    return Response(serializer.data, status=status.HTTP_200_OK)

@swagger_auto_schema(
    method='get',
    operation_summary="질문 목록 조회",
    operation_description="질문 목록을 페이지네이션 방식으로 조회합니다.",
    manual_parameters=[
        openapi.Parameter('page', openapi.IN_QUERY, description="페이지 번호", type=openapi.TYPE_INTEGER, default=1),
        openapi.Parameter('size', openapi.IN_QUERY, description="페이지 당 항목 수", type=openapi.TYPE_INTEGER, default=10),
        openapi.Parameter(
            'Authorization',
            openapi.IN_HEADER,
            description="Bearer 액세스 토큰",
            type=openapi.TYPE_STRING,
            required=True,
        ),
    ],
    responses={
        200: openapi.Response('성공', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'questionList': openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(type=openapi.TYPE_OBJECT, properties={
                        'Id': openapi.Schema(type=openapi.TYPE_INTEGER, description='질문 Id'),
                        'organizer': openapi.Schema(type=openapi.TYPE_STRING, description='작성자 이름'),
                        'category': openapi.Schema(type=openapi.TYPE_STRING, description='카테고리'),
                        'title': openapi.Schema(type=openapi.TYPE_STRING, description='질문 제목'),
                        'created_at': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME, description='생성일'),
                        'updated_at': openapi.Schema(type=openapi.TYPE_STRING, format=openapi.FORMAT_DATETIME, description='수정일', nullable=True),
                    })
                ),
                'prev': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='이전 페이지 여부'),
                'next': openapi.Schema(type=openapi.TYPE_BOOLEAN, description='다음 페이지 여부'),
                'totalPage': openapi.Schema(type=openapi.TYPE_INTEGER, description='총 페이지 수'),
            }
        )),
        400: openapi.Response('잘못된 요청', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, description='에러 메시지'),
            }
        )),
        404: openapi.Response('잘못된 페이지 요청', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, description='에러 메시지'),
            }
        )),
    }
)
@swagger_auto_schema(
    method='post',
    operation_summary="질문 등록",
    operation_description="새로운 질문을 등록합니다.",
    manual_parameters=[
        openapi.Parameter(
            'Authorization',
            openapi.IN_HEADER,
            description="Bearer 액세스 토큰",
            type=openapi.TYPE_STRING,
            required=True,
        ),
    ],
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        properties={
            'category': openapi.Schema(type=openapi.TYPE_STRING, description='카테고리'),
            'title': openapi.Schema(type=openapi.TYPE_STRING, description='제목 (최대 100자까지 입력 가능)'),
            'content': openapi.Schema(type=openapi.TYPE_STRING, description='내용'),
        },
        required=['category', 'title', 'content']
    ),
    responses={
        201: openapi.Response('등록 성공', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, description='성공 메시지'),
            }
        )),
        400: openapi.Response('잘못된 요청', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, description='에러 메시지: 제목은 100자를 넘을 수 없습니다.'),
            }
        ))
    }
)
@api_view(['POST', 'GET'])
def question(request):
    if request.method == 'POST':
        serializer = QuestionCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response({'message': '등록이 완료되었습니다.'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message' : '제목은 100자를 넘길 수 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'GET':
        questions = Question.objects.all()
        page = request.GET.get('page', 1)
        size = request.GET.get('size', 10)
        if int(page) <= 0:
            return Response({'message': '잘못된 페이지 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)
        if int(size) <= 0:
            return Response({'message': '잘못된 사이즈 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)
        paginator = Paginator(questions, size)
        page_obj = paginator.get_page(page)
        serializer = QuestionListSerializer(page_obj, many=True)
        data = {
            "questionList": serializer.data,
            "prev": page_obj.has_previous(),
            "next": page_obj.has_next(),
            "totalPage": paginator.num_pages,
        }
        return Response(data, status=status.HTTP_200_OK)

@swagger_auto_schema(
    method='get',
    operation_summary="자주 묻는 질문 목록 조회",
    responses={
        200: FaqListSerializer(many=True),
    }
)
@swagger_auto_schema(
    method='post',
    operation_summary="자주 묻는 질문 등록",
    request_body=FaqCreateSerializer,
    responses={
        201: openapi.Response('자주 묻는 질문 등록 성공', schema=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        ))
    }
)
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def faq(request):
    if request.method == 'GET':
        faq_list = Faq.objects.all()
        serializer = FaqListSerializer(faq_list, many=True)
        return Response({'faqList': serializer.data}, status=status.HTTP_200_OK)

    elif request.method == 'POST':
        serializer = FaqCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': '자주 묻는 질문이 등록되었습니다.'}, status=status.HTTP_201_CREATED)

@swagger_auto_schema(
    method='get',
    operation_summary="자주 묻는 질문 조회",
    manual_parameters=[
        openapi.Parameter('faq_id', openapi.IN_PATH, type=openapi.TYPE_INTEGER, required=True)
    ],
    responses={
        200: FaqSerializer(),
        404: openapi.Response('없는 질문 요청', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        ))
    }
)
@api_view(['GET'])
@permission_classes([AllowAny])
def faq_detail(request, faq_id):
    if request.method == 'GET':
        try:
            faq = Faq.objects.get(id=faq_id)
        except:
            return Response({'message': '자주 묻는 질문이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = FaqSerializer(faq)
        return Response(serializer.data, status=status.HTTP_200_OK)