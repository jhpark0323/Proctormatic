from django.test import TestCase
from rest_framework import status
from helpdesks.models import Faq


class CommenTestSetUp(TestCase):
    def setUp(self):
        self.faq1 = Faq.objects.create(category='etc', title='test_title1', content='test_content1')
        self.faq2 = Faq.objects.create(category='etc', title='test_title2', content='test_content2')
        self.url = '/api/helpdesk/faq/'

class FaqCreateTestCase(CommenTestSetUp):
    def test_faq_create(self):
        '''
        카테고리, 제목과 내용을 입력하면 자주묻는 질문이 등록되고 201 status를 반환한다
        '''
        # given
        data = {
            'category': 'etc',
            'title': 'test_title3',
            'content': 'test_content3'
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Faq.objects.count(), 3)
        self.assertEqual(Faq.objects.last().title, "test_title3")

    def test_faq_create_with_invalid_data(self):
        '''
        카테고리, 제목 또는 내용에 빈 값이 입력되면 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'category': 'etc',
            'title': '',
            'content': 'test_content'
        }
        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 요청입니다.')

    def test_faq_create_with_missing_data(self):
        '''
        카테고리, 제목 또는 내용에 값이 입력되지 않으면 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'category': 'etc',
            'content': 'test_content'
        }
        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 요청입니다.')

class FaqListTestCase(CommenTestSetUp):
    def test_faq_list(self):
        '''
        자주 묻는 질문을 조회하면 자주 묻는 질문 리스트와 200 status를 반환한다
        '''
        # when
        response = self.client.get(self.url)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['faqList']), 2)

class FaqDetailTestCase(CommenTestSetUp):
    def test_faq_detail(self):
        '''
        자주 묻는 질문 id로 조회를 하면 해당 공지사항의 detail과 200 status를 반환한다
        '''
        # given
        url = f'{self.url}{self.faq1.id}/'

        # when
        response = self.client.get(url)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('title'), "test_title1")
        self.assertEqual(response.data.get('content'), "test_content1")

    def test_faq_detail_not_exist_id(self):
        '''
        존재하지 않는 id로 조회를 하면 메세지와 404 status를 반환한다
        '''
        # given
        invalid_id = 9999
        url = f'{self.url}{invalid_id}/'

        # when
        response = self.client.get(url)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '자주 묻는 질문이 존재하지 않습니다.')

class FaqDeleteTestCase(CommenTestSetUp):
    def test_faq_delete(self):
        '''
        자주 묻는 질문 id로 삭제를 요청하면 해당 질문을 삭제하고 204 status를 반환한다
        '''
        # given
        url = f'{self.url}{self.faq1.id}/'

        # when
        response = self.client.delete(url)

        # then
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        with self.assertRaises(Faq.DoesNotExist):
            Faq.objects.get(id=self.faq1.id)

    def test_faq_delete_not_exist_id(self):
        '''
        존재하지 않는 id로 삭제를 요청하면 메세지와 404 status를 반환한다
        '''
        # given
        invalid_id = 9999
        url = f'{self.url}{invalid_id}/'

        # when
        response = self.client.get(url)

        # then
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.json().get('message'), '자주 묻는 질문이 존재하지 않습니다.')