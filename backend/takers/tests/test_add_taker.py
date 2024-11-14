from django.utils import timezone
from django.test import TestCase
from django.contrib.auth import get_user_model
from datetime import datetime
from rest_framework import status
from datetime import timedelta
from exams.models import Exam
from takers.models import Taker

User = get_user_model()

class AddTakerTestCase(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser2@example.com',
            password='password',
            name='Test User',
            birth='1990-01-01',
            policy=True,
            marketing=True
        )

        start_time = timezone.now()

        self.exam = Exam.objects.create(
            user=self.user,
            title="Sample Exam",
            date=datetime.today(),
            entry_time=start_time - timedelta(minutes=30),
            start_time=start_time.time(),
            exit_time=start_time.time(),
            end_time=(timezone.now() + timedelta(hours=2)).time(),
            url="http://exa0mple.com",
            expected_taker=10,
            cost=10
        )
        self.url = '/api/taker/'

    def test_add_taker_success(self):
        '''
        응시자 등록 성공 - 201
        '''
        # Given
        data = {
            "exam" : self.exam.id,
            "name" : "testUser",
            "email" : "test@example.com",
        }

        # When
        response = self.client.post(self.url, data, content_type='application/json')

        # Then
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)

    def test_add_taker_before_entry_time(self):
        '''
        입장 가능 시간 전에 입실하려는 경우 - 400
        '''
        # Given
        self.exam.entry_time = timezone.now() + timedelta(minutes=30)
        self.exam.save()

        data = {
            "exam": self.exam.id,
            "name": "testUser",
            "email": "test@example.com",
        }

        # When
        response = self.client.post(self.url, data, content_type='application/json')

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], '입장 가능 시간이 아닙니다. 입장은 시험 시작 30분 전부터 가능합니다.')

    def test_add_taker_after_exam_end_time(self):
        '''
        시험이 종료 된 후 입실하려는 경우 - 400
        '''
        # Given
        self.exam.end_time = (timezone.now() - timedelta(hours=1)).time()
        self.exam.save()

        data = {
            "exam": self.exam.id,
            "name": "testUser",
            "email": "test@example.com",
        }

        # When
        response = self.client.post(self.url, data, content_type='application/json')

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], '종료된 시험입니다.')

    def test_add_existing_taker_with_checkout(self):
        '''
        이미 정상적인 퇴실을 하였는데 재입실 하려는 경우 - 403
        '''
        # Given
        taker = Taker.objects.create(
            exam=self.exam,
            name="testUser",
            email="test@example.com",
            check_out_state="normal"
        )

        data = {
            "exam": self.exam.id,
            "name": "testUser",
            "email": "test@example.com",
        }

        # When
        response = self.client.post(self.url, data, content_type='application/json')

        #Then
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(response.data['message'], '이미 퇴실한 사용자입니다.')

    def test_add_taker_Re_entry(self):
        '''
        재입장하는 경우 - 200
        '''
        # Given
        taker = Taker.objects.create(
            exam=self.exam,
            name="testUser",
            email="test@example.com",
            check_out_state="abnormal"
        )

        data = {
            "exam": self.exam.id,
            "name": "testUser",
            "email": "test@example.com",
        }

        # When
        response = self.client.post(self.url, data, content_type='application/json')

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_add_taker_expected_taker_limit(self):
        '''
        시험의 예상 참가자 수를 넘어서는 경우(입실 불가) - 429
        '''
        # Given
        self.exam.total_taker = self.exam.expected_taker
        self.exam.save()

        data = {
            "exam": self.exam.id,
            "name": "testUser",
            "email": "test@example.com",
        }

        # When
        response = self.client.post(self.url, data, content_type='application/json')

        # Then
        self.assertEqual(response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        self.assertEqual(response.data['message'], '참가자 수를 초과했습니다.')

    def test_add_taker_bad_request(self):
        '''
        필수 파라미터 없이 요청을 보내는 경우 - 400
        '''
        # Given
        data = {
            "exam": self.exam.id,
            "name": "",
            "email": "test@example.com",
        }

        # When
        response = self.client.post(self.url, data, content_type='application/json')

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], "잘못된 요청입니다.")