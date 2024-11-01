from .models import Notification, Question, Faq
from .serializers import NotificationCreateSerializer, NotificationListSerializer, NotificationObjectSerializer, \
    FaqCreateSerializer, FaqListSerializer, FaqSerializer, QuestionSerializer, QuestionEditSerializer, \
    QuestionCreateSerializer, QuestionListSerializer
from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter, OpenApiResponse, OpenApiRequest
from django.core.paginator import Paginator

User = get_user_model()


@extend_schema_view(
    get=extend_schema(
        summary='공지사항 목록 조회',
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, default=1),
            OpenApiParameter(name='size', type=int, location=OpenApiParameter.QUERY, default=10),
        ],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='공지사항 목록 조회 성공',
                response=NotificationListSerializer(many=True),
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 페이지 또는 사이즈 요청',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
        }
    ),
    post=extend_schema(
        summary='공지사항 등록',
        request=NotificationCreateSerializer,
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description='공지사항 등록 완료',
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
@permission_classes([AllowAny])
def notification(request):
    if request.method == 'POST':
        serializer = NotificationCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': '공지사항이 등록되었습니다.'}, status=status.HTTP_201_CREATED)
    elif request.method == 'GET':
        notifications = Notification.objects.all()
        page = request.GET.get('page', 1)
        size = request.GET.get('size', 10)
        if int(page) <= 0:
            return Response({'message': '잘못된 페이지 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)
        if int(size) <= 0:
            return Response({'message': '잘못된 사이즈 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)
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


@extend_schema_view(
    get=extend_schema(
        summary='공지사항 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='공지사항 조회 성공',
                response=NotificationObjectSerializer
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='공지사항 미존재',
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
    delete=extend_schema(
        summary='공지사항 삭제',
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(description='공지사항 삭제 성공'),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='공지사항 미존재',
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
@api_view(['GET', 'DELETE'])
@permission_classes([AllowAny])
def check_notification(request, notification_id):
    try:
        notification = Notification.objects.get(pk=notification_id)
    except:
        return Response({'message': '공지 사항이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = NotificationObjectSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema_view(
    get=extend_schema(
        summary='질문 목록 조회',
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, default=1),
            OpenApiParameter(name='size', type=int, location=OpenApiParameter.QUERY, default=10),
        ],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='질문 목록 조회 성공',
                response=QuestionListSerializer(many=True),
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 페이지 또는 사이즈 요청',
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
            )
        }
    ),
    post=extend_schema(
        summary='질문 등록',
        request=QuestionCreateSerializer,
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description='질문 등록 완료',
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
                description='잘못된 요청',
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
            )
        }
    )
)
@api_view(['POST', 'GET'])
def question(request):
    user = find_user_by_token(request)

    if request.method == 'POST':
        serializer = QuestionCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user.id)
            return Response({'message': '등록이 완료되었습니다.'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': '제목은 100자를 넘길 수 없습니다.'}, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'GET':
        questions = Question.objects.filter(user_id=user.id)
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


@extend_schema_view(
    get=extend_schema(
        summary='질문 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='질문 조회 성공',
                response=QuestionSerializer
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='질문 미존재',
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
        summary='질문 수정',
        request=QuestionEditSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='질문 수정 완료',
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
                description='잘못된 요청',
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
                description='질문 미존재',
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
    delete=extend_schema(
        summary='질문 삭제',
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(description='질문 삭제 성공'),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 요청',
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
                description='질문 미존재',
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
@api_view(['GET', 'PUT', 'DELETE'])
def question_detail(request, question_id):
    user_id = request.auth['user_id']

    try:
        question = Question.objects.get(pk=question_id, user_id=user_id)
    except:
        return Response({'message': '질문이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = QuestionSerializer(question)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        serializer = QuestionEditSerializer(question, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': '질문이 수정되었습니다.'}, status=status.HTTP_200_OK)
        return Response({'message': '잘못된 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        question.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema_view(
    get=extend_schema(
        summary='자주 묻는 질문 목록 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='자주 묻는 질문 목록 조회 성공',
                response=FaqListSerializer(many=True),
            )
        }
    ),
    post=extend_schema(
        summary='자주 묻는 질문 등록',
        request=FaqCreateSerializer,
        responses={
            status.HTTP_201_CREATED: OpenApiResponse(
                description='자주 묻는 질문 등록 완료',
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


@extend_schema_view(
    get=extend_schema(
        summary='자주 묻는 질문 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='자주 묻는 질문 조회 성공',
                response=FaqSerializer
            ),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='자주 묻는 질문 미존재',
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
    delete=extend_schema(
        summary='자주 묻는 질문 삭제',
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(description='자주 묻는 질문 삭제 성공'),
            status.HTTP_404_NOT_FOUND: OpenApiResponse(
                description='자주 묻는 질문 미존재',
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
@api_view(['GET', 'DELETE'])
@permission_classes([AllowAny])
def faq_detail(request, faq_id):
    try:
        faq = Faq.objects.get(id=faq_id)
    except:
        return Response({'message': '자주 묻는 질문이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = FaqSerializer(faq)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        faq.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


def find_user_by_token(request):
    user_id = request.auth['user_id']
    user = User.objects.get(pk=user_id)

    if not user.is_active:
        return Response({'message': '권한이 없습니다.'}, status=status.HTTP_403_FORBIDDEN)
    return user