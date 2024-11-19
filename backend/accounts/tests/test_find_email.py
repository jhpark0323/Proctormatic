from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from datetime import datetime


User = get_user_model()

class CommonTestSetUp(TestCase):
    def setUp(self):
        self.user1 = User.objects.create(
            name="test",
            birth="1999-01-01",
            email="user1@test.com",
            policy=True,
            marketing=True,
            is_active=True,
        )
        self.user1.created_at = datetime(2024, 1, 1)
        self.user1.save()
        self.user2 = User.objects.create(
            name="test",
            birth="1999-01-01",
            email="user2@test.com",
            policy=True,
            marketing=True,
            is_active=True,
        )
        self.user2.created_at = datetime(2024, 7, 1)
        self.user2.save()
        self.inactive_user = User.objects.create(
            name="inactive",
            birth="1999-01-01",
            email="inactive@test.com",
            policy=True,
            marketing=True,
            is_active=False,
        )
        self.inactive_user.created_at = datetime(2024, 1, 1)
        self.inactive_user.save()
        self.url = '/api/users/find/email/'

class FindEmailTestCase(CommonTestSetUp):
    def test_find_email(self):
        '''
        이름과 이메일을 입력하면 일치하는 이메일 리스트를 반환한다(2개 이상이면 내림차순)
        '''
        # given
        data = {
            'name': 'test',
            'birth': '19990101',
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['size'], 2)
        self.assertEqual(response.data['emailList'][0]['email'], 'user2@test.com')
        self.assertEqual(response.data['emailList'][1]['email'], 'user1@test.com')

    def test_find_email_no_result(self):
        '''
        일치하는 이메일 리스트가 없는 경우 빈 리스트를 반환한다
        '''
        # given
        data = {
            'name': 'no_user',
            'birth': '20240101',
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['size'], 0)

    def test_find_email_inactive_user(self):
        '''
        탈퇴한 user의 이름과 이메일을 입력하면 빈 리스트를 반환한다
        '''
        # given
        data = {
            'name': 'inactive',
            'birth': '19990101',
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['size'], 0)

    def test_find_email_with_invalid_birth_format(self):
        '''
        생년월일을 잘못된 날짜 형식으로 입력하면 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'name': 'test',
            'birth': '990101',
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '날짜 형식이 올바르지 않습니다. YYYYMMDD 형식이어야 합니다.')

    def test_find_email_with_future_birth_date(self):
        '''
        생년월일을 오늘 이후의 날짜로 요청한 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'name': 'test',
            'birth': '20241231',
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '생년월일은 오늘 날짜 이전이어야 합니다.')