from django.test import TestCase
from django.contrib.auth import get_user_model
from django_redis import get_redis_connection
from rest_framework import status
from unittest.mock import patch


User = get_user_model()

class CommonTestSetUp(TestCase):
    def setUp(self):
        User.objects.create(
            name='test',
            email='test@test.com',
            password='password!',
            birth='2024-10-14',
            policy=True,
            marketing=True
        )
        self.url = '/api/users/email/'


class EmailExistTestCase(CommonTestSetUp):
    def test_invalid_email_format(self):
        '''
        올바른 이메일 형식이 입력되지 않은 경우 메세지와 400 status를 반환한다
        '''
        # given
        email = 'test_email'

        # when
        response = self.client.get(self.url, {'email': email})

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '이메일 형식을 확인해주세요.')

    def test_email_exist(self):
        '''
        이메일이 이미 데이터베이스에 존재하는 경우 해당 이메일의 존재 여부를 확인하면 True를 반환한다
        '''
        # given
        email = 'test@test.com'

        # when
        result = User.objects.filter(email=email).exists()

        # then
        self.assertTrue(result)

    def test_email_not_exist(self):
        '''
        이메일이 이미 데이터베이스에 존재하지 않는 경우 해당 이메일의 존재 여부를 확인하면 False를 반환한다
        '''
        # given
        email = 'new_email@test.com'

        # when
        result = User.objects.filter(email=email).exists()

        # then
        self.assertFalse(result)


class SendEmailTestCase(CommonTestSetUp):
    @patch('accounts.views.generate_verification_code')
    @patch('accounts.views.send_verification_email')
    @patch('accounts.views.save_verification_code_to_redis')
    def test_email_exist(self, mock_save_to_redis, mock_send_email, mock_generate_code):
        '''
        이메일이 이미 데이터베이스에 존재하는 경우 메세지와 409 status를 반환한다
        '''
        # given
        email = 'test@test.com'
        data = {'email': email}

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json().get('message'), '이미 존재하는 이메일입니다. 다른 이메일을 사용해주세요.')

        mock_generate_code.assert_not_called()
        mock_send_email.assert_not_called()
        mock_save_to_redis.assert_not_called()

    @patch('accounts.views.generate_verification_code')
    @patch('accounts.views.send_verification_email')
    @patch('accounts.views.save_verification_code_to_redis')
    def test_send_verification_email(self, mock_save_to_redis, mock_send_email, mock_generate_code):
        '''
        이메일이 존재하지 않으면 인증번호를 발송하고, 메세지와 200 status를 반환한다
        '''
        # given
        email = 'new_email@test.com'
        data = {'email': email}
        mock_generate_code.return_value = '123456'

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('message'), '인증번호를 발송했습니다.')

        mock_send_email.assert_called_once_with(email, '123456')
        mock_save_to_redis.assert_called_once_with(email, '123456')

    @patch('accounts.views.generate_verification_code')
    @patch('accounts.views.send_verification_email')
    @patch('accounts.views.save_verification_code_to_redis')
    def test_invalid_email_format(self, mock_save_to_redis, mock_send_email, mock_generate_code):
        '''
        올바른 이메일 형식이 입력되지 않은 경우 메세지와 400 status를 반환한다
        '''
        # given
        email = 'test_email'
        data = {'email': email}

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '이메일 형식을 확인해주세요.')

        mock_generate_code.assert_not_called()
        mock_send_email.assert_not_called()
        mock_save_to_redis.assert_not_called()


class EmailVerificationTestCase(CommonTestSetUp):
    def test_email_verification_success(self):
        '''
        인증번호가 일치하면 메세지와 200 status를 반환한다
        '''
        # given
        email = 'new_email@test.com'
        code = '123456'

        redis_conn = get_redis_connection('default')
        redis_conn.set(f'verification_code:{email}', code)

        data = {'email': email, 'code': code}

        # when
        response = self.client.put(self.url, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('message'), '이메일 인증이 완료되었습니다.')

    def test_email_verification_code_expired(self):
        '''
        인증번호가 만료된 경우 메세지와 400 status를 반환한다
        '''
        # given
        email = 'new_email@test.com'
        code = '123456'

        redis_conn = get_redis_connection('default')
        redis_conn.set(f'verification_code:{email}', code)

        redis_conn.delete(f'verification_code:{email}')

        data = {'email': email, 'code': code}

        # when
        response = self.client.put(self.url, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '인증번호가 만료되었습니다.')

    def test_email_verification_code_mismatch(self):
        '''
        잘못된 인증번호가 입력된 경우 메세지와 400 status를 반환한다
        '''
        # given
        email = 'new_email@test.com'
        correct_code = '123456'
        wrong_code = '654321'

        redis_conn = get_redis_connection('default')
        redis_conn.set(f'verification_code:{email}', correct_code)

        data = {'email': email, 'code': wrong_code}

        # when
        response = self.client.put(self.url, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 인증번호입니다.')