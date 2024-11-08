import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model


User = get_user_model()

class CustomAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if auth_header is None or not auth_header.startswith('Bearer '):
            return None

        token = auth_header.split(' ')[1]

        try:
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user_id = decoded_token.get('user_id')
            if user_id is None:
                raise AuthenticationFailed('유효하지 않은 토큰입니다.')

            user = User.objects.get(pk=user_id)

            if not user.is_active:
                raise AuthenticationFailed('권한이 없습니다.')

            return (user, None)

        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed('토큰이 만료되었습니다.')
        except jwt.DecodeError:
            raise AuthenticationFailed('유효하지 않은 토큰입니다.')
        except User.DoesNotExist:
            raise AuthenticationFailed('유저를 찾을 수 없습니다.')