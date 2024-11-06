from django.urls import path
from . import views

urlpatterns = [
    path('notification/', views.notification),
    path('notification/<int:notification_id>/', views.check_notification, name='check_notification'),
    path('question/', views.question, name='question'),
    path('question/<int:question_id>/', views.question_detail),
    path('faq/', views.faq),
    path('faq/<int:faq_id>/', views.faq_detail),
]