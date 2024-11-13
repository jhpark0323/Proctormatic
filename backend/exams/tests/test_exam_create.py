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
        탈퇴한 사용자가 시험 예약을 요청할 경우 메세지와 403 status를 반환한다
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
        토큰이 없는(로그인 하지 않은) 사용자가 시험 예약을 요청할 경우 메세지와 403 status를 반환한다
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