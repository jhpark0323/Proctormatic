from django.test import TestCase
from django.utils import timezone
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken

from coins.models import Coin, CoinCode


User = get_user_model()

class CommenTestSetUp(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            name='test',
            email='test@test.com',
            birth='2024-10-14',
            policy=True,
            marketing=True
        )
        self.inactive_user = User.objects.create(
            name='inactive',
            email='inactive@test.com',
            birth='2024-10-14',
            policy=True,
            marketing=True,
            is_active=False
        )
        self.coin_code = CoinCode.objects.create(
            code= 'test_code',
            amount= 1000
        )
        self.url = '/api/coin/'

    def get_token(self, user):
        token = AccessToken.for_user(user)
        token['role'] = 'host'
        return token

class CoinCheckTestCase(CommenTestSetUp):
    def test_check_coin(self):
        '''
        사용자가 요청을 하면 코인 잔액과 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('coin'), self.user.coin_amount)

    def test_check_coin_inactive_user(self):
        '''
        탈퇴한 사용자가 요청을 하면 메세지와 403 status를 반환한다
        '''
        # given
        token = self.get_token(self.inactive_user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

class CoinChargeTestCase(CommenTestSetUp):
    def test_charge(self):
        '''
        사용자가 존재하는 적립금 코드를 입력하면 코인 충전과 coin 테이블에 이력이 남고, 메세지와 201 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'code': 'test_code'
        }
        before_request_time = timezone.now()

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json().get('message'), '적립금 충전 완료')
        self.user.refresh_from_db()
        self.assertEqual(self.user.coin_amount, self.coin_code.amount)

        coin_entry = Coin.objects.filter(
            user=self.user,
            type='charge',
            amount=self.coin_code.amount,
            created_at__gte=before_request_time
        ).first()

        self.assertIsNotNone(coin_entry)
        self.assertEqual(coin_entry.amount, self.coin_code.amount)
        self.assertEqual(coin_entry.type, 'charge')

    def test_charge_with_invalid_code(self):
        '''
        탈퇴한 사용자가 존재하는 적립금 코드를 입력하면 메세지와 403 status를 반환한다
        '''
        # given
        token = self.get_token(self.inactive_user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'code': 'test_code'
        }

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_charge_with_invalid_code(self):
        '''
        사용자가 존재하지 않는 적립금 코드를 입력하면 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'code': 'invalid_code'
        }

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '해당 적립금 코드가 존재하지 않습니다.')

    def test_charge_missing_code(self):
        '''
        적립금 코드가 입력되지 않으면 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {}

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '적립금 코드를 입력해주세요.')

    def test_charge_with_invalid_code(self):
        '''
        사용자가 존재하지 않는 적립금 코드를 입력하면 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'code': 'invalid_code'
        }

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '해당 적립금 코드가 존재하지 않습니다.')