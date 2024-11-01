import datetime
from django.conf import settings
from django.core.mail import send_mail
from django.utils.text import slugify
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema_view, extend_schema, OpenApiParameter, OpenApiResponse, OpenApiRequest
from .models import Exam
from takers.models import Taker
from coins.models import Coin
from .serializers import ExamSerializer, ScheduledExamListSerializer, OngoingExamListSerializer, CompletedExamListSerializer, ExamDetailSerializer, TakerDetailSerializer
from django.core.paginator import Paginator

User = get_user_model()  # User 모델 가져오기


@extend_schema_view(
    post=extend_schema(
        summary='시험 생성',
        request=ExamSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='시험 예약 성공',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='요청 데이터가 유효하지 않거나 서비스 요금이 부족한 경우',
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
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description='권한 없음',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
            status.HTTP_409_CONFLICT: OpenApiResponse(
                description='응시 시작 시간 설정 오류',
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
@api_view(['POST'])
def create_exam(request):
    # JWT에서 user ID와 role을 추출
    user_id, user_role = get_user_info_from_token(request)
    if not user_id:
        return Response({"message": "사용자 정보가 필요합니다."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = User.objects.get(id=user_id)
    if not user.is_active:
        return Response({'message': '탈퇴한 사용자입니다.'}, status=status.HTTP_401_UNAUTHORIZED)

    expected_taker = request.data.get("expected_taker", 0)
    if expected_taker > 999:
        return Response({"message": "총 응시자는 999명을 넘을 수 없습니다."}, status=status.HTTP_400_BAD_REQUEST)

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
    user_coin_amount = user.coin_amount

    # user의 코인이 exam 비용보다 작은지 확인
    if int(user_coin_amount) < int(exam_cost):
        return Response({
            "message": "적립금이 부족합니다. 충전해주세요."
        }, status=status.HTTP_400_BAD_REQUEST)
    
    user.coin_amount = user_coin_amount - exam_cost
    user.save()  # 변경사항 저장

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

    # 시험 데이터 저장
    exam_instance = serializer.save(user=user, entry_time=entry_time)

    # URL 자동 생성
    exam_instance.url = f"https://proctormatic.kr/exams/{exam_instance.id}/{slugify(exam_instance.title)}"
    exam_instance.save()

    # Coin 내역 기록
    Coin.objects.create(
        user_id=user_id,
        exam_id=exam_instance.id,
        type='use',  # 사용 내역으로 기록
        amount=exam_cost
    )

    # 이메일로 시험 정보 전송
    send_exam_email(user.email, exam_instance)

    return Response({
        "message": "시험이 성공적으로 예약되었습니다."
    }, status=status.HTTP_201_CREATED)


@extend_schema_view(
    get=extend_schema(
        summary='예약된 시험 조회',
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, default=1),
            OpenApiParameter(name='size', type=int, location=OpenApiParameter.QUERY, default=10),
        ],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='예약된 시험 목록 조회 성공',
                response=ScheduledExamListSerializer(many=True)
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
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description='권한 없음',
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
@api_view(['GET'])
def scheduled_exam_list(request):
    # JWT에서 user ID와 role을 추출
    user_id, user_role = get_user_info_from_token(request)
    if not user_id:
        return Response({"message": "사용자 정보가 필요합니다."}, status=status.HTTP_401_UNAUTHORIZED)
    
    user = User.objects.get(id=user_id)
    if not user.is_active:
        return Response({'message': '탈퇴한 사용자입니다.'}, status=status.HTTP_401_UNAUTHORIZED)


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
        date__gt=current_date,
        is_deleted=False
    )

    # 오늘 중에서 시작 시간이 현재 시간 이후인 시험들
    today_future_exams = Exam.objects.filter(
        user_id=user_id,
        date=current_date,
        start_time__gt=current_time,
        is_deleted=False
    )

    # 두 쿼리셋을 결합하고 정렬
    exams = (future_exams | today_future_exams).order_by('date', 'start_time')

    # 페이지 번호와 사이즈 가져오기
    page_number = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('size', 10))

    # 페이지네이션 처리
    paginated_exams = paginate_queryset(exams, page_number, page_size)
    if paginated_exams is None:
        return Response({"message": "페이지 번호는 1 이상의 값이어야 합니다."}, status=status.HTTP_400_BAD_REQUEST)

    # 시리얼라이저를 사용한 직렬화 처리
    serializer = ScheduledExamListSerializer(paginated_exams, many=True)

    # 응답 데이터 구성
    return Response({
            "scheduledExamList": serializer.data,
            "prev": paginated_exams.has_previous(),
            "next": paginated_exams.has_next(),
            "totalPage": Paginator(exams, page_size).num_pages
    }, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary='진행 중인 시험 조회',
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, default=1),
            OpenApiParameter(name='size', type=int, location=OpenApiParameter.QUERY, default=10),
        ],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='진행 중인 시험 목록 조회 성공',
                response=OngoingExamListSerializer(many=True)
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
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description='권한 없음',
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
@api_view(['GET'])
def ongoing_exam_list(request):
    # JWT에서 user ID와 role을 추출
    user_id, user_role = get_user_info_from_token(request)
    if not user_id:
        return Response({"message": "사용자 정보가 필요합니다."}, status=status.HTTP_401_UNAUTHORIZED)

    user = User.objects.get(id=user_id)
    if not user.is_active:
        return Response({'message': '탈퇴한 사용자입니다.'}, status=status.HTTP_401_UNAUTHORIZED)


    # 사용자의 역할이 host가 아니면 403 Forbidden 반환
    if user_role != 'host':
        return Response({"message": "권한이 없습니다."}, status=status.HTTP_403_FORBIDDEN)

    # 현재 시간 가져오기
    current_datetime = datetime.datetime.now()
    current_date = current_datetime.date()
    current_time = current_datetime.time()

    # 현재 시간이 entry_time과 end_time 사이에 있는 시험들 필터링
    ongoing_exams = Exam.objects.filter(
        user_id=user_id,
        date=current_date,
        entry_time__lte=current_time,
        end_time__gte=current_time,
        is_deleted=False
    ).order_by('date', 'start_time')

    # 페이지 번호와 사이즈 가져오기
    page_number = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('size', 10))

    # 페이지네이션 처리
    paginated_exams = paginate_queryset(ongoing_exams, page_number, page_size)
    if paginated_exams is None:
        return Response({"message": "페이지 번호는 1 이상의 값이어야 합니다."}, status=status.HTTP_400_BAD_REQUEST)


    # 시리얼라이저를 사용한 직렬화 처리
    serializer = OngoingExamListSerializer(paginated_exams, many=True)

    # 응답 데이터 구성
    return Response({
            "ongoingExamList": serializer.data,
            "prev": paginated_exams.has_previous(),
            "next": paginated_exams.has_next(),
            "totalPage": Paginator(ongoing_exams, page_size).num_pages
    }, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary='완료된 시험 조회',
        parameters=[
            OpenApiParameter(name='page', type=int, location=OpenApiParameter.QUERY, default=1),
            OpenApiParameter(name='size', type=int, location=OpenApiParameter.QUERY, default=10),
        ],
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='완료된  시험 목록 조회 성공',
                response=CompletedExamListSerializer(many=True)
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
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description='권한 없음',
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
@api_view(['GET'])
def completed_exam_list(request):
    # JWT에서 user ID와 role을 추출
    user_id, user_role = get_user_info_from_token(request)
    if not user_id:
        return Response({"message": "사용자 정보가 필요합니다."}, status=status.HTTP_401_UNAUTHORIZED)

    user = User.objects.get(id=user_id)
    if not user.is_active:
        return Response({'message': '탈퇴한 사용자입니다.'}, status=status.HTTP_401_UNAUTHORIZED)


    # 사용자의 역할이 host가 아니면 403 Forbidden 반환
    if user_role != 'host':
        return Response({"message": "권한이 없습니다."}, status=status.HTTP_403_FORBIDDEN)

    # 현재 시간 가져오기
    current_datetime = datetime.datetime.now()
    current_date = current_datetime.date()
    current_time = current_datetime.time()

    # 종료된 시험들 필터링
    completed_exams = Exam.objects.filter(
        user_id=user_id,
        date__lt=current_date,
        is_deleted=False
    )

    # 오늘 날짜의 시험 중에서 종료 시간이 지난 시험들 추가
    today_completed_exams = Exam.objects.filter(
        user_id=user_id,
        date=current_date,
        end_time__lt=current_time,
        is_deleted=False
    )

    # 두 쿼리셋을 결합하고 정렬
    exams = (completed_exams | today_completed_exams).order_by('-date', '-end_time')

    # 페이지 번호와 사이즈 가져오기
    page_number = int(request.query_params.get('page', 1))
    page_size = int(request.query_params.get('size', 10))

    paginated_exams = paginate_queryset(exams, page_number, page_size)
    if paginated_exams is None:
        return Response({"message": "페이지 번호는 1 이상의 값이어야 합니다."}, status=status.HTTP_400_BAD_REQUEST)

    # 시리얼라이저를 사용한 직렬화 처리
    serializer = CompletedExamListSerializer(paginated_exams, many=True)

    # 응답 데이터 구성
    return Response({
            "completedExamList": serializer.data,
            "prev": paginated_exams.has_previous(),
            "next": paginated_exams.has_next(),
            "totalPage": Paginator(exams, page_size).num_pages
    }, status=status.HTTP_200_OK)


@extend_schema_view(
    get=extend_schema(
        summary='시험 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='시험 조회 성공',
                response=ExamDetailSerializer
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
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description='권한 없음',
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
                description='시험 미존재',
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
        summary='시험 정보 수정',
        request=ExamSerializer,
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='시험 정보 수정 완료',
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
                description='잘못된 인증번호 또는 만료된 인증번호',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description='권한 없음',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
            status.HTTP_409_CONFLICT: OpenApiResponse(
                description='시간 또는 비용 입력 오류',
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
    delete=extend_schema(
        summary='시험 삭제',
        responses={
            status.HTTP_204_NO_CONTENT: OpenApiResponse(description='시험 삭제 성공'),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 인증번호 또는 만료된 인증번호',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description='권한 없음',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    },
                }
            ),
            status.HTTP_409_CONFLICT: OpenApiResponse(
                description='시간 또는 비용 입력 오류',
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
@api_view(['GET', 'PUT', 'DELETE'])
def exam_detail(request, pk):
    # JWT에서 user ID와 role을 추출
    user_id, user_role = get_user_info_from_token(request)
    if not user_id:
        return Response({"message": "사용자 정보가 필요합니다."}, status=status.HTTP_401_UNAUTHORIZED)

    # 탈퇴한 유저일 경우
    user = User.objects.get(id=user_id)
    if not user.is_active:
        return Response({'message': '탈퇴한 사용자입니다.'}, status=status.HTTP_401_UNAUTHORIZED)

    # 사용자의 역할이 host가 아니면 403 Forbidden 반환
    if user_role != 'host':
        return Response({"message": "권한이 없습니다."}, status=status.HTTP_403_FORBIDDEN)

    # 특정 ID의 시험이 존재하는지 확인
    exam = Exam.objects.filter(pk=pk, user_id=user_id, is_deleted=False).first()
    if not exam:
        return Response({"message": "존재하지 않는 시험입니다."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        # GET 요청 처리: 시험 세부 정보 조회
        serializer = ExamDetailSerializer(exam)
        return Response(serializer.data, status=status.HTTP_200_OK)

    elif request.method == 'PUT':
        # PUT 요청 처리: 특정 시험 수정
        serializer = ExamSerializer(exam, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response({"message": "요청 데이터가 유효하지 않습니다. 확인해주세요."}, status=status.HTTP_400_BAD_REQUEST)

        # expected_taker 값이 999를 넘지 않도록 검증
        expected_taker = serializer.validated_data.get("expected_taker", exam.expected_taker)
        if expected_taker > 999:
            return Response({"message": "총 응시자는 999명을 넘을 수 없습니다."}, status=status.HTTP_400_BAD_REQUEST)

        # 기존 비용과 수정된 비용의 차이 계산
        original_cost = exam.cost
        new_cost = serializer.validated_data['cost']
        cost_difference = new_cost - original_cost

        # 시험 생성자의 현재 코인을 가져옴
        exam_creator = exam.user
        creator_coin_amount = exam_creator.coin_amount

        # 시험 생성자의 코인이 비용 차액을 충당할 수 있는지 확인
        if creator_coin_amount < cost_difference:
            return Response({"message": "적립금이 부족합니다. 충전해주세요."}, status=status.HTTP_400_BAD_REQUEST)

        # 차액에 따른 코인 사용 내역 추가
        if cost_difference > 0:
            transaction_type = "use"
        elif cost_difference < 0:
            transaction_type = "refund"
        exam_creator.coin_amount = creator_coin_amount - cost_difference
        exam_creator.save()

        # Coin 내역 기록
        if cost_difference != 0:
            Coin.objects.create(
                user_id=exam_creator.id,
                exam_id=exam.id,
                type=transaction_type,
                amount=abs(cost_difference)
            )

        # 데이터 수정 및 저장
        serializer.save()

        return Response({"message": "수정이 완료되었습니다."}, status=status.HTTP_200_OK)

    elif request.method == "DELETE":
         # 진행 중인 시험은 삭제 불가
        current_time = datetime.datetime.now().time()
        if exam.date == datetime.date.today() and exam.entry_time <= current_time <= exam.end_time:
            return Response({"message": "진행 중인 시험은 삭제할 수 없습니다."}, status=status.HTTP_409_CONFLICT)
        
        # 시험 비용을 반환하고 코인 사용 내역에 기록
        exam_creator = exam.user
        exam_creator.coin_amount += exam.cost
        exam_creator.save()

        # Coin 내역 기록 (삭제에 따른 반환)
        Coin.objects.create(
            user_id=exam_creator.id,
            exam_id=exam.id,
            type="refund",
            amount=exam.cost
        )

        # 시험 삭제
        exam.is_deleted = True
        exam.save()
        return Response({"message": "시험이 성공적으로 삭제되었습니다."}, status=status.HTTP_204_NO_CONTENT)

    # 추가로 명확히 응답을 설정
    return Response({"message": "잘못된 요청입니다."}, status=status.HTTP_400_BAD_REQUEST)


@extend_schema_view(
    get=extend_schema(
        summary='응시 결과 조회',
        responses={
            status.HTTP_200_OK: OpenApiResponse(
                description='응시 결과 조회 성공',
                response=TakerDetailSerializer
            ),
            status.HTTP_400_BAD_REQUEST: OpenApiResponse(
                description='잘못된 요청',
                response={
                    'type': 'object',
                    'properties': {
                        'message': {
                            'type': 'string'
                        },
                    }
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
            ),
            status.HTTP_403_FORBIDDEN: OpenApiResponse(
                description='권한 없음',
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
                description='시험 또는 응시자 미존재',
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
@api_view(['GET'])
def taker_result_view(request, eid, tid):
    # JWT에서 user ID와 role을 추출
    user_id, user_role = get_user_info_from_token(request)
    if not user_id:
        return Response({"message": "사용자 정보가 필요합니다."}, status=status.HTTP_401_UNAUTHORIZED)

    # 탈퇴한 유저일 경우
    user = User.objects.get(id=user_id)
    if not user.is_active:
        return Response({'message': '탈퇴한 사용자입니다.'}, status=status.HTTP_401_UNAUTHORIZED)

    # 사용자의 역할이 host가 아니면 403 Forbidden 반환
    if user_role != 'host':
        return Response({"message": "권한이 없습니다."}, status=status.HTTP_403_FORBIDDEN)

    # 삭제된 시험 여부 확인
    exam_exists = Exam.objects.filter(id=eid, is_deleted=False).exists()
    if not exam_exists:
        return Response({"message": "존재하지 않는 시험입니다."}, status=status.HTTP_404_NOT_FOUND)

    # 응시자 존재 여부 확인
    taker = Taker.objects.filter(id=tid, exam_id=eid).first()
    if not taker:
        return Response({"message": "존재하지 않는 응시자입니다."}, status=status.HTTP_404_NOT_FOUND)

    # 시리얼라이저를 사용한 직렬화 처리
    serializer = TakerDetailSerializer(taker)
    
    # 응답 데이터 구성
    return Response(serializer.data, status=status.HTTP_200_OK)


def get_user_info_from_token(request):
    user = request.user
    if user.is_authenticated:  # 사용자가 인증되었는지 확인
        user_id = user.id  # 기본적으로 User 모델의 PK는 'id'
        user_role = request.auth['role']  # 커스텀 필드 'role'을 가져옴
        return user_id, user_role
    return None, None


def paginate_queryset(queryset, page_number, page_size):
    paginator = Paginator(queryset, page_size)
    
    # 음수 페이지 번호는 잘못된 요청으로 처리
    if page_number < 1:
        return None
    
    # 정상적인 경우 해당 페이지 반환
    return paginator.get_page(page_number)


def send_exam_email(email, exam):
    subject = f"[시험 예약 완료] {exam.title}"
    message = f"""
    안녕하세요,

    {exam.title} 시험이 성공적으로 예약되었습니다! 아래의 시험 정보를 확인해 주세요.

    시험 정보:
    - 제목: {exam.title}
    - 날짜: {exam.date}
    - 입장 가능 시간: {exam.entry_time}
    - 시작 시간: {exam.start_time}
    - 종료 시간: {exam.end_time}
    - 시험 URL: {exam.url}

    응시를 준비하는 데 필요한 자세한 사항은 아래를 참고하세요.

    [시험 응시 방법]
    1. 위의 '시험 URL'을 클릭하여 입장하세요.
    2. 시험 시작 시간에 맞추어 로그인하고, 필요한 절차를 진행해 주세요.

    응시와 관련하여 추가로 궁금한 사항이 있다면 언제든지 문의해 주세요.

    감사합니다.

    ---
    ※ 이 메일은 발신 전용입니다. 회신을 할 수 없습니다.
    """
    send_mail(subject, message, settings.EMAIL_HOST_USER, [email])