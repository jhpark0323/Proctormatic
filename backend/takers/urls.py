from django.urls import path
from . import views

urlpatterns = [
    path('', views.add_taker),
    path('email/', views.check_email),
    path('photo/', views.update_taker),
    path('webcam/', views.add_web_cam),
    path('abnormal/', views.add_abnormal),
]