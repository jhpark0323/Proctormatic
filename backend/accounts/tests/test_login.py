from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone


User = get_user_model()

class CommonTestSetUp(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            name='test',
            email='test@test.com',
            birth='2024-10-14',
            policy=True,
            marketing=True
        )
        self.user.set_password('password!')
        self.user.save()
        self.inactive_user = User.objects.create(
            name='inactive',
            email='inactive@test.com',
            birth='2024-10-14',
            policy=True,
            marketing=True,
            is_active=False
        )
        self.inactive_user.set_password('password!')
        self.inactive_user.save()
        self.refresh_token = str(RefreshToken.for_user(self.user))
        self.url = '/api/users/login/'

class LoginTestCase(CommonTestSetUp):
    def test_login(self):
        '''
        회원가입이 완료된 사용자가 로그인을 하면 토큰을 반환한다
        '''
        # given
        data = {
            'email': 'test@test.com',
            'password': 'password!'
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_invalid_email_format(self):
        '''
        이메일 형식이 올바르지 않을 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'email': 'test_email',
            'password': 'password!'
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '이메일 형식을 확인해주세요.')

    def test_login_with_blank_email(self):
        '''
        이메일이 입력되지 않은 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'email': '',
            'password': 'password!'
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '이메일을 입력해주세요.')

    def test_login_with_blank_password(self):
        '''
        비밀번호가 입력되지 않은 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'email': 'test@test.com',
            'password': ''
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '비밀번호를 입력해주세요.')

    def test_login_with_not_existing_email(self):
        '''
        user 테이블에 등록되지 않은 사용자가 로그인을 시도할 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'email': 'not_exist@test.com',
            'password': 'password!'
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '입력한 이메일은 등록되어 있지 않습니다.')

    def test_login_with_incorrect_password(self):
        '''
        잘못된 비밀번호를 입력한 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'email': 'test@test.com',
            'password': 'diff_password!'
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '비밀번호가 일치하지 않습니다. 확인 후 다시 시도해 주세요.')

class ReissueTokenTestCase(CommonTestSetUp):
    def test_reissue_token(self):
        '''
        유효한 refresh 토큰을 가진 사용자가 토큰 재발급을 요청한 경우 새로운 access 토큰을 반환한다
        '''
        # given
        data = {
            'refresh': self.refresh_token,
        }

        # when
        response = self.client.patch(self.url, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_reissue_token_missing_refresh_token(self):
        '''
        refresh 토큰이 입력되지 않은 경우 메세지와 400 status을 반환한다
        '''
        # given
        data = {}

        # when
        response = self.client.patch(self.url, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), 'refresh token이 입력되지 않았습니다.')

    def test_reissue_token_with_invalid_refresh_token(self):
        '''
        유효하지 않은 refresh이 입력된 경우 메세지와 400 status을 반환한다
        '''
        # given
        data = {
            'refresh': 'invalid_refresh_token'
        }

        # when
        response = self.client.patch(self.url, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '유효하지 않은 토큰입니다.')

    def test_reissue_token_with_expired_refresh_token(self):
        '''
        만료된 refresh 토큰이 입력된 경우 메세지와 401 status을 반환한다
        '''
        # given
        expired_refresh_token = RefreshToken.for_user(self.user)
        expired_refresh_token.payload['exp'] = int(timezone.now().timestamp() - 300)
        data = {
            'refresh': str(expired_refresh_token)
        }

        # when
        response = self.client.patch(self.url, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '토큰이 만료되었습니다. 다시 로그인 해주세요.')