from django.contrib.auth import get_user_model
from django.utils import timezone
from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import datetime
from rest_framework import status
from datetime import timedelta
from exams.models import Exam
from takers.models import Taker

User = get_user_model()

class CheckEmailTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='emailCheck1@example.com',
            password='password',
            name='Test User',
            birth='1990-01-01',
            policy=True,
            marketing=True
        )

        start_time = timezone.now()

        self.exam = Exam.objects.create(
            user=self.user,
            title="Email Dublication Check",
            date=datetime.today(),
            entry_time=start_time - timedelta(minutes=30),
            start_time=start_time.time(),
            exit_time=start_time.time(),
            end_time=(timezone.now() + timedelta(hours=2)).time(),
            url="http://example.com",
            expected_taker=10,
            cost=10
        )
        self.url = '/api/taker/email/'

    def test_check_email_success(self):
        '''
        이메일 중복 체크 성공 - 200
        '''
        # Given
        Taker.objects.create(email="test@example.com", exam=self.exam)
        params = {
            "email": "test@example.com",
            "id": self.exam.id
        }

        # When
        response = self.client.get(self.url, params)

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data['isAlreadyExists'])

    def test_check_email_missing_params(self):
        '''
        이메일 또는 시험 ID 누락 - 400
        '''
        # Given
        params = {
            "email": "test@example.com"
        }

        # When
        response = self.client.get(self.url, params)

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], '이메일과 시험 ID를 모두 입력해야 합니다.')

    def test_check_invalid_email_format(self):
        '''
        유효하지 않은 이메일 형식 - 400
        '''
        # Given
        params = {
            "email": "invalid-email",
            "id": self.exam.id
        }

        # When
        response = self.client.get(self.url, params)

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], '유효하지 않은 이메일 형식입니다.')

    def test_check_invalid_exam_id(self):
        '''
        유효하지 않은 시험 ID - 404
        '''
        # Given
        params = {
            "email": "test@example.com",
            "id": 99999  # Invalid exam ID
        }

        # When
        response = self.client.get(self.url, params)

        # Then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data['message'], '유효하지 않은 시험 ID입니다.')
