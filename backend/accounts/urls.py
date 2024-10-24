from django.urls import path
from . import views

urlpatterns = [
    path('', views.handle_user),
    path('email/', views.handle_email_verification),
]