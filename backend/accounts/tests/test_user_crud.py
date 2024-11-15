from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken


User = get_user_model()

class CommenTestSetUp(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            name='test',
            email='test@test.com',
            password='password!',
            birth='2024-10-14',
            policy=True,
            marketing=True
        )
        self.inactive_user = User.objects.create(
            name='inactive',
            email='inactive@test.com',
            password='password!',
            birth='2024-10-14',
            policy=True,
            marketing=True,
            is_active=False
        )
        # user에 대한 test이기 때문에 taker도 user 모델로 만듦!
        self.taker = User.objects.create(
            name='taker',
            email='taker@test.com',
            password='password!',
            birth='2024-10-14',
            policy=True,
            marketing=True
        )
        self.url = '/api/users/'

    def get_token(self, user, role):
        token = AccessToken.for_user(user)
        token['role'] = role
        return token

class UserCreateTestCase(CommenTestSetUp):
    def test_user_create(self):
        '''
        회원가입이 완료되면 메세지와 201 status를 반환하고, user 테이블에 추가된다
        '''
        # given
        data = {
            'name': 'test',
            'email': 'user@example.com',
            'password': 'password!',
            'birth': '20241014',
            'policy': True,
            'marketing': False
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json().get('message'), '회원가입이 완료되었습니다.')
        self.assertEqual(User.objects.count(), 4) # setup에 3명의 test user를 만들어 두었기 때문에 총 4명
        self.assertTrue(User.objects.filter(email='user@example.com').exists())

    def test_user_create_invalid_email_format(self):
        '''
        이메일 형식이 올바르지 않을 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'name': 'test',
            'email': 'test_email',
            'password': 'password!',
            'birth': '20241014',
            'policy': True,
            'marketing': False
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '이메일 형식을 확인해주세요.')

    def test_user_create_email_already_exists(self):
        '''
        이미 존재하는 이메일로 가입을 시도하면 메세지와 409 status를 반환한다
        '''
        # given
        data = {
            'name': 'test',
            'email': 'test@test.com',
            'password': 'password!',
            'birth': '20241014',
            'policy': True,
            'marketing': False
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertEqual(response.json().get('message'), '이미 존재하는 이메일입니다. 다른 이메일을 이용해주세요.')

    def test_user_create_password_too_short(self):
        '''
        8자리 이하의 비밀번호를 입력하면 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'name': 'test',
            'email': 'user@example.com',
            'password': 'short',
            'birth': '20241014',
            'policy': True,
            'marketing': True
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '이 필드의 글자 수가  적어도 8 이상인지 확인하십시오.')

    def test_user_invalid_birth_format(self):
        '''
        생년월일 입력 형식이 잘못된 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'name': 'test',
            'email': 'user@example.com',
            'password': 'password!',
            'birth': '241014',
            'policy': True,
            'marketing': True
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '날짜 형식이 올바르지 않습니다. YYYYMMDD 형식이어야 합니다.')

    def test_user_create_future_birth(self):
        '''
        오늘 이후의 날짜를 생년월일로 입력한 경우 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'name': 'test',
            'email': 'user@example.com',
            'password': 'password!',
            'birth': '20241231',
            'policy': True,
            'marketing': True
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '생년월일은 오늘 날짜 이전이어야 합니다.')

class UserFindTestCase(CommenTestSetUp):
    def test_user_find(self):
        '''
        토큰 인증이 정상적으로 이루어진 경우 회원정보와 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user, 'host')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('name'), 'test')
        self.assertEqual(response.json().get('email'), 'test@test.com')

    def test_user_find_without_authentication_token(self):
        '''
        인증 토큰이 없을 경우 메세지와 401 status를 반환한다
        '''
        # when
        response = self.client.get(self.url)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_user_find_without_host_token(self):
        '''
        role이 host가 아닌 사용자인 경우 메세지와 403 status를 반환한다
        '''
        # given
        token = self.get_token(self.taker, 'taker')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_user_find_is_not_active(self):
        '''
        비활성화된(탈퇴한) 유저가 요청한 경우 메세지와 403 status를 반환한다
        '''
        # given
        token = self.get_token(self.inactive_user, 'host')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

class UserUpdateTestCase(CommenTestSetUp):
    def test_user_update(self):
        '''
        토큰 인증이 정상적으로 이루어진 경우 maketing 열을 입력받은 값으로 수정하고 메세지와 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user, 'host')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'marketing': False
        }

        # when
        response = self.client.put(self.url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertFalse(self.user.marketing)

    def test_user_update_without_authentication_token(self):
        '''
        인증 토큰이 없을 경우 메세지와 401 status를 반환한다
        '''
        # given
        data = {
            'marketing': False
        }

        # when
        response = self.client.put(self.url, data, content_type='application/json')

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_user_update_without_host_token(self):
        '''
        role이 host가 아닌 사용자인 경우 메세지와 403 status를 반환한다
        '''
        # given
        token = self.get_token(self.taker, 'taker')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'marketing': False
        }

        # when
        response = self.client.put(self.url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_user_update_is_not_active(self):
        '''
        비활성화된(탈퇴한) 유저가 요청한 경우 메세지와 403 status를 반환한다
        '''
        # given
        token = self.get_token(self.inactive_user, 'host')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'marketing': False
        }

        # when
        response = self.client.put(self.url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_user_update_marketing_invalid_data(self):
        '''
        marketing에 boolean이 아닌 값이 들어올 경우 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user, 'host')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'marketing': 'invalid_value'
        }

        # when
        response = self.client.put(self.url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 요청입니다.')

class UserDeleteTestCase(CommenTestSetUp):
    def test_user_delete(self):
        '''
        토큰 인증이 정상적으로 이루어진 경우 is_active를 false로 수정하고 204 status를 반환한다
        '''
        # given
        token = self.get_token(self.user, 'host')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.patch(self.url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.user.refresh_from_db()
        self.assertFalse(self.user.is_active)

    def test_user_delete_without_authentication_token(self):
        '''
        인증 토큰이 없을 경우 메세지와 401 status를 반환한다
        '''
        # when
        response = self.client.get(self.url)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_user_delete_without_host_token(self):
        '''
        role이 host가 아닌 사용자인 경우 메세지와 403 status를 반환한다
        '''
        # given
        token = self.get_token(self.taker, 'taker')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_user_delete_is_not_active(self):
        '''
        비활성화된(탈퇴한) 유저가 요청한 경우 메세지와 403 status를 반환한다
        '''
        # given
        token = self.get_token(self.inactive_user, 'host')
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')