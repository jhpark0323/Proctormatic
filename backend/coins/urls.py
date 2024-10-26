from django.urls import path
from . import views

urlpatterns = [
    path('', views.handle_coin),
    path('code/', views.create_coin_code),
    path('history/', views.coin_history),
]