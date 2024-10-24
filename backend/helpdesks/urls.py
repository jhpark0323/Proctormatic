from django.urls import path
from . import views

urlpatterns = [
    path('notification/', views.create_notification, name='create_notification')
]