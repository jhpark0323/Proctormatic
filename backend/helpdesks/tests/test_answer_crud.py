from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from helpdesks.models import Question, Answer


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
        self.question = Question.objects.create(
            user=self.user,
            category='etc',
            title='test_title',
            content='test_content'
        )
        self.answer = Answer.objects.create(
            question=self.question,
            author=self.user.name,
            content='test_answer'
        )
        self.url = '/api/helpdesk/question/<id>/answer/'

    def get_token(self, user):
        token = AccessToken.for_user(user)
        token['role'] = 'host'
        return token

class AnswerCreateTestCase(CommenTestSetUp):
    def test_answer_create(self):
        '''
        본인이 작성한 질문에 대한 유효한 답변을 입력하면 답변이 생성되고 201 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'content': 'test_content',
        }

        # when
        response = self.client.post(self.url.replace('<id>', str(self.question.id)), data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data.get('message'), '답변이 등록되었습니다.')
        self.assertEqual(Answer.objects.filter(question=self.question).last().content, 'test_content')

    def test_answer_create_question_not_found(self):
        '''
        존재하지 않는 질문 id로 답변 작성 요청을 보낸 경우 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        invalid_question_id = 999
        data = {
            'content': 'test_content',
        }

        # when
        response = self.client.post(self.url.replace('<id>', str(invalid_question_id)), data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data.get('message'), '질문이 존재하지 않습니다.')

    def test_answer_create_invalid_data(self):
        '''
        답변 내용이 입력되지 않은 경우 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {}

        # when
        response = self.client.post(self.url.replace('<id>', str(self.question.id)), data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('message'), '잘못된 요청입니다.')

class AnswerUpdateTestCase(CommenTestSetUp):
    def test_answer_update(self):
        '''
        본인이 작성한 질문과 답변에 대해 수정을 요청하면 답변을 수정하고 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url.replace("<id>", str(self.question.id))}{self.answer.id}/'
        data = {
            'content': 'update_answer'
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.answer.refresh_from_db()
        self.assertEqual(self.answer.content, 'update_answer')

    def test_answer_update_question_not_found(self):
        '''
        존재하지 않는 질문 id로 답변 수정 요청을 보낸 경우 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        invalid_question_id = 999
        url = f'{self.url.replace("<id>", str(invalid_question_id))}{self.answer.id}/'
        data = {
            'content': 'update_answer',
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data.get('message'), '질문이 존재하지 않습니다.')

    def test_answer_update_answer_not_found(self):
        '''
        존재하지 않는 답변 id로 수정 요청을 보낸 경우 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        invalid_answer_id = 999
        url = f'{self.url.replace("<id>", str(self.question.id))}{invalid_answer_id}/'
        data = {
            'content': 'update_answer',
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data.get('message'), '답변이 존재하지 않습니다.')

    def test_answer_update_invalid_data(self):
        '''
        답변 내용이 입력되지 않은 경우 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url.replace("<id>", str(self.question.id))}{self.answer.id}/'
        data = {}

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.data.get('message'), '잘못된 요청입니다.')

class AnswerDeleteTestCase(CommenTestSetUp):
    def test_answer_delete(self):
        '''
        본인의 답변을 삭제하면 답변을 삭제하고 204 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url.replace("<id>", str(self.question.id))}{self.answer.id}/'

        # when
        response = self.client.delete(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Answer.objects.filter(id=self.answer.id).exists())

    def test_answer_delete_question_not_found(self):
        '''
        존재하지 않은 질문을 삭제하고자 하면 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        invalid_question_id = 999
        url = f'{self.url.replace("<id>", str(invalid_question_id))}{self.answer.id}/'

        # when
        response = self.client.delete(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data.get('message'), '질문이 존재하지 않습니다.')

    def test_answer_delete_answer_not_found(self):
        '''
        존재하지 않은 답변을 삭제하고자 하면 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        invalid_answer_id = 999
        url = f'{self.url.replace("<id>", str(self.question.id))}{invalid_answer_id}/'

        # when
        response = self.client.delete(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data.get('message'), '답변이 존재하지 않습니다.')