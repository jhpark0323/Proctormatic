from django.urls import path
from .views import create_exam, scheduled_exam_list

urlpatterns = [
    path('', create_exam),
    path('scheduled/', scheduled_exam_list),
]
