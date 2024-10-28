import re
from django.shortcuts import get_object_or_404
from exams.models import Exam
from rest_framework.decorators import api_view, permission_classes, parser_classes
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Taker
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .serializers import TakerSerializer, UpdateTakerSerializer, TakerTokenSerializer
import os
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.tokens import AccessToken


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
            serializer.save()
            return Response(status=status.HTTP_201_CREATED)
        return Response({'message' : '잘못된 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)

@swagger_auto_schema(
    method='patch',
    operation_summary="신분증 등록",
    manual_parameters=[
        openapi.Parameter(
            'id',
            openapi.IN_FORM,
            description='응시자 ID',
            type=openapi.TYPE_INTEGER,
            required=True
        ),
        openapi.Parameter(
            'idPhoto',
            openapi.IN_FORM,
            description='신분증 사진 (파일 업로드)',
            type=openapi.TYPE_FILE,
            required=True
        ),
        openapi.Parameter(
            'birth',
            openapi.IN_FORM,
            description='생년월일',
            type=openapi.TYPE_STRING,
            required=True
        ),
        openapi.Parameter(
            'verification_rate',
            openapi.IN_FORM,
            description='인증 비율',
            type=openapi.TYPE_NUMBER,
            required=True
        ),
    ],
    responses={
        200: openapi.Response(
            description="응시자 정보 업데이트 성공",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'access': openapi.Schema(type=openapi.TYPE_STRING, description='Access Token'),
                    # refresh token 필드 삭제
                }
            )
        ),
        400: openapi.Response(
            description="잘못된 요청",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_INTEGER, description='HTTP 상태 코드'),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, description='오류 메시지'),
                    'errors': openapi.Schema(type=openapi.TYPE_OBJECT, description='유효성 검사 오류',
                                             additional_properties=openapi.Schema(type=openapi.TYPE_STRING)),
                }
            ),
            examples={
                'fail_example': {
                    'status': 400,
                    'message': "잘못된 요청입니다."
                },
                'exam_finished': {
                    'status': 400,
                    'message': "시험이 종료되었습니다. 토큰을 발급할 수 없습니다."
                }
            }
        ),
        401: openapi.Response(
            description="권한이 없음",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_INTEGER, description='HTTP 상태 코드'),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, description='오류 메시지'),
                }
            ),
            examples={
                'unauthorized': {
                    'status': 401,
                    'message': "권한이 없습니다."
                }
            }
        ),
    }
)
@api_view(['PATCH'])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser])
def update_taker(request):
    required_fields = ['id', 'idPhoto', 'birth', 'verification_rate']
    for field in required_fields:
        if field not in request.data:
            return Response({'message': '잘못된 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)

    taker_id = request.data.get('id')
    taker = Taker.objects.filter(id=taker_id).first()
    if not taker:
        return Response({'message': '응시자를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

    folder_path = os.path.join('prome', str(taker_id))

    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    if 'idPhoto' in request.FILES:
        id_photo_file = request.FILES['idPhoto']
        _, file_extension = os.path.splitext(id_photo_file.name)
        file_name = f'{taker_id}_id_photo{file_extension}'

        file_path = os.path.join(folder_path, file_name)
        print(file_path)
        with open(file_path, 'wb+') as destination:
            for chunk in id_photo_file.chunks():
                destination.write(chunk)

        request.data['id_photo'] = file_path

    serializer = UpdateTakerSerializer(taker, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()

        access_token = TakerTokenSerializer.get_access_token(taker)

        return Response({
            'access': str(access_token),
        }, status=status.HTTP_200_OK)

    return Response({'message': '잘못된 요청입니다.', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if re.match(email_regex, email):
        return True
    return False