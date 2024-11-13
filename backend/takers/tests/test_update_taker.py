from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from unittest.mock import patch
from rest_framework import status
from datetime import timedelta
from django.utils import timezone
from datetime import datetime
from PIL import Image
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile
from exams.models import Exam
from takers.models import Taker
from takers.serializers import TakerTokenSerializer

User = get_user_model()

class UpdateTakerTestCase(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='testuser2@example.com',
            password='password',
            name='Test User',
            birth='2000-01-01',
            policy=True,
            marketing=True
        )

        start_time = timezone.now()

        self.exam = Exam.objects.create(
            user=self.user,
            title="Test Exam",
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
        self.url = '/api/taker/photo/'

    def create_dummy_image(self):
        image = Image.new('RGB', (100, 100), color=(255, 0, 0))
        img_byte_arr = BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        dummy_image_file = SimpleUploadedFile(
            "dummy_image.png",
            img_byte_arr.read(),
            content_type='image/png'
        )
        return dummy_image_file

    def test_update_taker_success(self):
        '''
        응시자 정보 수정 성공 - 200
        '''
        # Given
        dummy_image = self.create_dummy_image()
        data = {
            'id_photo': dummy_image,
            'birth': '19900101',
            'verification_rate': 95
        }

        # When
        response = self.client.patch(self.url, data, format='multipart', HTTP_AUTHORIZATION=f'Bearer {self.token}')
        # Then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['message'], '신분증이 등록되었습니다.')

    def test_update_taker_missing_fields(self):
        '''
        응시자 정보 수정 시 필수 필드가 없을 때 - 400
        '''
        # Given
        data = {
            'birth': '19900101',
            'verification_rate': 95
        }

        # When
        response = self.client.patch(self.url, data, format='multipart', HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data['message'], '잘못된 요청입니다.')

    @patch('boto3.client')
    def test_update_taker_s3_upload_failure(self, mock_s3_client):
        '''
        S3 업로드 실패 시 - 500
        '''
        # Given
        dummy_image = self.create_dummy_image()
        data = {
            'id_photo': dummy_image,
            'birth': '19900101',
            'verification_rate': 95
        }

        mock_s3_client.return_value.upload_fileobj.side_effect = Exception("S3 업로드 실패")

        # When
        response = self.client.patch(self.url, data, format='multipart', HTTP_AUTHORIZATION=f'Bearer {self.token}')

        # Then
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.data['message'], 'S3 업로드 실패: S3 업로드 실패')