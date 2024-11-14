from django.contrib.auth import get_user_model
from freezegun import freeze_time
from rest_framework.test import APITestCase
from rest_framework import status
from datetime import timedelta
from django.utils import timezone
from datetime import datetime
from exams.models import Exam
from takers.models import Taker
from takers.serializers import TakerTokenSerializer, AbnormalSerializer

User = get_user_model()

class ExitExamTestCase(APITestCase):
    @freeze_time("2024-11-14 12:00:00")
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser4@example.com',
            password='password',
            name='Test User',
            birth='2000-01-01',
            policy=True,
            marketing=True
        )

        test_time = timezone.now()

        self.exam = Exam.objects.create(
            user=self.user,
            title="Test Exit Exam",
            date=datetime.today(),
            entry_time=test_time - timedelta(minutes=30),
            start_time=test_time.time(),
            exit_time=test_time + timedelta(minutes=30),
            end_time=(test_time + timedelta(hours=2)).time(),
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
        self.url = '/api/taker/'

    @freeze_time("2024-11-14 12:50:00")
    def test_exit_exam_success(self):
        '''
        퇴실(시험 종료) 성공 - 200
        '''
        # Given
        # When
        response = self.client.patch(self.url, HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], '시험이 종료되었습니다.')

    @freeze_time("2024-11-14 12:10:00")
    def test_exit_before_allowed_time(self):
        '''
        퇴실 가능 시간이 아닌데 퇴실하려는 경우
        '''
        # Given
        # When
        response = self.client.patch(self.url, HTTP_AUTHORIZATION=f'Bearer {self.token}')
        # Then
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data['message'], '퇴실 가능 시간이 아닙니다.')
