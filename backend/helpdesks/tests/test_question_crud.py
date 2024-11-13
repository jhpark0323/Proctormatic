from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework_simplejwt.tokens import AccessToken
from helpdesks.models import Question


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
        self.other = User.objects.create(
            name='other',
            email='other@test.com',
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
        self.question1 = Question.objects.create(
            user=self.user,
            category='etc',
            title='test_title1',
            content='test_content1'
        )
        self.question2 = Question.objects.create(
            user=self.user,
            category='etc',
            title='test_title2',
            content='test_content2'
        )
        self.question3 = Question.objects.create(
            user=self.user,
            category='coin',
            title='test_title3',
            content='test_content3'
        )
        self.question4 = Question.objects.create(
            user=self.other,
            category='coin',
            title='test_title4',
            content='test_content4'
        )
        self.url = '/api/helpdesk/question/'

    def get_token(self, user):
        token = AccessToken.for_user(user)
        token['role'] = 'host'
        return token

class QuestionCreateTestCase(CommenTestSetUp):
    def test_question_create(self):
        '''
        인증된 user가 카테고리, 질문과 내용을 입력하면 질문을 등록하고 201 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'category': 'etc',
            'title': 'new_title',
            'content': 'new_content'
        }

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Question.objects.count(), 5)
        self.assertEqual(Question.objects.last().title, 'new_title')
        self.assertEqual(Question.objects.last().user, self.user)

    def test_question_create_inactive_user(self):
        '''
        탈퇴한 user가 카테고리, 질문과 내용을 입력하면 메세지와 403 status를 반환한다
        '''
        # given
        token = self.get_token(self.inactive_user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'category': 'etc',
            'title': 'new_title',
            'content': 'new_content'
        }

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json().get('message'), '권한이 없습니다.')

    def test_question_create_title_exceeds_max_length(self):
        '''
        제목이 100자를 초과하면 메세지와 400 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        data = {
            'category': 'etc',
            'title': 'new_title' * 15,
            'content': 'new_content'
        }

        # when
        response = self.client.post(self.url, data, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '제목은 100자를 넘길 수 없습니다.')

class QuestionListTestCase(CommenTestSetUp):
    def test_question_list(self):
        '''
        질문 리스트 조회 요청을 하면 본인이 작성한 질문의 리스트와 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}

        # when
        response = self.client.get(self.url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['totalPage'], 1)
        self.assertEqual(len(response.data['questionList']), 3)

    def test_question_list_with_category_filter(self):
        '''
        카테고리를 설정하고 질문 리스트 조회 요청을 하면 본인이 작성한 질문의 리스트와 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        params = {
            'category': 'etc'
        }

        # when
        response = self.client.get(self.url, params, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['totalPage'], 1)
        self.assertEqual(len(response.data['questionList']), 2)

    def test_question_list_with_invalid_page_number(self):
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

    def test_question_list_with_invalid_page_size(self):
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

    def test_question_list_with_pagination(self):
        '''
        페이지네이션을 사용하여 질문 목록을 요청할 경우, 각 페이지에 해당하는 내역을 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        params = {
            'page': 1,
            'size': 1
        }

        # when
        response = self.client.get(self.url, params, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()['questionList']), 1)
        self.assertTrue(response.json()['next'])
        self.assertFalse(response.json()['prev'])

class QuestionDetailTestCase(CommenTestSetUp):
    def test_question_detail(self):
        '''
        질문 id로 조회를 하면 해당 질문의 detail과 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.question1.id}/'

        # when
        response = self.client.get(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('title'), "test_title1")
        self.assertEqual(response.data.get('organizer'), "test")

    def test_question_detail_not_exist_id(self):
        '''
        존재하지 않는 id로 조회를 하면 메세지와 404 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        invalid_id = 9999
        url = f'{self.url}{invalid_id}/'

        # when
        response = self.client.get(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '질문이 존재하지 않습니다.')

class QuestionUpdateTestCase(CommenTestSetUp):
    def test_question_update(self):
        '''
        유효한 제목과 내용으로 수정 요청을 하면 해당 질문의 detail과 200 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.question1.id}/'
        data = {
            'category': 'etc',
            'title': 'new_title',
            'content': 'new_content'
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json().get('message'), '질문이 수정되었습니다.')
        self.question1.refresh_from_db()
        self.assertEqual(self.question1.title, 'new_title')
        self.assertEqual(self.question1.content, 'new_content')

    def test_question_update_not_exist_id(self):
        '''
        존재하지 않는 id로 수정을 요청하면 메세지와 404 status를 반환한다
        '''
        # given
        invalid_id = 9999
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{invalid_id}/'
        data = {
            'category': 'etc',
            'title': 'new_title',
            'content': 'new_content'
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '질문이 존재하지 않습니다.')

    def test_question_update_invalid_category(self):
        '''
        허용되지 않은 카테고리로 수정을 요청하면 400 상태와 메시지를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.question1.id}/'
        data = {
            'category': 'invalid_category',
            'title': 'new_title',
            'content': 'new_content'
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 요청입니다.')

    def test_question_update_empty_title(self):
        '''
        제목이 비어 있으면 400 상태와 메시지를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.question1.id}/'
        data = {
            'category': 'etc',
            'title': '',
            'content': 'new_content'
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 요청입니다.')

    def test_question_update_other_user_question(self):
        '''
        다른 사용자의 질문을 수정하려고 할 때 404 상태와 메시지를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.question4.id}/'
        data = {
            'category': 'etc',
            'title': 'new_title',
            'content': 'new_content'
        }

        # when
        response = self.client.put(url, data, content_type='application/json', **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '질문이 존재하지 않습니다.')

class QuestionDeleteTestCase(CommenTestSetUp):
    def test_question_delete(self):
        '''
        유효한 질문 삭제 요청 시 질문이 삭제되고 204 status를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.question1.id}/'

        # when
        response = self.client.delete(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Question.objects.filter(id=self.question1.id).exists())

    def test_question_delete_not_exist_id(self):
        '''
        존재하지 않는 질문 삭제 요청 시 404 상태 코드와 오류 메시지가 반환된다.
        '''
        # given
        invalid_id = 9999
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{invalid_id}/'

        # when
        response = self.client.delete(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '질문이 존재하지 않습니다.')

    def test_question_update_other_user_question(self):
        '''
        다른 사용자의 질문을 삭제하려고 할 때 404 상태와 메시지를 반환한다
        '''
        # given
        token = self.get_token(self.user)
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        url = f'{self.url}{self.question4.id}/'

        # when
        response = self.client.delete(url, **headers)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '질문이 존재하지 않습니다.')