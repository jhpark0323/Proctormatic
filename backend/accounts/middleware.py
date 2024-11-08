from rest_framework.response import Response

class CustomAuthFailedMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        if isinstance(response, Response) and isinstance(response.data, dict) and 'detail' in response.data:
            response.data['message'] = response.data.pop('detail')

        return response