from django.contrib.auth import get_user_model
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.core.paginator import Paginator

from accounts.authentications import CustomAuthentication
from .models import Notification, Question, Faq, Answer
from .serializers import NotificationCreateSerializer, NotificationListSerializer, NotificationObjectSerializer, \
    FaqCreateSerializer, FaqListSerializer, FaqSerializer, QuestionSerializer, QuestionEditSerializer, \
    QuestionCreateSerializer, QuestionListSerializer, AnswerSerializer
from .swagger_schemas import notification_schama, check_notification_schema, question_schema, question_detail_schema, \
    faq_schema, faq_detail_schema, answer_schema, answer_admin_schema

User = get_user_model()


@notification_schama
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def notification(request):
    if request.method == 'POST':
        serializer = NotificationCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': '공지사항이 등록되었습니다.'}, status=status.HTTP_201_CREATED)
        return Response({'message': '잘못된 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)

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

        return Response({
            "notificationList": serializer.data,
            "prev": page_obj.has_previous(),
            "next": page_obj.has_next(),
            "totalPage": paginator.num_pages
        }, status=status.HTTP_200_OK)


@check_notification_schema
@api_view(['GET', 'DELETE'])
@permission_classes([AllowAny])
def check_notification(request, notification_id):
    notification = Notification.objects.filter(pk=notification_id).first()

    if notification is None:
        return Response({'message': '공지 사항이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = NotificationObjectSerializer(notification)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        notification.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@question_schema
@api_view(['POST', 'GET'])
@authentication_classes([CustomAuthentication])
def question(request):
    user = request.user

    if request.method == 'POST':
        serializer = QuestionCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response({'message': '등록이 완료되었습니다.'}, status=status.HTTP_201_CREATED)

        error_message = next(iter(serializer.errors.values()))[0]
        return Response({'message': error_message}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'GET':
        category = request.query_params.get('category')
        questions = Question.objects.filter(user_id=user.id).order_by('-created_at')
        if category in ['usage', 'coin', 'etc']:
            questions = questions.filter(category=category)

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


@question_detail_schema
@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([CustomAuthentication])
def question_detail(request, question_id):
    user = request.user
    question = Question.objects.filter(pk=question_id, user_id=user.id).first()
    if question is None:
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


@answer_schema
@api_view(['POST'])
def create_answer(request, question_id):
    user = request.user

    question = Question.objects.filter(pk=question_id, user_id=user.id).first()
    if question is None:
        return Response({'message': '질문이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        serializer = AnswerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(question=question, author=user.name)
            return Response({'message': '답변이 등록되었습니다.'}, status=status.HTTP_201_CREATED)


@answer_schema
@api_view(['PUT', 'DELETE'])
def handle_answer(request, question_id, answer_id):
    user = request.user

    question = Question.objects.filter(pk=question_id, user_id=user.id).first()
    if question is None:
        return Response({'message': '질문이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)
    answer = Answer.objects.filter(pk=answer_id, author=user.name).first()
    if answer is None:
        return Response({'message': '답변이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = AnswerSerializer(answer, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': '답변이 수정되었습니다.'}, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        answer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@answer_admin_schema
@api_view(['POST'])
@permission_classes([AllowAny])
def create_answer_admin(request, question_id):
    question = Question.objects.filter(pk=question_id).first()
    if question is None:
        return Response({'message': '질문이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'POST':
        serializer = AnswerSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(question=question, author='admin')
            return Response({'message': '답변이 등록되었습니다.'}, status=status.HTTP_201_CREATED)


@answer_admin_schema
@api_view(['PUT', 'DELETE'])
@permission_classes([AllowAny])
def handle_answer_admin(request, question_id, answer_id):
    question = Question.objects.filter(pk=question_id).first()
    if question is None:
        return Response({'message': '질문이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)
    answer = Answer.objects.filter(pk=answer_id).first()
    if answer is None:
        return Response({'message': '답변이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PUT':
        serializer = AnswerSerializer(answer, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({'message': '답변이 수정되었습니다.'}, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        answer.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@faq_schema
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
        return Response({'message': '잘못된 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)


@faq_detail_schema
@api_view(['GET', 'DELETE'])
@permission_classes([AllowAny])
def faq_detail(request, faq_id):
    faq = Faq.objects.filter(pk=faq_id).first()
    if faq is None:
        return Response({'message': '자주 묻는 질문이 존재하지 않습니다.'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = FaqSerializer(faq)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        faq.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)