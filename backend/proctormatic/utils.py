from rest_framework.response import Response
from rest_framework import status


def ok_response(message):
    return Response({'message': message}, status=status.HTTP_200_OK)

def ok_with_data_response(data):
    return Response(data, status=status.HTTP_200_OK)

def created_response(message):
    return Response({'message': message}, status=status.HTTP_201_CREATED)

def created_with_data_response(data):
    return Response(data, status=status.HTTP_201_CREATED)

def no_content_without_message_response():
    return Response(status=status.HTTP_204_NO_CONTENT)

def no_content_response(message):
    return Response({'message': message}, status=status.HTTP_204_NO_CONTENT)

def bad_request_response(message):
    return Response({'message': message}, status=status.HTTP_400_BAD_REQUEST)

def bad_request_invalid_data_response():
    return Response({'message': '잘못된 요청입니다.'}, status=status.HTTP_400_BAD_REQUEST)

def unauthorized_response(message):
    return Response({'message': message}, status=status.HTTP_401_UNAUTHORIZED)

def forbidden_response(message):
    return Response({'message': message}, status=status.HTTP_403_FORBIDDEN)

def not_found_response(message):
    return Response({'message': message}, status=status.HTTP_404_NOT_FOUND)

def conflict_response(message):
    return Response({'message': message}, status=status.HTTP_409_CONFLICT)

def too_many_requests_response(message):
    return Response({'message': message}, status=status.HTTP_429_TOO_MANY_REQUESTS)

def internal_server_error(message):
    return Response({'message': message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)