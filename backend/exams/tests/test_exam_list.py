from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from freezegun import freeze_time

from exams.models import Exam


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
        self.past_exam = Exam.objects.create(
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

        self.ongoing_exam = Exam.objects.create(
            user=self.user,
            title='Ongoing Exam',
            date='2024-11-15',
            entry_time='09:00:00',
            start_time='09:30:00',
            end_time='10:30:00',
            exit_time='10:15:00',
            expected_taker=10,
            cost=600
        )

        self.today_future_exam = Exam.objects.create(
            user=self.user,
            title='Today Future Exam',
            date='2024-11-15',
            entry_time='13:30:00',
            start_time='14:00:00',
            end_time='16:00:00',
            exit_time='15:30:00',
            expected_taker=10,
            cost=600
        )

        self.future_exam = Exam.objects.create(
            user=self.user,
            title='Future Exam',
            date='2024-11-17',
            entry_time='09:00:00',
            start_time='10:00:00',
            end_time='12:00:00',
            exit_time='11:30:00',
            expected_taker=10,
            cost=600
        )

        self.url1 = '/api/exam/scheduled/'
        self.url2 = '/api/exam/ongoing/'
        self.url3 = '/api/exam/completed/'

    def get_token(self, user):
        token = AccessToken.for_user(user)
        token['role'] = 'host'
        return token

class ScheduledExamTestCase(CommenTestSetUp):
    @freeze_time("2024-11-15 10:00:00")
    def test_scheduled_exam(self):
        '''
        요청을 한 시점 기준으로 예정된 시험 목록과 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url1, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('scheduledExamList', response.data)

        response_data = response.data['scheduledExamList']
        exam_titles = [exam['title'] for exam in response_data]
        self.assertNotIn('Past Exam', exam_titles)
        self.assertNotIn('Ongoing Exam', exam_titles)
        self.assertIn('Today Future Exam', exam_titles)
        self.assertIn('Future Exam', exam_titles)

    @freeze_time("2024-11-15 10:00:00")
    def test_scheduled_exam_for_deleted(self):
        '''
        요청을 한 시점 기준으로 예정된 시험 목록을 삭제된 시험을 제외한 리스트와 200 status를 반환한다
        '''
        # given
        self.future_exam.is_deleted = True
        self.future_exam.save()

        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url1, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('scheduledExamList', response.data)

        response_data = response.data['scheduledExamList']
        exam_titles = [exam['title'] for exam in response_data]
        self.assertNotIn('Past Exam', exam_titles)
        self.assertNotIn('Ongoing Exam', exam_titles)
        self.assertIn('Today Future Exam', exam_titles)
        self.assertNotIn('Future Exam', exam_titles)

    @freeze_time("2024-11-15 10:00:00")
    def test_scheduled_exam_with_invalid_page_number(self):
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
        response = self.client.get(self.url1, params, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 페이지 요청입니다.')

    @freeze_time("2024-11-15 10:00:00")
    def test_scheduled_exam_with_invalid_page_size(self):
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
        response = self.client.get(self.url1, params, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 사이즈 요청입니다.')

class OngoingExamTestCase(CommenTestSetUp):
    @freeze_time("2024-11-15 10:00:00")
    def test_ongoing_exam(self):
        '''
        요청을 한 시점 기준으로 진행중인 시험 목록과 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url2, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('ongoingExamList', response.data)

        response_data = response.data['ongoingExamList']
        exam_titles = [exam['title'] for exam in response_data]
        self.assertNotIn('Past Exam', exam_titles)
        self.assertIn('Ongoing Exam', exam_titles)
        self.assertNotIn('Today Future Exam', exam_titles)
        self.assertNotIn('Future Exam', exam_titles)

    @freeze_time("2024-11-15 10:00:00")
    def test_ongoing_exam_not_exist(self):
        '''
        진행중인 시험이 없는 경우 빈 리스트와 200 status를 반환한다
        '''
        # given
        self.ongoing_exam.is_deleted = True
        self.ongoing_exam.save()

        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url2, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('ongoingExamList', response.data)

        response_data = response.data['ongoingExamList']
        exam_titles = [exam['title'] for exam in response_data]
        self.assertNotIn('Past Exam', exam_titles)
        self.assertNotIn('Ongoing Exam', exam_titles)
        self.assertNotIn('Today Future Exam', exam_titles)
        self.assertNotIn('Future Exam', exam_titles)

    @freeze_time("2024-11-15 10:00:00")
    def test_ongoing_exam_with_invalid_page_number(self):
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
        response = self.client.get(self.url2, params, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 페이지 요청입니다.')

    @freeze_time("2024-11-15 10:00:00")
    def test_ongoing_exam_with_invalid_page_size(self):
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
        response = self.client.get(self.url2, params, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 사이즈 요청입니다.')

class CompletedExamTestCase(CommenTestSetUp):
    @freeze_time("2024-11-15 10:00:00")
    def test_completed_exam(self):
        '''
        요청을 한 시점 기준으로 완료된 시험 목록과 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url3, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('completedExamList', response.data)

        response_data = response.data['completedExamList']
        exam_titles = [exam['title'] for exam in response_data]
        self.assertIn('Past Exam', exam_titles)
        self.assertNotIn('Ongoing Exam', exam_titles)
        self.assertNotIn('Today Future Exam', exam_titles)
        self.assertNotIn('Future Exam', exam_titles)

    @freeze_time("2024-11-15 10:00:00")
    def test_completed_exam_for_deleted(self):
        '''
        요청을 한 시점 기준으로 완료된 시험 목록을 삭제된 시험을 제외한 리스트와 200 status를 반환한다
        '''
        # given
        self.past_exam.is_deleted = True
        self.past_exam.save()

        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url3, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('completedExamList', response.data)

        response_data = response.data['completedExamList']
        exam_titles = [exam['title'] for exam in response_data]
        self.assertNotIn('Past Exam', exam_titles)
        self.assertNotIn('Ongoing Exam', exam_titles)
        self.assertNotIn('Today Future Exam', exam_titles)
        self.assertNotIn('Future Exam', exam_titles)

    @freeze_time("2024-11-15 10:00:00")
    def test_completed_exam_with_invalid_page_number(self):
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
        response = self.client.get(self.url3, params, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 페이지 요청입니다.')

    @freeze_time("2024-11-15 10:00:00")
    def test_completed_exam_with_invalid_page_size(self):
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
        response = self.client.get(self.url3, params, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 사이즈 요청입니다.')