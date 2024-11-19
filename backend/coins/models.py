from django.db import models
from django.conf import settings

from exams.models import Exam


class Coin(models.Model):
    TYPE_CHOICES = (
        ('charge', 'Charge'),
        ('use', 'Use'),
        ('refund', 'Refund'),
    )

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    exam = models.ForeignKey(Exam, null=True, blank=True, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    amount = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'coin'

class CoinCode(models.Model):
    code = models.CharField(max_length=100)
    amount = models.IntegerField()

    class Meta:
        db_table = 'coincode'