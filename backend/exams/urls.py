from django.urls import path
from .views import create_exam, scheduled_exam_list, ongoing_exam_list, completed_exam_list, exam_detail, taker_result_view

urlpatterns = [
    path('', create_exam),
    path('scheduled/', scheduled_exam_list),
    path('ongoing/', ongoing_exam_list),
    path('completed/', completed_exam_list),
    path('<int:pk>/', exam_detail),
    path('exam/<int:eid>/taker/<int:tid>', taker_result_view)
]
