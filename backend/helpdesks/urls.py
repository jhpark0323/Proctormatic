from django.urls import path
from . import views

urlpatterns = [
    path('notification/', views.notification),
    path('notification/<notification_id>/', views.check_notification, name='check_notification'),
    path('question/', views.question, name='question'),
]