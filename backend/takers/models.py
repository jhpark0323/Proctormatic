from django.db import models
from exams.models import Exam

class Taker(models.Model):
    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    birth = models.DateField(null=True, blank=True)
    id_photo = models.CharField(null=True,blank=True,max_length=255)
    web_cam = models.CharField(null=True,blank=True,max_length=255)
    verification_rate = models.IntegerField(null=True, blank=True)
    entry_time = models.TimeField(null=True, blank=True)
    exit_time = models.TimeField(null=True, blank=True)

    @property
    def is_authenticated(self):
        return True