from django.urls import path
from . import views

urlpatterns = [
    path('', views.check_duplicate_taker),  # 응시자 이메일 체크
]
