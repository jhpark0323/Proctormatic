from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from unittest.mock import patch
from rest_framework_simplejwt.tokens import AccessToken


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
        self.user.set_password('old_password!')
        self.user.save()

        self.url = '/api/users/password/'
        self.url2 = '/api/users/email/password/'

    def get_token(self, user):
        token = AccessToken.for_user(user)
        token['role'] = 'host'
        return token

class SendEmailForResetPasswordTestCase(CommonTestSetUp):
    @patch('accounts.views.send_verification_email')
    @patch('accounts.views.save_verification_code_to_redis')
    def test_send_email(self, mock_save_to_redis, mock_send_email):
        '''
        가입된 회원의 이름과 이메일이 입력되면 인증번호를 발송하고, 메세지와 200 status를 반환한다
        '''
        # given
        data = {
            'name': 'test',
            'email': 'test@test.com'
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('message'), '인증번호를 발송했습니다.')
        mock_send_email.assert_called_once_with('test@test.com', mock_save_to_redis.call_args[0][1])

    def test_send_email_without_name(self):
        '''
        이름을 입력하지 않은 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'email': 'test@test.com'
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '성명을 입력해주세요.')

    def test_send_email_without_email(self):
        '''
        이메일을 입력하지 않은 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'name': 'test'
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '이메일을 입력해주세요.')

    def test_send_email_invalid_email(self):
        '''
        올바른 이메일 형식이 입력되지 않은 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'name': 'test',
            'email': 'test_email'
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '이메일 형식을 확인해주세요.')

    def test_send_email_not_found_user(self):
        '''
        가입되지 않은 회원의 이름과 이메일이 입력되면 메세지와 404 status를 반환한다
        '''
        # given
        data = {
            'name': 'not_exist_user',
            'email': 'not_exist@test.com'
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '가입된 회원이 아닙니다. 성명과 이메일을 확인해주세요.')

class ResetPasswordTestCase(CommonTestSetUp):
    def test_reset_password(self):
        '''
        새로운 비밀번호로 변경 요청이 오면 비밀번호를 변경하고, 메세지와 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'password1': 'new_password!',
            'password2': 'new_password!'
        }
        # when
        response = self.client.put(self.url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('message'), '비밀번호가 성공적으로 변경되었습니다.')
        self.user.refresh_from_db()
        self.assertFalse(self.user.check_password("old_password!"))
        self.assertTrue(self.user.check_password("new_password!"))

    def test_reset_password_unauthenticated(self):
        '''
        권한이 없는 사용자가 요청을 보내면 메세지와 401 status를 반환한다
        '''
        # given
        data = {
            'password1': 'new_password!',
            'password2': 'new_password!'
        }

        # when
        response = self.client.put(self.url, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_reset_password_not_match_passwords(self):
        '''
        일치하지 않은 비밀번호로 입력되면 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'password1': 'new_password!',
            'password2': 'new_password_different!'
        }

        # when
        response = self.client.put(self.url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '비밀번호가 일치하지 않습니다.')

    def test_reset_password_too_short_password(self):
        '''
        짧은 비밀번호를 입력하면 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'password1': 'short',
            'password2': 'short'
        }

        # when
        response = self.client.put(self.url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '비밀번호는 최소 8자리입니다.')

    def test_reset_password_same_old_passwords(self):
        '''
        이전의 비밀번호와 동일한 비밀번호로 입력되면 메세지와 409 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'password1': 'old_password!',
            'password2': 'old_password!'
        }

        # when
        response = self.client.put(self.url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json().get('message'), '기존 비밀번호와 다른 비밀번호를 입력해주세요.')

class ResetPasswordWithEmailTestCase(CommonTestSetUp):
    def test_reset_password(self):
        '''
        이메일과 새로운 비밀번호로 변경 요청이 오면 해당 이메일 user의 비밀번호를 변경하고, 메세지와 200 status를 반환한다
        '''
        # given
        data = {
            'email': 'test@test.com',
            'password1': 'new_password!',
            'password2': 'new_password!'
        }

        # when
        response = self.client.put(self.url2, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('message'), '비밀번호가 성공적으로 변경되었습니다.')
        self.user.refresh_from_db()
        self.assertFalse(self.user.check_password("old_password!"))
        self.assertTrue(self.user.check_password("new_password!"))

    def test_reset_password_without_email(self):
        '''
        이메일을 입력하지 않은 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'password1': 'new_password!',
            'password2': 'new_password!'
        }

        # when
        response = self.client.put(self.url2, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '이메일을 입력해주세요.')

    def test_reset_password_invalid_email(self):
        '''
        올바른 이메일 형식이 입력되지 않은 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'email': 'test_email',
            'password1': 'new_password!',
            'password2': 'new_password!'
        }

        # when
        response = self.client.put(self.url2, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '이메일 형식을 확인해주세요.')

    def test_reset_password_user_not_found(self):
        '''
        존재하지 않은 user의 비밀번호 변경을 요청하는 경우 메세지와 404 status를 반환한다
        '''
        # given
        data = {
            'email': 'not_exist@test.com',
            'password1': 'new_password!',
            'password2': 'new_password!'
        }

        # when
        response = self.client.put(self.url2, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '가입되지 않은 사용자입니다.')

    def test_reset_password_not_match_passwords(self):
        '''
        일치하지 않은 비밀번호로 입력되면 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'email': 'test@test.com',
            'password1': 'new_password!',
            'password2': 'new_password_different!'
        }

        # when
        response = self.client.put(self.url2, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '비밀번호가 일치하지 않습니다.')

    def test_reset_password_too_short_password(self):
        '''
        짧은 비밀번호를 입력하면 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'email': 'test@test.com',
            'password1': 'short',
            'password2': 'short'
        }

        # when
        response = self.client.put(self.url2, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '비밀번호는 최소 8자리입니다.')

    def test_reset_password_same_old_passwords(self):
        '''
        이전의 비밀번호와 동일한 비밀번호로 입력되면 메세지와 409 status를 반환한다
        '''
        # given
        data = {
            'email': 'test@test.com',
            'password1': 'old_password!',
            'password2': 'old_password!'
        }

        # when
        response = self.client.put(self.url2, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json().get('message'), '기존 비밀번호와 다른 비밀번호를 입력해주세요.')