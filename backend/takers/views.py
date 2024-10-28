import re

from exams.models import Exam
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Taker
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .serializers import TakerSerializer, TakerTokenSerializer


@swagger_auto_schema(
    method='get',
    operation_summary="이메일 중복 체크",
    manual_parameters=[
        openapi.Parameter('email', openapi.IN_QUERY, description="응시자 이메일", type=openapi.TYPE_STRING, required=True),
        openapi.Parameter('id', openapi.IN_QUERY, description="시험 ID", type=openapi.TYPE_INTEGER, required=True),
    ],
    responses={
        200: openapi.Response(
            description="이메일 중복 체크 결과",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'isAlreadyExists': openapi.Schema(type=openapi.TYPE_BOOLEAN)
                }
            )
        ),
        400: openapi.Response(
            description="잘못된 요청(이메일과 시험 ID를 모두 입력해야 합니다.)",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        ),
        400: openapi.Response(
            description="유효하지 않은 이메일 형식",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        ),
        404: openapi.Response(
            description="시험 ID가 존재하지 않음",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        ),
    }
)
@swagger_auto_schema(
    method='post',
    operation_summary="응시자 등록",
    request_body=TakerSerializer,
    responses={
        201: openapi.Response(description="응시자 등록 성공"),
        400: openapi.Response(
            description="잘못된 요청",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING)
                }
            )
        ),
    }
)

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def add_taker(request):
    if request.method == 'GET':
        email = request.query_params.get('email')
        exam_id = request.query_params.get("id")

        if not email or not exam_id:
            return Response({'message': '이메일과 시험 ID를 모두 입력해야 합니다.'}, status=status.HTTP_400_BAD_REQUEST)

        if not is_valid_email(email):
            return Response({'message': '유효하지 않은 이메일 형식입니다.'}, status=status.HTTP_400_BAD_REQUEST)

        if not Exam.objects.filter(id=exam_id).exists():
            return Response({'message': '유효하지 않은 시험 ID입니다.'}, status=status.HTTP_404_NOT_FOUND)

        is_duplicate = Taker.objects.filter(email=email, exam__id=exam_id).exists()

        return Response({'isAlreadyExists': is_duplicate}, status=status.HTTP_200_OK)

    if request.method == 'POST':
        serializer = TakerSerializer(data=request.data)
        if serializer.is_valid():
            taker = serializer.save()
            access_token = TakerTokenSerializer.get_access_token(taker)

            return Response({
                'access': str(access_token),
            }, status=status.HTTP_201_CREATED)

        return Response("잘못된 요청입니다.", status=status.HTTP_400_BAD_REQUEST)

def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if re.match(email_regex, email):
        return True
    return False