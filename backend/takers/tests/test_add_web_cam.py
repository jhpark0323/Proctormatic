from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from datetime import timedelta
from django.utils import timezone
from datetime import datetime
from exams.models import Exam
from takers.models import Taker
from takers.serializers import TakerTokenSerializer
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status

User = get_user_model()

class AddWebCamTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='addwebcam1@example.com',
            password='password',
            name='Test User',
            birth='2000-01-01',
            policy=True,
            marketing=True
        )

        start_time = timezone.now()

        self.exam = Exam.objects.create(
            user=self.user,
            title="Add Web Cam",
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
        self.url = '/api/taker/webcam/'

    def create_dummy_video(self):
        # WebM 파일 헤더에 해당하는 간단한 바이트 데이터를 생성
        video_content = b'\x1A\x45\xDF\xA3'  # WebM 파일의 EBML 헤더 부분

        dummy_video_file = SimpleUploadedFile(
            "dummy_video.webm",
            video_content,
            content_type='video/webm'
        )
        return dummy_video_file

    def test_add_web_cam_success(self):
        '''
        웹캠 영상 저장 성공 - 200
        '''
        # Given
        dummy_video = self.create_dummy_video()
        data = {
            'web_cam': dummy_video,
            'start_time': '12:00',
            'end_time': '13:00'
        }

        # When
        response = self.client.post(self.url, data, format='multipart', HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], '웹캠 영상이 저장되었습니다.')

    def test_add_web_cam_missing_web_cam(self):
        '''
        웹캠 영상 누락 - 400
        '''
        # Given
        data = {
            'start_time': '12:00',
            'end_time': '13:00'
        }

        # When
        response = self.client.post(self.url, data, format='multipart', HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], '잘못된 요청입니다.')

    def test_add_web_cam_missing_start_time(self):
        '''
        시작 시간이 누락된 경우 - 400
        '''
        # Given
        dummy_video = self.create_dummy_video()
        data = {
            'web_cam': dummy_video,
            'end_time': '13:00'
        }

        # When
        response = self.client.post(self.url, data, format='multipart', HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], '잘못된 요청입니다.')

    def test_add_web_cam_start_time_greater_than_end_time(self):
        '''
        start_time이 end_time보다 클 때 - 400
        '''
        # Given
        dummy_video = self.create_dummy_video()
        data = {
            'web_cam': dummy_video,
            'start_time': '14:30',
            'end_time': '13:30'
        }

        # When
        response = self.client.post(
            self.url,
            data,
            format='multipart',
            HTTP_AUTHORIZATION=f'Bearer {self.token}'
        )

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], '시작 시간이 종료 시간보다 클 수 없습니다.')