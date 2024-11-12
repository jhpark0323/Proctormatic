from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from datetime import datetime

from coins.models import Coin


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
        self.coin1 = Coin.objects.create(user=self.user, type='charge', amount=1000)
        self.coin2 = Coin.objects.create(user=self.user, type='use', amount=600)
        self.coin3 = Coin.objects.create(user=self.user, type='refund', amount=60)
        self.coin1.created_at = datetime(2024, 10, 14)
        self.coin2.created_at = datetime(2024, 10, 16)
        self.coin3.created_at = datetime(2024, 10, 18)
        self.coin1.save()
        self.coin2.save()
        self.coin3.save()

        self.url = '/api/coin/history/'

    def get_token(self, user):
        token = AccessToken.for_user(user)
        token['role'] = 'host'
        return token

class CoinHistoryTestCase(CommenTestSetUp):
    def test_coin_history(self):
        '''
        모든 코인 내역을 요청하면 전체 내역을 리스트로 반환한다(2개 이상이면 내림차순)
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()['coinList']), 3)
        self.assertEqual(response.json()['totalPage'], 1)

        coin_list = response.json()['coinList']
        self.assertEqual(coin_list[0]['created_at'], '2024-10-18T00:00:00')
        self.assertEqual(coin_list[1]['created_at'], '2024-10-16T00:00:00')
        self.assertEqual(coin_list[2]['created_at'], '2024-10-14T00:00:00')

    def test_coin_history_with_type(self):
        '''
        특정 타입으로 필터링하여 요청하면 해당 타입의 내역을 리스트로 반환한다(2개 이상이면 내림차순)
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        params = {
            'type': 'charge'
        }

        # when
        response = self.client.get(self.url, params, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()['coinList']), 1)
        self.assertEqual(response.json()['coinList'][0]['type'], 'charge')

    def test_coin_history_with_invalid_page_number(self):
        '''
        잘못된 페이지 번호를 요청하면 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        params = {
            'page': -1
        }

        # when
        response = self.client.get(self.url, params, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 페이지 요청입니다.')

    def test_coin_history_with_invalid_page_size(self):
        '''
        잘못된 페이지 크기를 요청하면 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        params = {
            'size': -1
        }

        # when
        response = self.client.get(self.url, params, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 사이즈 요청입니다.')

    def test_coin_history_with_pagination(self):
        '''
        페이지네이션을 사용하여 코인 내역을 요청할 경우, 각 페이지에 해당하는 내역을 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        params = {
            'page': 1,
            'size': 2
        }

        # when
        response = self.client.get(self.url, params, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()['coinList']), 2)
        self.assertTrue(response.json()['next'])
        self.assertFalse(response.json()['prev'])