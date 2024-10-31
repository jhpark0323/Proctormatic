import re
import os
from accounts.utils import generate_verification_code, send_verification_email, save_verification_code_to_redis
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
from django.utils.datetime_safe import datetime

swagger_jwt_auth = openapi.Parameter(
    'Authorization',
    openapi.IN_HEADER,
    description='JWT Bearer Token. Format: "Bearer <token>"',
    type=openapi.TYPE_STRING,
    required=True
)

# @swagger_auto_schema(
#     method='post',
#     operation_summary="응시자 등록",
#     request_body=TakerSerializer,
#     responses={
#         201: openapi.Response(description="응시자 등록 성공"),
#         400: openapi.Response(
#             description="잘못된 요청",
#             schema=openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#                 properties={
#                     'message': openapi.Schema(type=openapi.TYPE_STRING)
#                 }
#             )
#         ),
#         403: openapi.Response(
#             description="시험이 종료되었습니다.",
#             schema=openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#                 properties={
#                     'message': openapi.Schema(type=openapi.TYPE_STRING, example="시험이 종료되었습니다. 토큰을 발급할 수 없습니다.")
#                 }
#             )
#         ),
#     }
# )
@api_view(['POST', 'PATCH'])
@permission_classes([AllowAny])
def add_taker(request):
    if request.method == 'POST':
        serializer = TakerSerializer(data=request.data)

        if serializer.is_valid():
            exam = Exam.objects.get(id=serializer.validated_data['exam'].id)

            if exam.total_taker >= exam.expected_taker:
                return Response("참가자 수를 초과했습니다.", status=status.HTTP_429_TOO_MANY_REQUESTS)

            taker = serializer.save()
            access_token = TakerTokenSerializer.get_access_token(taker)

            exam.total_taker += 1
            exam.save(update_fields=['total_taker'])

            return Response({
                'access': str(access_token),
            }, status=status.HTTP_201_CREATED)

        return Response("잘못된 요청입니다.", status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'PATCH':
        taker_id = request.auth['user_id']
        exit_time = request.data.get('exit_time')
        exit_time = datetime.strptime(exit_time, '%H:%M:%S').time()

        taker = Taker.objects.filter(id=taker_id).first()

        if taker is not None:

            exam = Exam.objects.filter(id=taker.exam_id).first()

            if exam:
                if exit_time < exam.exit_time:
                    return Response({
                        "message": "퇴실 가능 시간이 아닙니다."
                    }, status=status.HTTP_409_CONFLICT)

            taker.exit_time = exit_time
            taker.save()
            return Response(status=200)
        else:
            return Response("잘못된 요청입니다.", status=status.HTTP_400_BAD_REQUEST)


# @swagger_auto_schema(
#     method='get',
#     operation_summary="이메일 중복 체크",
#     manual_parameters=[
#         openapi.Parameter('email', openapi.IN_QUERY, description="응시자 이메일", type=openapi.TYPE_STRING, required=True),
#         openapi.Parameter('id', openapi.IN_QUERY, description="시험 ID", type=openapi.TYPE_INTEGER, required=True),
#     ],
#     responses={
#         200: openapi.Response(
#             description="이메일 중복 체크 결과",
#             schema=openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#                 properties={
#                     'isAlreadyExists': openapi.Schema(type=openapi.TYPE_BOOLEAN)
#                 }
#             )
#         ),
#         400: openapi.Response(
#             description="잘못된 요청(이메일과 시험 ID를 모두 입력해야 합니다.)",
#             schema=openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#                 properties={
#                     'message': openapi.Schema(type=openapi.TYPE_STRING)
#                 }
#             )
#         ),
#         400: openapi.Response(
#             description="유효하지 않은 이메일 형식",
#             schema=openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#                 properties={
#                     'message': openapi.Schema(type=openapi.TYPE_STRING)
#                 }
#             )
#         ),
#         404: openapi.Response(
#             description="시험 ID가 존재하지 않음",
#             schema=openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#                 properties={
#                     'message': openapi.Schema(type=openapi.TYPE_STRING)
#                 }
#             )
#         ),
#     }
# )
# @swagger_auto_schema(
#     method='post',
#     operation_summary="이메일 인증번호 발송",
#     request_body=openapi.Schema(
#         type=openapi.TYPE_OBJECT,
#         properties={
#             'email': openapi.Schema(type=openapi.TYPE_STRING),
#         }
#     ),
#     responses={
#         200: openapi.Response('인증번호를 발송했습니다.', openapi.Schema(
#             type=openapi.TYPE_OBJECT,
#             properties={
#                 'message': openapi.Schema(type=openapi.TYPE_STRING),
#             }
#         )),
#         400: openapi.Response('잘못된 이메일 형식 또는 이메일 미제공', openapi.Schema(
#             type=openapi.TYPE_OBJECT,
#             properties={
#                 'message': openapi.Schema(type=openapi.TYPE_STRING),
#             }
#         )),
#     }
# )
# @swagger_auto_schema(
#     method='put',
#     operation_summary="이메일 인증",
#     request_body=openapi.Schema(
#         type=openapi.TYPE_OBJECT,
#         properties={
#             'email': openapi.Schema(type=openapi.TYPE_STRING),
#             'code': openapi.Schema(type=openapi.TYPE_STRING),
#         }
#     ),
#     responses={
#         200: openapi.Response('이메일 인증이 완료되었습니다.', openapi.Schema(
#             type=openapi.TYPE_OBJECT,
#             properties={
#                 'message': openapi.Schema(type=openapi.TYPE_STRING),
#             }
#         )),
#         400: openapi.Response('잘못된 인증번호 또는 만료된 인증번호', openapi.Schema(
#             type=openapi.TYPE_OBJECT,
#             properties={
#                 'message': openapi.Schema(type=openapi.TYPE_STRING),
#             }
#         )),
#     }
# )
@api_view(['GET', 'POST', 'PUT'])
@permission_classes([AllowAny])
def check_email(request):
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

    elif request.method == 'POST':
        email = request.data.get('email')
        if email:
            if not is_valid_email(email):
                return Response({'message': '이메일 형식을 확인해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

            code = generate_verification_code()
            send_verification_email(email, code)
            save_verification_code_to_redis(email, code)

            return Response({'message': '인증번호를 발송했습니다.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': '이메일을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'PUT':
        email = request.data.get('email')
        code = request.data.get('code')

        if not email:
            return Response({'message': '이메일을 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)
        if not code:
            return Response({'message': '인증번호를 입력해주세요.'}, status=status.HTTP_400_BAD_REQUEST)

        from django_redis import get_redis_connection
        redis_conn = get_redis_connection('default')
        stored_code = redis_conn.get(f'verification_code:{email}')

        if stored_code is None:
            return Response({'message': '인증번호가 만료되었습니다.'}, status=status.HTTP_400_BAD_REQUEST)

        if stored_code.decode('utf-8') == code:
            return Response({'message': '이메일 인증이 완료되었습니다.'}, status=status.HTTP_200_OK)
        else:
            return Response({'message': '잘못된 인증번호입니다.'}, status=status.HTTP_400_BAD_REQUEST)


# # @swagger_auto_schema(
# #     method='patch',
# #     operation_summary="신분증 등록",
# #     manual_parameters=[
# #         swagger_jwt_auth,
# #         openapi.Parameter(
# #             'idPhoto',
# #             openapi.IN_FORM,
# #             description='신분증 사진 (파일 업로드)',
# #             type=openapi.TYPE_FILE,
# #             required=True
# #         ),
# #         openapi.Parameter(
# #             'birth',
# #             openapi.IN_FORM,
# #             description='생년월일',
# #             type=openapi.TYPE_STRING,
# #             required=True
# #         ),
# #         openapi.Parameter(
# #             'verification_rate',
# #             openapi.IN_FORM,
# #             description='인증 비율',
# #             type=openapi.TYPE_NUMBER,
# #             required=True
# #         ),
# #     ],
# #     responses={
# #         200: openapi.Response(
# #             description="응시자 정보 업데이트 성공",
# #             schema=openapi.Schema(
# #                 type=openapi.TYPE_OBJECT,
# #                 properties={
# #                     'message': openapi.Schema(type=openapi.TYPE_STRING, description='성공 메시지'),
# #                 }
# #             )
# #         ),
# #         400: openapi.Response(
# #             description="잘못된 요청",
# #             schema=openapi.Schema(
# #                 type=openapi.TYPE_OBJECT,
# #                 properties={
# #                     'status': openapi.Schema(type=openapi.TYPE_INTEGER, description='HTTP 상태 코드'),
# #                     'message': openapi.Schema(type=openapi.TYPE_STRING, description='오류 메시지'),
# #                     'errors': openapi.Schema(type=openapi.TYPE_OBJECT, description='유효성 검사 오류',
# #                                              additional_properties=openapi.Schema(type=openapi.TYPE_STRING)),
# #                 }
# #             ),
# #             examples={
# #                 'fail_example': {
# #                     'status': 400,
# #                     'message': "잘못된 요청입니다."
# #                 },
# #             }
# #         ),
# #         401: openapi.Response(
# #             description="인증 실패 또는 권한 없음",
# #             schema=openapi.Schema(
# #                 type=openapi.TYPE_OBJECT,
# #                 properties={
# #                     'status': openapi.Schema(type=openapi.TYPE_INTEGER, description='HTTP 상태 코드'),
# #                     'message': openapi.Schema(type=openapi.TYPE_STRING, description='오류 메시지'),
# #                 }
# #             ),
# #             examples={
# #                 'unauthorized': {
# #                     'status': 401,
# #                     'message': "해당하는 유저를 찾을 수 없습니다."
# #                 }
# #             }
# #         ),
# #         403: openapi.Response(
# #             description="해당하는 role 사용자가 아님",
# #             schema=openapi.Schema(
# #                 type=openapi.TYPE_OBJECT,
# #                 properties={
# #                     'status': openapi.Schema(type=openapi.TYPE_INTEGER, description='HTTP 상태 코드'),
# #                     'message': openapi.Schema(type=openapi.TYPE_STRING, description='오류 메시지'),
# #                 }
# #             ),
# #             examples={
# #                 'forbidden': {
# #                     'status': 403,
# #                     'message': "권한이 없습니다."
# #                 }
# #             }
# #         ),
# #         404: openapi.Response(
# #             description="응시자 찾을 수 없음",
# #             schema=openapi.Schema(
# #                 type=openapi.TYPE_OBJECT,
# #                 properties={
# #                     'status': openapi.Schema(type=openapi.TYPE_INTEGER, description='HTTP 상태 코드'),
# #                     'message': openapi.Schema(type=openapi.TYPE_STRING, description='오류 메시지'),
# #                 }
# #             ),
# #             examples={
# #                 'not_found': {
# #                     'status': 404,
# #                     'message': "응시자를 찾을 수 없습니다."
# #                 }
# #             }
# #         ),
# #     }
# # )
#
# @api_view(['PATCH'])
# @authentication_classes([CustomJWTAuthentication])
# @parser_classes([MultiPartParser])
# def update_taker(request):
#     taker_id = request.auth['user_id']
#     required_fields = ['idPhoto', 'birth', 'verification_rate']
#     for field in required_fields:
#         if field not in request.data:
#             return Response({'message': '잘못된 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)
#
#     taker = Taker.objects.filter(id=taker_id).first()
#     if not taker:
#         return Response({'message': '응시자를 찾을 수 없습니다.'}, status=status.HTTP_404_NOT_FOUND)
#
#     if 'birth' in request.data:
#         birth = request.data['birth']
#         parsed_birth, error_message = parse_birth_date(birth)
#
#         if error_message:
#             return Response({'message': error_message},
#                             status=status.HTTP_400_BAD_REQUEST)
#
#         request.data['birth'] = parsed_birth
#
#     exam_id = taker.exam_id
#
#     folder_path = os.path.join('prome', str(exam_id), str(taker_id))
#     if not os.path.exists(folder_path):
#         os.makedirs(folder_path)
#
#     if 'idPhoto' in request.FILES:
#         id_photo_file = request.FILES['idPhoto']
#         _, file_extension = os.path.splitext(id_photo_file.name)
#         file_name = f'{taker_id}_id_photo{file_extension}'
#
#         file_path = os.path.join(folder_path, file_name)
#
#         with open(file_path, 'wb+') as destination:
#             for chunk in id_photo_file.chunks():
#                 destination.write(chunk)
#
#         request.data['id_photo'] = file_path
#
#     serializer = UpdateTakerSerializer(taker, data=request.data, partial=True)
#     if serializer.is_valid():
#         serializer.save()
#         return Response( status=status.HTTP_200_OK)
#
#     return Response({'message': '잘못된 요청입니다.', 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
#
#
# @swagger_auto_schema(
#     method='patch',
#     operation_summary="웹캠 파일 추가",
#     manual_parameters=[
#         swagger_jwt_auth,
#         openapi.Parameter(
#             'webCam',
#             openapi.IN_FORM,
#             description='웹캠 녹화 파일 (파일 업로드)',
#             type=openapi.TYPE_FILE,
#             required=True
#         ),
#         openapi.Parameter(
#             'startTime',
#             openapi.IN_FORM,
#             description='녹화 시작 시간',
#             type=openapi.TYPE_STRING,
#             required=True
#         ),
#     ],
#     responses={
#         200: openapi.Response(
#             description="저장 완료",
#             schema=openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#             )
#         ),
#         400: openapi.Response(
#             description="잘못된 요청",
#             schema=openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#                 properties={
#                     'status': openapi.Schema(type=openapi.TYPE_INTEGER, description='HTTP 상태 코드'),
#                     'message': openapi.Schema(type=openapi.TYPE_STRING, description='오류 메시지'),
#                 }
#             ),
#             examples={
#                 'missing_webCam': {
#                     'status': 400,
#                     'message': "webCam 파일이 필요합니다."
#                 },
#                 'missing_startTime': {
#                     'status': 400,
#                     'message': "startTime 값이 필요합니다."
#                 }
#             }
#         ),
#         403: openapi.Response(
#             description="해당하는 role 사용자가 아닙니다.",
#             schema=openapi.Schema(
#                 type=openapi.TYPE_OBJECT,
#                 properties={
#                     'status': openapi.Schema(type=openapi.TYPE_INTEGER, description='HTTP 상태 코드'),
#                     'message': openapi.Schema(type=openapi.TYPE_STRING, description='오류 메시지'),
#                 }
#             ),
#             examples={
#                 'forbidden': {
#                     'status': 403,
#                     'message': "권한이 없습니다."
#                 }
#             }
#         ),
#     }
# )
@api_view(['PATCH'])
@authentication_classes([CustomJWTAuthentication])
@parser_classes([MultiPartParser])
def add_web_cam(request):
    taker_id = request.auth['user_id']

    taker = Taker.objects.filter(id=taker_id).first()
    exam_id = taker.exam_id

    if 'webCam' not in request.FILES:
        return Response('잘못된 요청입니다.', status=400)

    web_cam_file = request.FILES['webCam']
    start_time = request.data.get('startTime')

    if not start_time:
        return Response('잘못된 요청입니다.', status=400)

    taker_id = request.auth.get('user_id', 'default_user')
    _, file_extension = os.path.splitext(web_cam_file.name)
    file_name = f'{taker_id}_webcam_{start_time}{file_extension}'
    folder_path = os.path.join('prome', str(exam_id), str(taker_id))
    os.makedirs(folder_path, exist_ok=True)
    file_path = os.path.join(folder_path, file_name)

    with open(file_path, 'wb+') as destination:
        for chunk in web_cam_file.chunks():
            destination.write(chunk)

    return Response(status=status.HTTP_200_OK)

def is_valid_email(email):
    email_regex = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    if re.match(email_regex, email):
        return True
    return False


def parse_birth_date(birth):
    if len(birth) != 6:
        return None, '잘못된 생년월일입니다.'

    current_year = datetime.now().year
    current_year_last_two = current_year % 100
    birth_year_two_digits = int(birth[:2])

    if birth_year_two_digits == current_year_last_two:
        birth_month = int(birth[2:4])
        birth_day = int(birth[4:6])
        today = datetime.now()

        if (birth_month < today.month) or (birth_month == today.month and birth_day < today.day):
            birth_year = 2000 + birth_year_two_digits
        else:
            birth_year = 1900 + birth_year_two_digits
    elif birth_year_two_digits < current_year_last_two:
        birth_year = 2000 + birth_year_two_digits
    else:
        birth_year = 1900 + birth_year_two_digits

    birth_month = int(birth[2:4])
    birth_day = int(birth[4:6])

    if not (1 <= birth_month <= 12):
        return None, '잘못된 생년월일입니다.'

    days_in_month = [
        31, 29 if (birth_year % 4 == 0 and (birth_year % 100 != 0 or birth_year % 400 == 0)) else 28,
        31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ]

    if not (1 <= birth_day <= days_in_month[birth_month - 1]):
        return None, '잘못된 생년월일입니다.'

    return f'{birth_year}{birth[2:]}', None