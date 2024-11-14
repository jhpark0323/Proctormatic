from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from django.utils import timezone
from datetime import timedelta

from exams.models import Exam
from coins.models import Coin


User = get_user_model()

class CommenTestSetUp(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            name='test',
            email='test@test.com',
            birth='2024-10-14',
            coin_amount=1000,
            policy=True,
            marketing=True
        )
        self.inactive_user = User.objects.create(
            name='inactive',
            email='inactive@test.com',
            birth='2024-10-14',
            coin_amount=1000,
            policy=True,
            marketing=True,
            is_active=False
        )
        self.exam = Exam.objects.create(
            user=self.user,
            title='first exam',
            date=(timezone.now() + timedelta(days=1)).date(),
            entry_time='09:30:00',
            start_time='10:00:00',
            end_time='12:00:00',
            exit_time='11:30:00',
            expected_taker=10,
            cost=600
        )
        self.inactive_user_exam = Exam.objects.create(
            user=self.inactive_user,
            title='second exam',
            date=(timezone.now() + timedelta(days=1)).date(),
            entry_time='09:30:00',
            start_time='10:00:00',
            end_time='12:00:00',
            exit_time='11:30:00',
            expected_taker=10,
            cost=600
        )
        self.url = '/api/exam/'

    def get_token(self, user):
        token = AccessToken.for_user(user)
        token['role'] = 'host'
        return token

class ExamCreateTestCase(CommenTestSetUp):
    def test_create_exam(self):
        '''
        정상적으로 시험을 등록한 경우 시험이 예약되고 201 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        future_date = (timezone.now() + timedelta(days=1)).date()
        data = {
            'title': 'test exam',
            'date': future_date,
            'start_time': '10:00:00',
            'end_time': '12:00:00',
            'exit_time': '11:30:00',
            'expected_taker': 10,
            'cost': 600
        }

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        exam_instance = Exam.objects.get(title='test exam')
        self.assertTrue(exam_instance.url.startswith('https://k11s209.p.ssafy.io/exams/'))
        coin_record = Coin.objects.filter(user=self.user, exam=exam_instance).first()
        self.assertIsNotNone(coin_record)
        self.assertEqual(coin_record.amount, 600)

    def test_create_exam_with_inactive_user(self):
        '''
        탈퇴한 사용자가 시험 예약을 요청할 경우 메세지와 401 status를 반환한다
        '''
        # given
        token = self.get_token(self.inactive_user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        future_date = (timezone.now() + timedelta(days=1)).date()
        data = {
            'title': 'test exam',
            'date': future_date,
            'start_time': '10:00:00',
            'end_time': '12:00:00',
            'exit_time': '11:30:00',
            'expected_taker': 10,
            'cost': 600
        }

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_create_exam_with_invalid_user(self):
        '''
        토큰이 없는(로그인 하지 않은) 사용자가 시험 예약을 요청할 경우 메세지와 401 status를 반환한다
        '''
        # given
        future_date = (timezone.now() + timedelta(days=1)).date()
        data = {
            'title': 'test exam',
            'date': future_date,
            'start_time': '10:00:00',
            'end_time': '12:00:00',
            'exit_time': '11:30:00',
            'expected_taker': 10,
            'cost': 600
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_create_exam_with_expected_taker_exceed_limit(self):
        '''
        예상 응시자 수가 999명을 초과하면 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        future_date = (timezone.now() + timedelta(days=1)).date()
        data = {
            'title': 'test exam',
            'date': future_date,
            'start_time': '10:00:00',
            'end_time': '12:00:00',
            'exit_time': '11:30:00',
            'expected_taker': 1000,
            'cost': 600
        }

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '총 응시자는 999명을 넘을 수 없습니다.')

    def test_create_exam_with_start_time_in_the_past(self):
        '''
        시험 시작 시간이 현재 시간보다 이전인 경우 메세지와 409 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        past_date = (timezone.now() - timedelta(days=1)).date()
        data = {
            'title': 'test exam',
            'date': past_date,
            'start_time': '10:00:00',
            'end_time': '12:00:00',
            'exit_time': '11:30:00',
            'expected_taker': 10,
            'cost': 600
        }

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json().get('message'), '시험 예약은 현재 시간 이후로 설정할 수 있어요.')

    def test_create_exam_with_insufficient_time_to_start(self):
        '''
        시험 시작 시간이 현재 시간보다 30분 미만으로 남은 경우 메세지와 409 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'title': 'test exam',
            'date': timezone.now().date(),
            'start_time': (timezone.now() + timedelta(minutes=20)).time(),
            'end_time': (timezone.now() + timedelta(minutes=100)).time(),
            'exit_time': (timezone.now() + timedelta(minutes=90)).time(),
            'expected_taker': 10,
            'cost': 600
        }

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json().get('message'), '응시 시작 시간은 현 시간 기준 최소 30분 이후부터 설정할 수 있어요.')

    def test_create_exam_with_exceeding_duration(self):
        '''
        시험 시간이 2시간 초과한 경우 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        future_date = (timezone.now() + timedelta(days=1)).date()
        data = {
            'title': 'test exam',
            'date': future_date,
            'start_time': '10:00:00',
            'end_time': '13:00:00',
            'exit_time': '12:30:00',
            'expected_taker': 10,
            'cost': 600
        }

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '시험 예약 시간은 최대 2시간입니다.')

    def test_create_exam_with_exit_time_outside_start_end(self):
        '''
        퇴실 가능 시간이 시작 시간과 끝 시간 사이에 있지 않은 경우 메세지와 409 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        future_date = (timezone.now() + timedelta(days=1)).date()
        data = {
            'title': 'test exam',
            'date': future_date,
            'start_time': '10:00:00',
            'end_time': '12:00:00',
            'exit_time': '12:30:00',
            'expected_taker': 10,
            'cost': 600
        }

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json().get('message'), '퇴실 가능시간은 시험 시작시간과 종료시간 사이로 설정할 수 있어요.')

class ExamUpdateTestCase(CommenTestSetUp):
    def test_update_exam(self):
        '''
        예약한 시험을 수정 요청하면 시험을 수정하고 200 status를 반환한다(일부만 수정 가능)
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.exam.id}/'
        data = {
            'title': 'update test exam'
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.exam.refresh_from_db()
        self.assertEqual(self.exam.title, 'update test exam')

    def test_update_exam_with_inactive_user(self):
        '''
        탈퇴한 사용자가 시험 수정을 요청할 경우 메세지와 403 status를 반환한다
        '''
        # given
        token = self.get_token(self.inactive_user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.inactive_user_exam.id}/'
        data = {
            'title': 'update test exam'
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_update_exam_with_invalid_user(self):
        '''
        토큰이 없는(로그인 하지 않은) 사용자가 시험 수정을 요청할 경우 메세지와 401 status를 반환한다
        '''
        # given
        url = f'{self.url}{self.exam.id}/'
        data = {
            'title': 'update test exam'
        }

        # when
        response = self.client.put(url, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_update_exam_not_exist_exam(self):
        '''
        존재하지 않는 시험을 수정하고자 하면 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        not_exist_exam_id = 999
        url = f'{self.url}{not_exist_exam_id}/'
        data = {
            'title': 'update test exam'
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '존재하지 않는 시험입니다.')

    def test_update_exam_start_time_in_the_past(self):
        '''
        응시 시작 시간을 현재 시간 이전으로 수정 요청한 경우 메세지와 409 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.exam.id}/'
        data = {
            'date': timezone.now().date(),
            'start_time': (timezone.now() - timedelta(hours=1)).time(),
            'end_time': (timezone.now() + timedelta(hours=1)).time(),
            'exit_time': (timezone.now() + timedelta(hours=1)).time(),
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json().get('message'), '시험 예약은 현재 시간 이후로 설정할 수 있어요.')

    def test_update_exam_start_time_too_soon(self):
        '''
        응시 시작 시간이 현재 시간으로부터 최소 30분 후가 아닌 시간으로 수정 요청한 경우 메세지와 409 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.exam.id}/'
        data = {
            'date': timezone.now().date(),
            'start_time': (timezone.now() + timedelta(minutes=20)).time(),
            'end_time': (timezone.now() + timedelta(hours=1, minutes=20)).time(),
            'exit_time': (timezone.now() + timedelta(hours=1)).time(),
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json().get('message'), '응시 시작 시간은 현 시간 기준 최소 30분 이후부터 설정할 수 있어요.')

    def test_update_exam_duration_exceeds_two_hours(self):
        '''
        2시간을 초과한 예약 시간으로 수정 요청한 경우 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.exam.id}/'
        data = {
            'end_time': '13:00:00'
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '시험 예약 시간은 최대 2시간입니다.')

    def test_update_exam_start_time_after_end_time(self):
        '''
        시작 시간이 종료 시간보다 늦은 시간으로 수정 요청한 경우 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.exam.id}/'
        data = {
            'start_time': '12:30:00',
            'end_time': '12:00:00'
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json().get('message'), '응시 시작 시간이 응시 끝나는 시간보다 늦을 수 없습니다.')

    def test_update_exam_exit_time_not_between_start_and_end(self):
        '''
        퇴실 가능 시간을 시작 시간과 종료 시간 사이로 수정 요청하지 않은 경우 메세지와 409 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.exam.id}/'
        data = {
            'exit_time': '12:30:00'
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json().get('message'), '퇴실 가능시간은 시험 시작시간과 종료시간 사이로 설정할 수 있어요.')

    def test_update_exam_expected_taker_exceeds_limit(self):
        '''
        응시 예상 인원을 999명보다 많게 수정하고자 하는 경우 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.exam.id}/'
        data = {
            'expected_taker': 1000
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '총 응시자는 999명을 넘을 수 없습니다.')

    def test_update_exam_insufficient_coins_for_cost_difference(self):
        '''
        비용 차액으로 적립금이 부족한 경우 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.exam.id}/'
        data = {
            'cost': 2000
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '적립금이 부족합니다. 충전해주세요.')

    def test_update_exam_cost_difference_negative(self):
        '''
        비용 차액이 음수일 경우 적립금을 환불하고 시험 정보를 수정하고 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.exam.id}/'
        data = {
            'cost': 400
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.coin_amount, 1200)

class ExamCheckTestCase(CommenTestSetUp):
    def test_check_exam(self):
        '''
        시험 조회를 요청하면 시험의 정보와 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.exam.id}/'

        # when
        response = self.client.get(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('title'), 'first exam')
        self.assertEqual(response.data.get('expected_taker'), 10)

    def test_check_exam_not_exist(self):
        '''
        존재하지 않는 질문을 조회하려고 하면 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        not_exist_exam_id = 999
        url = f'{self.url}{not_exist_exam_id}/'

        # when
        response = self.client.get(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '존재하지 않는 시험입니다.')

    def test_check_exam_different_user(self):
        '''
        다른 사람의 시험을 조회하려고 하면 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.inactive_user_exam.id}/'

        # when
        response = self.client.get(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '존재하지 않는 시험입니다.')

class ExamDeleteTestCase(CommenTestSetUp):
    def test_delete_exam(self):
        '''
        요청한 시험을 삭제하고 204 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.exam.id}/'

        # when
        response = self.client.delete(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.exam.refresh_from_db()
        self.assertTrue(self.exam.is_deleted)

        self.user.refresh_from_db()
        self.assertEqual(self.user.coin_amount, 1600)

        coin_record = Coin.objects.filter(user=self.user, exam_id=self.exam.id, type='refund').first()
        self.assertIsNotNone(coin_record)
        self.assertEqual(coin_record.amount, 600)

    def test_delete_exam_not_exist(self):
        '''
        존재하지 않는 시험을 삭제하고자 하면 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        not_exist_exam_id = 999
        url = f'{self.url}{not_exist_exam_id}/'

        # when
        response = self.client.delete(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '존재하지 않는 시험입니다.')

    def test_delete_exam_in_progress(self):
        '''
        진행 중인 시험을 삭제하고자 하면 메세지와 409 status를 반환한다
        '''
        # given
        self.exam.date = timezone.now().date()
        self.exam.start_time = (timezone.now() - timedelta(minutes=30)).time()
        self.exam.entry_time = (timezone.now() - timedelta(hours=1)).time()
        self.exam.end_time = (timezone.now() + timedelta(minutes=30)).time()
        self.exam.exit_time = timezone.now().time()
        self.exam.save()

        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.exam.id}/'

        # when
        response = self.client.delete(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json().get('message'), '진행 중인 시험은 삭제할 수 없습니다.')

class ExamTakerDetailTestCase(CommenTestSetUp):
    def test_check_exam_for_taker(self):
        '''
        응시자가 시험을 조회하면 시험 결과와 200 status를 반환한다
        '''
        # given
        url = f'{self.url}{self.exam.id}/taker/'

        # when
        response = self.client.get(url)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('title'), 'first exam')

    def test_check_exam_for_taker_not_exist(self):
        '''
        존재하지 않는 시험을 존재하면 메세지와 404 status를 반환한다
        '''
        # given
        not_exist_exam_id = 999
        url = f'{self.url}{not_exist_exam_id}/taker/'

        # when
        response = self.client.get(url)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data.get('message'), '존재하지 않는 시험입니다.')