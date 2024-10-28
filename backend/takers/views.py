import re
import os
import jwt
from django.conf import settings
from exams.models import Exam
from rest_framework.decorators import api_view, permission_classes, parser_classes, authentication_classes
from rest_framework import status
from rest_framework.parsers import MultiPartParser
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from .authentication import CustomJWTAuthentication
from .models import Taker
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from .serializers import TakerSerializer, UpdateTakerSerializer, TakerTokenSerializer

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
        403: openapi.Response(
            description="시험이 종료되었습니다.",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING, example="시험이 종료되었습니다. 토큰을 발급할 수 없습니다.")
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

swagger_jwt_auth = openapi.Parameter(
    'Authorization',
    openapi.IN_HEADER,
    description='JWT Bearer Token. Format: "Bearer <token>"',
    type=openapi.TYPE_STRING,
    required=True
)
@swagger_auto_schema(
    method='patch',
    operation_summary="신분증 등록",
    manual_parameters=[
        swagger_jwt_auth,
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
                    'message': openapi.Schema(type=openapi.TYPE_STRING, description='성공 메시지'),
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
            }
        ),
        401: openapi.Response(
            description="인증 실패 또는 권한 없음",
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
                    'message': "해당하는 유저를 찾을 수 없습니다."
                }
            }
        ),
        403: openapi.Response(
            description="해당하는 role 사용자가 아님",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_INTEGER, description='HTTP 상태 코드'),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, description='오류 메시지'),
                }
            ),
            examples={
                'forbidden': {
                    'status': 403,
                    'message': "권한이 없습니다."
                }
            }
        ),
        404: openapi.Response(
            description="응시자 찾을 수 없음",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'status': openapi.Schema(type=openapi.TYPE_INTEGER, description='HTTP 상태 코드'),
                    'message': openapi.Schema(type=openapi.TYPE_STRING, description='오류 메시지'),
                }
            ),
            examples={
                'not_found': {
                    'status': 404,
                    'message': "응시자를 찾을 수 없습니다."
                }
            }
        ),
    }
)

@api_view(['PATCH'])
@authentication_classes([CustomJWTAuthentication])
@permission_classes([AllowAny])
@parser_classes([MultiPartParser])
def update_taker(request):
    user_id, user_role = get_user_info_from_token(request)
    required_fields = ['idPhoto', 'birth', 'verification_rate']
    for field in required_fields:
        if field not in request.data:
            return Response({'message': '잘못된 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)

    taker_id = user_id

    taker = Taker.objects.filter(id=taker_id).first()
    if not taker:
        return Response({'message': '응시자를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)

    exam_id = taker.exam_id

    folder_path = os.path.join('prome', str(exam_id), str(taker_id))
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

    if 'idPhoto' in request.FILES:
        id_photo_file = request.FILES['idPhoto']
        _, file_extension = os.path.splitext(id_photo_file.name)
        file_name = f'{taker_id}_id_photo{file_extension}'

        file_path = os.path.join(folder_path, file_name)

        with open(file_path, 'wb+') as destination:
            for chunk in id_photo_file.chunks():
                destination.write(chunk)

        request.data['id_photo'] = file_path

    serializer = UpdateTakerSerializer(taker, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response( status=status.HTTP_200_OK)

    return Response({'message': '잘못된 요청입니다.', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if re.match(email_regex, email):
        return True
    return False

def get_user_info_from_token(request):
    token = request.META.get('HTTP_AUTHORIZATION')
    if not token:
        return None, None

    token_parts = token.split(" ")
    if len(token_parts) != 2:
        return None, None

    payload = jwt.decode(token_parts[1], settings.SECRET_KEY, algorithms=["HS256"], options={"verify_exp": True})

    user_id = payload.get('user_id')
    role = payload.get('role')
    taker = Taker.objects.filter(id=user_id).first() if user_id else None

    if taker:
        return user_id, role
    return None, None
