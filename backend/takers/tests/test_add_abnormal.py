from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import timedelta
from django.utils import timezone
from datetime import datetime
from exams.models import Exam
from takers.models import Taker
from takers.serializers import TakerTokenSerializer, AbnormalSerializer

User = get_user_model()

class UpdateTakerTestCase(APITestCase):
    def setUp(self):
        self.detected_time = (timezone.now() - timedelta(minutes=10)).strftime('%H:%M:%S')
        self.end_time = timezone.now().strftime('%H:%M:%S')

        self.user = User.objects.create_user(
            email='testuser3@example.com',
            password='password',
            name='Test User',
            birth='2000-01-01',
            policy=True,
            marketing=True
        )

        start_time = timezone.now()

        self.exam = Exam.objects.create(
            user=self.user,
            title="Test Abnormal",
            date=datetime.today(),
            entry_time=start_time - timedelta(minutes=30),
            start_time=start_time.time(),
            exit_time=start_time.time(),
            end_time=(timezone.now() + timedelta(hours=2)).time(),
            url="https://example.com",
            expected_taker=10,
            cost=10
        )

        self.taker = Taker.objects.create(
            name="Test Taker",
            exam=self.exam,
            email="taker@example.com",
        )
        self.token =str(TakerTokenSerializer.get_access_token(self.taker))
        self.url = '/api/taker/abnormal/'

    def test_add_abnormal_success(self):
        '''
        이상행동 구간 등록 성공 - 201
        '''
        # Given
        data = {
            'detected_time': self.detected_time,
            'end_time': self.end_time,
            'type': 'cup'
        }

        # When
        response = self.client.post(self.url, data, HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Then
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['message'], '이상행동 영상이 등록되었습니다.')

    def test_add_abnormal_failure_detected_time(self):
        '''
        이상행동 구간 등록 실패(누락된 데이터, detected_time), - 400
        '''
        # Given
        data = {
            'end_time': self.end_time,
            'type': 'cup'
        }

        # When
        response = self.client.post(self.url, data, HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], '발생 시간을 입력해주세요.')

    def test_add_abnormal_failure_end_time(self):
        '''
        이상행동 구간 등록 실패(누락된 데이터, end_time), - 400
        '''
        # Given
        data = {
            'detected_time': self.detected_time,
            'type': 'cup'
        }

        # When
        response = self.client.post(self.url, data, HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], '종료 시간을 입력해주세요.')

    def test_add_abnormal_failure_type(self):
        '''
        이상행동 구간 등록 실패(누락된 데이터, end_time), - 400
        '''
        # Given
        data = {
            'detected_time': self.detected_time,
            'end_time': self.end_time,
        }

        # When
        response = self.client.post(self.url, data, HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], '타입을 입력해주세요.')

    def test_invalid_data_detected_time_later_than_end_time(self):
        """
        이상행동 구간 등록 실패(발생시간이 종료시간보다 나중인 경우) - 400
        """
        # Given
        data = {
            'taker': self.taker.id,
            'detected_time': self.end_time, # 시작 시간과 종료 시간을 반대로 사용
            'end_time': self.detected_time,
            'type': 'cup'
        }

        # When
        response = self.client.post(self.url, data, HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Then
        serializer = AbnormalSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertEqual(response.data['message'], '발생시간이 종료시간보다 큽니다.')
