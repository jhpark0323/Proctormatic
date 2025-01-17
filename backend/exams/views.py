from django.utils import timezone
from datetime import date, datetime, timedelta
from rest_framework.permissions import AllowAny
from threading import Thread
from django.db.models import F
from django.db import transaction
from django.conf import settings
from django.core.mail import send_mail
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from django.contrib.auth import get_user_model

from proctormatic.utils import bad_request_response, bad_request_invalid_data_response, conflict_response, \
    unauthorized_response, internal_server_error, created_response, not_found_response, ok_with_data_response, \
    ok_response, no_content_response
from .models import Exam
from takers.models import Taker
from coins.models import Coin
from accounts.authentications import CustomAuthentication
from .serializers import ExamSerializer, ScheduledExamListSerializer, OngoingExamListSerializer, \
    CompletedExamListSerializer, ExamDetailSerializer, TakerDetailSerializer, ExamDetailTakerSerializer
from .swagger_schemas import create_exam_schema, scheduled_exam_list_schema, ongoing_exam_list_schema, \
    completed_exam_list_schema, exam_detail_schema, taker_result_view_schema, exam_taker_detail_schema
from django.core.paginator import Paginator

User = get_user_model()


@create_exam_schema
@api_view(['POST'])
@authentication_classes([CustomAuthentication])
def create_exam(request):
    user = request.user

    expected_taker = request.data.get('expected_taker', 0)
    if int(expected_taker) > 999:
        return bad_request_response('총 응시자는 999명을 넘을 수 없습니다.')

    serializer = ExamSerializer(data=request.data)
    if not serializer.is_valid():
        return bad_request_invalid_data_response()

    exam_cost = serializer.validated_data.get('cost', 0)

    date = serializer.validated_data.get('date')
    start_time = serializer.validated_data.get('start_time')
    end_time = serializer.validated_data.get('end_time')
    exit_time = serializer.validated_data.get('exit_time')

    time_validation_response = validate_exam_time(date, start_time, end_time, exit_time)
    if time_validation_response:
        return time_validation_response

    entry_time = (datetime.combine(date, start_time) - timedelta(minutes=30)).time()

    try:
        with transaction.atomic():
            user = User.objects.select_for_update().get(id=user.id)

            if not user.is_active:
                return unauthorized_response('탈퇴한 사용자입니다.')

            if int(user.coin_amount) < int(exam_cost):
                return bad_request_response('적립금이 부족합니다. 충전해주세요.')

            exam_instance = serializer.save(
                user=user,
                entry_time=entry_time,
            )

            # URL 설정과 함께 저장
            exam_instance.url = f"https://k11s209.p.ssafy.io/exams/{exam_instance.id}/"
            exam_instance.save()

            # 코인 차감
            user.coin_amount = F('coin_amount') - exam_cost
            user.save()

            # Coin 내역 생성
            Coin.objects.create(
                user_id=user.id,
                exam_id=exam_instance.id,
                type='use',
                amount=exam_cost
            )

            # 이메일 전송 데이터 준비
            exam_data = {
                'title': exam_instance.title,
                'date': exam_instance.date,
                'entry_time': exam_instance.entry_time,
                'start_time': exam_instance.start_time,
                'end_time': exam_instance.end_time,
                'url': exam_instance.url
            }

    except Exception as e:
        return internal_server_error(str(e))

    # 트랜잭션이 성공적으로 완료된 후 이메일 전송
    send_exam_email_threaded(user.email, exam_data)
    return created_response('시험이 성공적으로 예약되었습니다.')


@scheduled_exam_list_schema
@api_view(['GET'])
@authentication_classes([CustomAuthentication])
def scheduled_exam_list(request):
    user = request.user

    # 현재 시간 가져오기
    current_datetime = timezone.now()
    current_date = current_datetime.date()
    current_time = current_datetime.time()

    # 오늘 이후의 시험들
    future_exams = Exam.objects.filter(
        user_id=user.id,
        date__gt=current_date,
        is_deleted=False
    )

    # 오늘 중에서 시작 시간이 현재 시간 이후인 시험들
    today_future_exams = Exam.objects.filter(
        user_id=user.id,
        date=current_date,
        entry_time__gt=current_time,
        is_deleted=False
    )

    # 두 쿼리셋을 결합하고 정렬
    exams = (future_exams | today_future_exams).order_by('date', 'start_time')

    page = request.GET.get('page', 1)
    size = request.GET.get('size', 10)

    return paginate_queryset(exams, page, size, ScheduledExamListSerializer, 'scheduledExamList')


@ongoing_exam_list_schema
@api_view(['GET'])
@authentication_classes([CustomAuthentication])
def ongoing_exam_list(request):
    user = request.user

    # 현재 시간 가져오기
    current_datetime = timezone.now()
    current_date = current_datetime.date()
    current_time = current_datetime.time()

    # 현재 시간이 entry_time과 end_time 사이에 있는 시험들 필터링
    ongoing_exams = Exam.objects.filter(
        user_id=user.id,
        date=current_date,
        entry_time__lte=current_time,
        end_time__gte=current_time,
        is_deleted=False
    ).order_by('date', 'start_time')

    page = request.GET.get('page', 1)
    size = request.GET.get('size', 10)

    return paginate_queryset(ongoing_exams, page, size, OngoingExamListSerializer, 'ongoingExamList')


@completed_exam_list_schema
@api_view(['GET'])
@authentication_classes([CustomAuthentication])
def completed_exam_list(request):
    user = request.user

    # 현재 시간 가져오기
    current_datetime = timezone.now()
    current_date = current_datetime.date()
    current_time = current_datetime.time()

    # 종료된 시험들 필터링
    completed_exams = Exam.objects.filter(
        user_id=user.id,
        date__lt=current_date,
        is_deleted=False
    )

    # 오늘 날짜의 시험 중에서 종료 시간이 지난 시험들 추가
    today_completed_exams = Exam.objects.filter(
        user_id=user.id,
        date=current_date,
        end_time__lt=current_time,
        is_deleted=False
    )

    # 두 쿼리셋을 결합하고 정렬
    exams = (completed_exams | today_completed_exams).order_by('-date', '-end_time')

    page = request.GET.get('page', 1)
    size = request.GET.get('size', 10)

    return paginate_queryset(exams, page, size, CompletedExamListSerializer, 'completedExamList')


@exam_taker_detail_schema
@api_view(['GET'])
@permission_classes([AllowAny])
def exam_taker_detail(request, pk):
    # 특정 ID의 시험이 존재하는지 확인
    exam = Exam.objects.filter(pk=pk, is_deleted=False).first()
    if not exam:
        return not_found_response('존재하지 않는 시험입니다.')

    # GET 요청 처리: 시험 세부 정보 조회
    serializer = ExamDetailTakerSerializer(exam)
    return ok_with_data_response(serializer.data)


@exam_detail_schema
@api_view(['GET', 'PUT', 'DELETE'])
@authentication_classes([CustomAuthentication])
def exam_detail(request, pk):
    user = request.user

    # 특정 ID의 시험이 존재하는지 확인
    exam = Exam.objects.filter(pk=pk, user_id=user.id, is_deleted=False).first()
    if not exam:
        return not_found_response('존재하지 않는 시험입니다.')

    if request.method == 'GET':
        # GET 요청 처리: 시험 세부 정보 조회
        serializer = ExamDetailSerializer(exam)
        return ok_with_data_response(serializer.data)

    elif request.method == 'PUT':
        # PUT 요청 처리: 특정 시험 수정
        serializer = ExamSerializer(exam, data=request.data, partial=True)
        if not serializer.is_valid():
            return bad_request_invalid_data_response()

        # expected_taker 값이 999를 넘지 않도록 검증
        expected_taker = serializer.validated_data.get("expected_taker", exam.expected_taker)
        if expected_taker > 999:
            return bad_request_response('총 응시자는 999명을 넘을 수 없습니다.')

        # 수정할 날짜 및 시간 필드 가져오기
        exam_date = serializer.validated_data.get('date', exam.date)
        start_time = serializer.validated_data.get('start_time', exam.start_time)
        end_time = serializer.validated_data.get('end_time', exam.end_time)
        exit_time = serializer.validated_data.get('exit_time', exam.exit_time)

        time_validation_response = validate_exam_time(exam_date, start_time, end_time, exit_time)
        if time_validation_response:
            return time_validation_response

        # entry_time 계산
        entry_time = (datetime.combine(exam_date, start_time) - timedelta(minutes=30)).time()

        # 기존 비용과 수정된 비용의 차이 계산
        original_cost = exam.cost
        new_cost = serializer.validated_data.get('cost', original_cost)
        cost_difference = new_cost - original_cost

        # 시험 생성자의 현재 코인을 가져옴
        exam_creator = exam.user
        if int(exam_creator.coin_amount) < cost_difference:
            return bad_request_response('적립금이 부족합니다. 충전해주세요.')

        # 데이터 수정 및 저장
        serializer.save(entry_time=entry_time)

        # 차액에 따른 코인 사용 내역 추가
        if cost_difference > 0:
            transaction_type = "use"
        elif cost_difference < 0:
            transaction_type = "refund"

        exam_creator.coin_amount = exam_creator.coin_amount - cost_difference
        exam_creator.save()

        # Coin 내역 기록
        if cost_difference != 0:
            Coin.objects.create(
                user_id=exam_creator.id,
                exam_id=exam.id,
                type=transaction_type,
                amount=abs(cost_difference)
            )

        return ok_response('수정이 완료되었습니다.')

    elif request.method == "DELETE":
        # 진행 중인 시험은 삭제 불가
        current_time = datetime.now().time()
        if exam.date == date.today() and exam.entry_time <= current_time <= exam.end_time:
            return conflict_response('진행 중인 시험은 삭제할 수 없습니다.')

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
        return no_content_response('시험이 성공적으로 삭제되었습니다.')

    # 추가로 명확히 응답을 설정
    return bad_request_invalid_data_response()


@taker_result_view_schema
@api_view(['GET'])
@authentication_classes([CustomAuthentication])
def taker_result_view(request, eid, tid):
    # 삭제된 시험 여부 확인
    exam_exists = Exam.objects.filter(id=eid, is_deleted=False).exists()
    if not exam_exists:
        return not_found_response('존재하지 않는 시험입니다.')

    # 응시자 존재 여부 확인
    taker = Taker.objects.filter(id=tid, exam_id=eid).first()
    if not taker:
        return not_found_response('존재하지 않는 응시자입니다.')

    # 시리얼라이저를 사용한 직렬화 처리
    serializer = TakerDetailSerializer(taker)

    # 응답 데이터 구성
    return ok_with_data_response(serializer.data)


def paginate_queryset(queryset, page, size, serializer_class, list_name):
    if int(page) <= 0:
        return bad_request_response('잘못된 페이지 요청입니다.')
    if int(size) <= 0:
        return bad_request_response('잘못된 사이즈 요청입니다.')

    paginator = Paginator(queryset, size)
    paginated_exams = paginator.get_page(page)

    serializer = serializer_class(paginated_exams, many=True)

    return ok_with_data_response({
        list_name: serializer.data,
        'prev': paginated_exams.has_previous(),
        'next': paginated_exams.has_next(),
        'totalPage': paginator.num_pages
    })


def validate_exam_time(date, start_time, end_time, exit_time):
    current_time = timezone.now()

    start_datetime = datetime.combine(date, start_time)
    end_datetime = datetime.combine(date, end_time)

    if start_datetime < current_time:
        return conflict_response('시험 예약은 현재 시간 이후로 설정할 수 있어요.')

    if (start_datetime - current_time) < timedelta(minutes=30):
        return conflict_response('응시 시작 시간은 최소 30분 이후부터 설정할 수 있어요.')

    if (end_datetime - start_datetime) > timedelta(minutes=120):
        return bad_request_response('시험 예약 시간은 최대 2시간입니다.')

    if start_time > end_time:
        return conflict_response('응시 시작 시간이 종료 시간보다 늦을 수 없습니다.')

    if not (start_time <= exit_time <= end_time):
        return conflict_response('퇴실 가능 시간을 확인해주세요.')

    return None


def send_exam_email_threaded(email, exam_data):
    def send():
        subject = f"[시험 예약 완료] {exam_data['title']}"
        message = f"""
        안녕하세요,

        {exam_data['title']} 시험이 성공적으로 예약되었습니다! 아래의 시험 정보를 확인해 주세요.

        시험 정보:
        - 제목: {exam_data['title']}
        - 날짜: {exam_data['date']}
        - 입장 가능 시간: {exam_data['entry_time']}
        - 시작 시간: {exam_data['start_time']}
        - 종료 시간: {exam_data['end_time']}
        - 시험 URL: {exam_data['url']}

        응시를 준비하는 데 필요한 자세한 사항은 아래를 참고하세요.

        [시험 응시 방법]
        1. 위의 '시험 URL'을 클릭하여 입장하세요.
        2. 시험 시작 시간에 맞추어 로그인하고, 필요한 절차를 진행해 주세요.

        응시와 관련하여 추가로 궁금한 사항이 있다면 언제든지 문의해 주세요.

        감사합니다.

        ---
        ※ 이 메일은 발신 전용입니다. 회신을 할 수 없습니다.
        """
        try:
            send_mail(subject, message, settings.EMAIL_HOST_USER, [email])
        except Exception as e:
            print(f"이메일 전송 실패: {str(e)}")

    Thread(target=send, daemon=True).start()