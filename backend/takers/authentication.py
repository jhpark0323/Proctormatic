from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.exceptions import AuthenticationFailed

from takers.models import Taker

class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        user_id = validated_token['user_id']
        user_role = validated_token['role']

        user = Taker.objects.filter(id=user_id).first()

        if not user:
            raise AuthenticationFailed("해당하는 유저를 찾을 수 없습니다.")

        if user_role == 'host':
            raise PermissionDenied("권한이 없습니다.")

        return user
