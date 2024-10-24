import datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Exam
from .serializers import ExamSerializer, ScheduledExamSerializer
from django.core.paginator import Paginator
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

# Swagger 설정 추가 - 시험 생성 엔드포인트
@swagger_auto_schema(
    method='post',
    request_body=ExamSerializer,
    responses={
        201: openapi.Response('시험이 성공적으로 예약되었습니다.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, example='시험이 성공적으로 예약되었습니다.')
            }
        )),
        400: openapi.Response('요청 데이터가 유효하지 않거나 서비스 요금이 부족한 경우', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, example='적립금이 부족합니다. 충전해주세요.')
            }
        )),
        403: openapi.Response('권한이 없습니다.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, example='권한이 없습니다.')
            }
        )),
        409: openapi.Response('응시 시작 시간은 현 시간 기준 최소 30분 이후부터 설정할 수 있어요.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, example='응시 시작 시간은 현 시간 기준 최소 30분 이후부터 설정할 수 있어요.')
            }
        )),
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])  # 인증된 사용자만 접근 가능
def create_exam(request):
    # 권한이 없는 경우 403 Forbidden 응답 처리
    if not request.user.is_authenticated:
        return Response({
            "message": "권한이 없습니다."
        }, status=status.HTTP_403_FORBIDDEN)

    # 요청된 데이터를 시리얼라이저로 검증
    serializer = ExamSerializer(data=request.data)
    if not serializer.is_valid():
        return Response({
            "message": "요청 데이터가 유효하지 않습니다. 확인해주세요.",
            "errors": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    # 시리얼라이저에서 cost를 가져옴
    exam_cost = serializer.validated_data.get('cost', 0)

    # user의 현재 코인을 가져옴
    user_coin = request.user.coin

    # user의 코인이 exam 비용보다 작은지 확인
    if int(user_coin) < int(exam_cost):
        return Response({
            "message": "적립금이 부족합니다. 충전해주세요."
        }, status=status.HTTP_400_BAD_REQUEST)

    # 시험 시작 시간 검증
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

    # 비용 검증을 통과한 경우, 시험을 생성
    serializer.save(user=request.user)
    return Response({
        "message": "시험이 성공적으로 예약되었습니다."
    }, status=status.HTTP_201_CREATED)


# Swagger 설정 추가 - 예약된 시험 조회 엔드포인트
@swagger_auto_schema(
    method='get',
    manual_parameters=[
        openapi.Parameter('page', openapi.IN_QUERY, description="페이지 번호 (기본값 1)", type=openapi.TYPE_INTEGER),
        openapi.Parameter('size', openapi.IN_QUERY, description="페이지 당 항목 수 (기본값 10)", type=openapi.TYPE_INTEGER)
    ],
    responses={
        200: openapi.Response('예약된 시험 목록 조회 성공', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, example='예약된 시험 목록 조회 성공.'),
                'result': openapi.Schema(type=openapi.TYPE_OBJECT, properties={
                    'scheduledExamList': openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Items(type=openapi.TYPE_OBJECT)),
                    'prev': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=False),
                    'next': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True),
                    'totalPage': openapi.Schema(type=openapi.TYPE_INTEGER, example=5)
                })
            }
        )),
        400: openapi.Response('페이지 및 크기 값이 잘못되었습니다.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, example='페이지 및 크기 값이 잘못되었습니다.')
            }
        )),
        403: openapi.Response('권한이 없습니다.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'message': openapi.Schema(type=openapi.TYPE_STRING, example='권한이 없습니다.')
            }
        )),
    }
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])  # 인증된 사용자만 접근 가능
def scheduled_exam_list(request):
    # 권한이 없는 경우 403 Forbidden 처리
    if not request.user.is_authenticated:
        return Response({
            "message": "권한이 없습니다."
        }, status=status.HTTP_403_FORBIDDEN)

    # 페이지네이션을 위한 요청 파라미터 처리
    page = request.query_params.get('page', 1)
    size = request.query_params.get('size', 10)

    # 페이지와 크기 값이 정수형인지 검증
    if not str(page).isdigit() or not str(size).isdigit():
        return Response({
            "message": "페이지 및 크기 값이 잘못되었습니다."
        }, status=status.HTTP_400_BAD_REQUEST)

    # 현재 시간 가져오기
    current_datetime = datetime.datetime.now()
    current_date = current_datetime.date()
    current_time = current_datetime.time()

    # 오늘 이후의 시험들
    future_exams = Exam.objects.filter(
        user=request.user,
        date__gt=current_date
    )

    # 오늘 중에서 시작 시간이 현재 시간 이후인 시험들
    today_future_exams = Exam.objects.filter(
        user=request.user,
        date=current_date,
        start_time__gt=current_time
    )

    # 두 쿼리셋을 결합하고 정렬
    exams = (future_exams | today_future_exams).order_by('date', 'start_time')

    # 페이지네이션 처리
    paginator = Paginator(exams, int(size))
    paginated_exams = paginator.get_page(int(page))

    # 시리얼라이저를 사용한 직렬화 처리
    serializer = ScheduledExamSerializer(paginated_exams, many=True)

    # 응답 데이터 구성
    return Response({
        "result": {
            "scheduledExamList": serializer.data,
            "prev": paginated_exams.has_previous(),
            "next": paginated_exams.has_next(),
            "totalPage": paginator.num_pages
        }
    }, status=status.HTTP_200_OK)
