from django.utils import timezone
from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import datetime
from rest_framework import status
from datetime import timedelta
from exams.models import Exam
from unittest.mock import patch

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

    @patch('takers.views.generate_verification_code', return_value='123456')
    @patch('takers.views.send_verification_email')
    @patch('takers.views.save_verification_code_to_redis')
    def test_send_verification_code_success(self, mock_save_code, mock_send_email, mock_generate_code):
        '''
        인증번호 발송 성공 - 200
        '''
        # Given
        data = {
            "id": self.exam.id,
            "email": "newuser@example.com"
        }

        # When
        response = self.client.post(self.url, data, content_type='application/json')

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], '인증번호를 발송했습니다.')
        mock_send_email.assert_called_once_with(data['email'], '123456')
        mock_save_code.assert_called_once_with(data['email'], '123456')

    def test_send_verification_code_invalid_email(self):
        """
        이메일 형식이 잘못된 경우 - 400
        """
        data = {
            "id": self.exam.id,
            "email": "invalid-email-format"
        }
        response = self.client.post(self.url, data, content_type='application/json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], '이메일 형식을 확인해주세요.')

    def test_send_verification_code_duplicate_email(self):
        """
        중복된 이메일이 존재하는 경우 - 409
        """
        Taker.objects.create(email="duplicate@example.com", exam=self.exam)

        data = {
            "id": self.exam.id,
            "email": "duplicate@example.com"
        }
        response = self.client.post(self.url, data, content_type='application/json')

        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.data['message'], '이미 존재하는 이메일입니다. 다른 이메일을 사용해주세요.')

    def test_send_verification_code_missing_email(self):
        """
        이메일이 입력되지 않은 경우 - 400
        """
        data = {
            "id": self.exam.id
        }
        response = self.client.post(self.url, data, content_type='application/json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], '이메일을 입력해주세요.')