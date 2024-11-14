from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken

from exams.models import Exam
from takers.models import Taker
from exams.serializers import TakerDetailSerializer


User = get_user_model()

class CommenTestSetUp(TestCase):
    def setUp(self):
        self.user = User.objects.create(
            name='test',
            email='test@test.com',
            birth='2024-10-14',
            coin_amount=1000,
            policy=True,
            marketing=True
        )
        self.exam = Exam.objects.create(
            user=self.user,
            title='Past Exam',
            date='2024-11-13',
            entry_time='09:00:00',
            start_time='10:00:00',
            end_time='12:00:00',
            exit_time='11:30:00',
            expected_taker=10,
            cost=600
        )
        self.deleted_exam = Exam.objects.create(
            user=self.user,
            title='Past Exam',
            date='2024-11-13',
            entry_time='09:00:00',
            start_time='10:00:00',
            end_time='12:00:00',
            exit_time='11:30:00',
            expected_taker=10,
            cost=600,
            is_deleted=True
        )
        self.taker = Taker.objects.create(
            exam=self.exam,
            name='taker1',
            email='taker1@test.com',
            check_out_state='normal'
        )
        self.deleted_taker = Taker.objects.create(
            exam=self.deleted_exam,
            name='taker2',
            email='taker2@test.com',
            check_out_state='normal'
        )
        self.url = '/api/exam/{}/taker/{}/'

    def get_token(self, user):
        token = AccessToken.for_user(user)
        token['role'] = 'host'
        return token

class ExamTakerResultTestCase(CommenTestSetUp):
    def test_taker_result_view(self):
        '''
        삭제되지 않은 시험의 응시자 결과와 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = self.url.format(self.exam.id, self.taker.id)

        # when
        response = self.client.get(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, TakerDetailSerializer(self.taker).data)

    def test_taker_result_delete_exam(self):
        '''
        삭제된 시험의 응시자 결과를 조회할 경우 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = self.url.format(self.deleted_exam.id, self.deleted_taker.id)

        # when
        response = self.client.get(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '존재하지 않는 시험입니다.')

    def test_taker_result_not_exist_taker(self):
        '''
        존재하지 않는 응시자 결과를 조회할 경우 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        not_exist_taker_id = 999
        url = self.url.format(self.exam.id, not_exist_taker_id)

        # when
        response = self.client.get(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '존재하지 않는 응시자입니다.')