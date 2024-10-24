from django.core.validators import validate_email
from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Taker
from .utils import create_response
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

@swagger_auto_schema(
    method='get',
    operation_description="이메일 중복 체크",
    manual_parameters=[
        openapi.Parameter('email', openapi.IN_QUERY, description="응시자 이메일", type=openapi.TYPE_STRING, required=True),
        openapi.Parameter('id', openapi.IN_QUERY, description="시험 ID", type=openapi.TYPE_INTEGER, required=True),
    ],
    responses={
        200: openapi.Response(
            description="이메일 중복 체크 결과",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING, example="이메일 중복체크 결과입니다."),
                    'result': openapi.Schema(
                        type=openapi.TYPE_OBJECT,
                        properties={
                            'isAlreadyExists': openapi.Schema(type=openapi.TYPE_BOOLEAN, example=True)
                        }
                    )
                }
            )
        ),
        400: openapi.Response(
            description="잘못된 요청",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING, example="이메일과 시험 ID를 모두 입력해야 합니다.")
                }
            )
        ),
        400: openapi.Response(
            description="유효하지 않은 이메일 형식",
            schema=openapi.Schema(
                type=openapi.TYPE_OBJECT,
                properties={
                    'message': openapi.Schema(type=openapi.TYPE_STRING, example="유효하지 않은 이메일 형식입니다.")
                }
            )
        ),
    }
)

@api_view(['GET'])
def check_duplicate_taker(request):
    email = request.query_params.get('email')
    exam_id = request.query_params.get("id")

    if not email or not exam_id:
        return create_response('이메일과 시험 ID를 모두 입력해야 합니다.', status_code=status.HTTP_400_BAD_REQUEST)

    from django.core.exceptions import ValidationError
    try:
        validate_email(email)
    except ValidationError:
        return create_response('유효하지 않은 이메일 형식입니다.', status_code=status.HTTP_400_BAD_REQUEST)

    is_duplicate = Taker.objects.filter(email=email, exam_id=exam_id).exists()

    if is_duplicate:
        return create_response('이메일 중복체크 결과입니다.', {'isAlreadyExists': True})
    else:
        return create_response('이메일 중복체크 결과입니다.', {'isAlreadyExists': False})
