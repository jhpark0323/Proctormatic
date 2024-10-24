import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Exam
from .serializers import ExamSerializer, ScheduledExamListSerializer
from django.core.paginator import Paginator
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from rest_framework_simplejwt.authentication import JWTAuthentication

User = get_user_model()  # User 모델 가져오기

# Swagger 설정 추가 - 시험 생성 엔드포인트
@swagger_auto_schema(
    method='post',
    operation_summary="시험 생성",
    operation_description="새로운 시험을 생성합니다. 요청 데이터에는 시험 제목, 날짜, 시작 시간, 종료 시간, 예상 참가자 수 등이 포함되어야 합니다.",
    request_body=ExamSerializer,
    responses={
        201: openapi.Response('시험이 성공적으로 예약되었습니다.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )),
        400: openapi.Response('요청 데이터가 유효하지 않거나 서비스 요금이 부족한 경우', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )),
        401: openapi.Response('사용자 정보가 필요합니다.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )),
        403: openapi.Response('권한이 없습니다.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )),
        409: openapi.Response('응시 시작 시간은 현 시간 기준 최소 30분 이후부터 설정할 수 있어요.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING)
            }
        )),
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])  # 인증된 사용자만 접근 가능
def create_exam(request):
    """
    새로운 시험을 생성하는 API입니다.
    요청 데이터에는 시험의 제목, 날짜, 시작 시간, 종료 시간, 예상 참가자 수 등이 포함되어야 합니다.
    """
    # JWT에서 user ID와 role을 추출
    user_id, user_role = get_user_info_from_token(request)
    if not user_id:
        return Response({"message": "사용자 정보가 필요합니다."}, status=status.HTTP_401_UNAUTHORIZED)

    # 사용자의 역할이 host가 아니면 403 Forbidden 반환
    if user_role != 'host':
        return Response({"message": "권한이 없습니다."}, status=status.HTTP_403_FORBIDDEN)

    # 요청된 데이터를 시리얼라이저로 검증
    serializer = ExamSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            "message": "요청 데이터가 유효하지 않습니다. 확인해주세요.",
        }, status=status.HTTP_400_BAD_REQUEST)

    # 시리얼라이저에서 cost를 가져옴
    exam_cost = serializer.validated_data.get('cost', 0)

    # user의 현재 코인을 가져옴 (데이터베이스에서 user_id로 사용자 조회)
    user = User.objects.get(id=user_id)
    user_coin = user.coin

    # user의 코인이 exam 비용보다 작은지 확인
    if int(user_coin) < int(exam_cost):
        return Response({
            "message": "적립금이 부족합니다. 충전해주세요."
        }, status=status.HTTP_400_BAD_REQUEST)

    # 시험 시작 시간 검증 및 entry_time 계산
    start_time = serializer.validated_data.get('start_time')
    current_time = datetime.datetime.now().time()

    # 현재 시간과 시험 시작 시간을 비교
    start_seconds = datetime.datetime.combine(datetime.date.today(), start_time).timestamp()
    current_seconds = datetime.datetime.combine(datetime.date.today(), current_time).timestamp()

    # 시험 시작 시간이 현재 시간으로부터 30분 이상 남아 있지 않은 경우 처리
    if (start_seconds - current_seconds) < 1800:
        return Response({
            "message": "응시 시작 시간은 현 시간 기준 최소 30분 이후부터 설정할 수 있어요. 응시 시작 시간을 변경해주세요."
        }, status=status.HTTP_409_CONFLICT)

    # entry_time 계산 (시험 시작 시간 30분 전)
    entry_time = (datetime.datetime.combine(datetime.date.today(), start_time) - datetime.timedelta(minutes=30)).time()

    # 시리얼라이저에 entry_time 추가
    serializer.save(user=user, entry_time=entry_time)
    return Response({
        "message": "시험이 성공적으로 예약되었습니다."
    }, status=status.HTTP_201_CREATED)

# Swagger 설정 추가 - 예약된 시험 조회 엔드포인트
@swagger_auto_schema(
    method='get',
    operation_summary="예약된 시험 목록 조회",
    operation_description="사용자가 예약한 미래의 시험 목록을 조회합니다. 현재 시간 기준으로 아직 시작되지 않은 시험만 반환됩니다.",
    manual_parameters=[
        openapi.Parameter('page', openapi.IN_QUERY, description="페이지 번호 (기본값 1)", type=openapi.TYPE_INTEGER),
        openapi.Parameter('size', openapi.IN_QUERY, description="페이지 당 항목 수 (기본값 10)", type=openapi.TYPE_INTEGER)
    ],
    responses={
        200: openapi.Response('예약된 시험 목록 조회 성공', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'result': openapi.Schema(type=openapi.TYPE_OBJECT, properties={
                    'scheduledExamList': openapi.Schema(
                        type=openapi.TYPE_ARRAY,
                        items=openapi.Items(type=openapi.TYPE_OBJECT),
                        description="예약된 시험 목록"
                    ),
                    'prev': openapi.Schema(type=openapi.TYPE_BOOLEAN, description="이전 페이지 존재 여부"),
                    'next': openapi.Schema(type=openapi.TYPE_BOOLEAN, description="다음 페이지 존재 여부"),
                    'totalPage': openapi.Schema(type=openapi.TYPE_INTEGER, description="전체 페이지 수")
                })
            }
        )),
        401: openapi.Response('사용자 정보가 필요합니다.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, description="사용자 정보 없음 메시지")
            }
        )),
        403: openapi.Response('권한이 없습니다.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, description="권한 없음 메시지")
            }
        )),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # 인증된 사용자만 접근 가능
def scheduled_exam_list(request):
    """
    예약된 시험 목록을 조회하는 API입니다.
    현재 시간 기준으로 아직 시작되지 않은 시험만 반환하며, 페이지네이션 기능을 제공합니다.
    """
    # JWT에서 user ID와 role을 추출
    user_id, user_role = get_user_info_from_token(request)
    if not user_id:
        return Response({"message": "사용자 정보가 필요합니다."}, status=status.HTTP_401_UNAUTHORIZED)

    # 사용자의 역할이 host가 아니면 403 Forbidden 반환
    if user_role != 'host':
        return Response({"message": "권한이 없습니다."}, status=status.HTTP_403_FORBIDDEN)

    # 현재 시간 가져오기
    current_datetime = datetime.datetime.now()
    current_date = current_datetime.date()
    current_time = current_datetime.time()

    # 오늘 이후의 시험들
    future_exams = Exam.objects.filter(
        user_id=user_id,
        date__gt=current_date
    )

    # 오늘 중에서 시작 시간이 현재 시간 이후인 시험들
    today_future_exams = Exam.objects.filter(
        user_id=user_id,
        date=current_date,
        start_time__gt=current_time
    )

    # 두 쿼리셋을 결합하고 정렬
    exams = (future_exams | today_future_exams).order_by('date', 'start_time')

    # 페이지네이션 처리
    paginator = Paginator(exams, int(request.query_params.get('size', 10)))
    paginated_exams = paginator.get_page(int(request.query_params.get('page', 1)))

    # 시리얼라이저를 사용한 직렬화 처리
    serializer = ScheduledExamListSerializer(paginated_exams, many=True)

    # 응답 데이터 구성
    return Response({
        "result": {
            "scheduledExamList": serializer.data,
            "prev": paginated_exams.has_previous(),
            "next": paginated_exams.has_next(),
            "totalPage": paginator.num_pages
        }
    }, status=status.HTTP_200_OK)

# JWT에서 user ID와 role 추출 함수
def get_user_info_from_token(request):
    jwt_authenticator = JWTAuthentication()
    user, token = jwt_authenticator.authenticate(request)
    if token:
        user_id = token.get('id')
        user_role = token.get('role')
        return user_id, user_role
    return None, None
