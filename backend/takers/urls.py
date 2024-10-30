from django.urls import path
from . import views

urlpatterns = [
    path('', views.add_taker),
    path('photo/', views.update_taker),
    path('webcam/', views.add_web_cam),
]