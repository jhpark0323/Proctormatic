from django.test import TestCase
from rest_framework import status
from helpdesks.models import Notification


class CommenTestSetUp(TestCase):
    def setUp(self):
        self.notification1 = Notification.objects.create(title="test_title1", content="test_content1")
        self.notification2 = Notification.objects.create(title="test_title2", content="test_content2")
        self.url = '/api/helpdesk/notification/'

class NotificationCreateTestCase(CommenTestSetUp):
    def test_notification_create(self):
        '''
        제목과 내용을 입력하면 공지사항이 등록되고 201 status를 반환한다
        '''
        # given
        data = {
            "title": "test_title3",
            "content": "test_content3"
        }

        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Notification.objects.count(), 3)
        self.assertEqual(Notification.objects.last().title, "test_title3")

    def test_notification_create_with_invalid_data(self):
        '''
        title 또는 content에 빈 값이 입력되면 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'title': '',
            'content': 'test_content'
        }
        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 요청입니다.')

    def test_notification_create_with_missing_data(self):
        '''
        title 또는 content의 값이 입력되지 않으면 메세지와 400 status를 반환한다
        '''
        # given
        data = {
            'content': 'test_content'
        }
        # when
        response = self.client.post(self.url, data)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 요청입니다.')

class NotificationListTestCase(CommenTestSetUp):
    def test_notification_list(self):
        '''
        공지사항을 조회하면 공지사항 리스트와 200 status를 반환한다
        '''
        # when
        response = self.client.get(self.url)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['totalPage'], 1)
        self.assertEqual(len(response.data['notificationList']), 2)

    def test_notification_list_with_invalid_page_number(self):
        '''
        잘못된 페이지 번호를 요청하면 메세지와 400 status를 반환한다
        '''
        # given
        params = {
            'page': -1
        }

        # when
        response = self.client.get(self.url, params)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 페이지 요청입니다.')

    def test_notification_list_with_invalid_page_size(self):
        '''
        잘못된 페이지 크기를 요청하면 메세지와 400 status를 반환한다
        '''
        # given
        params = {
            'size': -1
        }

        # when
        response = self.client.get(self.url, params)

        # then
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(response.json().get('message'), '잘못된 사이즈 요청입니다.')

    def test_notification_list_with_pagination(self):
        '''
        페이지네이션을 사용하여 코인 내역을 요청할 경우, 각 페이지에 해당하는 내역을 반환한다
        '''
        # given
        params = {
            'page': 1,
            'size': 1
        }

        # when
        response = self.client.get(self.url, params)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()['notificationList']), 1)
        self.assertTrue(response.json()['next'])
        self.assertFalse(response.json()['prev'])

class NotificationDetailTestCase(CommenTestSetUp):
    def test_notification_detail(self):
        '''
        공지사항 id로 조회를 하면 해당 공지사항의 detail과 200 status를 반환한다
        '''
        # given
        url = f'{self.url}{self.notification1.id}/'

        # when
        response = self.client.get(url)

        # then
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data.get('title'), "test_title1")
        self.assertEqual(response.data.get('content'), "test_content1")

    def test_notification_detail_not_exist_id(self):
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
        self.assertEqual(response.json().get('message'), '공지 사항이 존재하지 않습니다.')

class NotificationDeleteTestCase(CommenTestSetUp):
    def test_notification_delete(self):
        '''
        공지사항 id로 삭제를 요청하면 해당 공지사항을 삭제하고 204 status를 반환한다
        '''
        # given
        url = f'{self.url}{self.notification1.id}/'

        # when
        response = self.client.delete(url)

        # then
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        with self.assertRaises(Notification.DoesNotExist):
            Notification.objects.get(id=self.notification1.id)

    def test_notification_delete_not_exist_id(self):
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
        self.assertEqual(response.json().get('message'), '공지 사항이 존재하지 않습니다.')