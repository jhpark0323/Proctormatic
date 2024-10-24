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
                'status': openapi.Schema(type=openapi.TYPE_INTEGER, example=201),
                'message': openapi.Schema(type=openapi.TYPE_STRING, example='시험이 성공적으로 예약되었습니다.')
            }
        )),
        400: openapi.Response('요청 데이터가 유효하지 않거나 서비스 요금이 부족한 경우', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'status': openapi.Schema(type=openapi.TYPE_INTEGER, example=400),
                'message': openapi.Schema(type=openapi.TYPE_STRING, example='적립금이 부족합니다. 충전해주세요.')
            }
        )),
        403: openapi.Response('권한이 없습니다.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'status': openapi.Schema(type=openapi.TYPE_INTEGER, example=403),
                'message': openapi.Schema(type=openapi.TYPE_STRING, example='권한이 없습니다.')
            }
        )),
        409: openapi.Response('응시 시작 시간은 현 시간 기준 최소 30분 이후부터 설정할 수 있어요.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'status': openapi.Schema(type=openapi.TYPE_INTEGER, example=409),
                'message': openapi.Schema(type=openapi.TYPE_STRING, example='응시 시작 시간은 현 시간 기준 최소 30분 이후부터 설정할 수 있어요.')
            }
        )),
    }
)
@api_view(['POST'])
@permission_classes([IsAuthenticated])  # 인증된 사용자만 접근 가능
def create_exam(request):
    # 권한이 없는 경우 403 Forbidden 응답 처리 (예시: 관리자 권한만 접근 가능)
    if not request.user.is_authenticated or not request.user.is_staff:
        return Response({
            "status": 403,
            "message": "권한이 없습니다."
        }, status=status.HTTP_403_FORBIDDEN)

    # 서비스 요금 (coin)이 충분하지 않은 경우 처리
    coin = request.data.get('coin', 0)
    if int(coin) < 100:
        return Response({
            "status": 400,
            "message": "적립금이 부족합니다. 충전해주세요."
        }, status=status.HTTP_400_BAD_REQUEST)

    # 시험 시작 시간이 현재 시간으로부터 30분 이상 남아 있지 않은 경우 처리
    start_time = request.data.get('start_time')
    current_time = datetime.datetime.now().time()
    try:
        start_time_obj = datetime.datetime.strptime(start_time, "%H:%M:%S").time()
    except ValueError:
        return Response({
            "status": 400,
            "message": "유효한 시간 형식이 아닙니다. (예: HH:MM:SS)"
        }, status=status.HTTP_400_BAD_REQUEST)

    if (datetime.datetime.combine(datetime.date.today(), start_time_obj) - datetime.datetime.combine(
            datetime.date.today(), current_time)).total_seconds() < 1800:
        return Response({
            "status": 409,
            "message": "응시 시작 시간은 현 시간 기준 최소 30분 이후부터 설정할 수 있어요. 응시 시작 시간을 변경해주세요."
        }, status=status.HTTP_409_CONFLICT)

    # 시리얼라이저 유효성 검사
    serializer = ExamSerializer(data=request.data)
    if serializer.is_valid():
        # user 필드는 뷰에서 직접 설정
        serializer.save(user=request.user)
        return Response({
            "status": 201,
            "message": "시험이 성공적으로 예약되었습니다."
        }, status=status.HTTP_201_CREATED)

    # 기본적인 유효성 실패 응답
    return Response({
        "status": 400,
        "message": "요청 데이터가 유효하지 않습니다. 확인해주세요.",
        "errors": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


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
                'status': openapi.Schema(type=openapi.TYPE_INTEGER, example=200),
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
                'status': openapi.Schema(type=openapi.TYPE_INTEGER, example=400),
                'message': openapi.Schema(type=openapi.TYPE_STRING, example='페이지 및 크기 값이 잘못되었습니다.')
            }
        )),
        403: openapi.Response('권한이 없습니다.', openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'status': openapi.Schema(type=openapi.TYPE_INTEGER, example=403),
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
            "status": 403,
            "message": "권한이 없습니다."
        }, status=status.HTTP_403_FORBIDDEN)

    # 페이지네이션을 위한 요청 파라미터 처리
    page = request.query_params.get('page', 1)
    size = request.query_params.get('size', 10)

    try:
        page = int(page)
        size = int(size)
    except ValueError:
        return Response({
            "status": 400,
            "message": "페이지 및 크기 값이 잘못되었습니다."
        }, status=status.HTTP_400_BAD_REQUEST)

    # 현재 사용자의 예약된 시험 목록을 필터링
    exams = Exam.objects.filter(user=request.user).order_by('date')

    # 페이지네이션 처리
    paginator = Paginator(exams, size)
    paginated_exams = paginator.get_page(page)

    # 시리얼라이저를 사용한 직렬화 처리
    serializer = ScheduledExamSerializer(paginated_exams, many=True)

    # 응답 데이터 구성
    return Response({
        "status": 200,
        "message": "예약된 시험 목록 조회 성공.",
        "result": {
            "scheduledExamList": serializer.data,
            "prev": paginated_exams.has_previous(),
            "next": paginated_exams.has_next(),
            "totalPage": paginator.num_pages
        }
    }, status=status.HTTP_200_OK)
