from rest_framework.views import exception_handler
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.response import Response
from rest_framework import status

def custom_exception_handler(exc, context):
    if isinstance(exc, AuthenticationFailed):
        return Response({"message": str(exc)}, status=status.HTTP_401_UNAUTHORIZED)

    response = exception_handler(exc, context)

    if response is not None and 'detail' in response.data:
        response.data['message'] = response.data.pop('detail')

    return response