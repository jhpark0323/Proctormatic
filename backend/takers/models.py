from django.db import models
from exams.models import Exam

class Taker(models.Model):
    CHECK_OUT_STATE_CHOICES = (
        ('normal', 'Normal'),
        ('abnormal', 'Abnormal')
    )
    STORED_STATE_CHOICES = (
        ('before', 'Before'),
        ('in_progress', 'In_progress'),
        ('done', 'Done')
    )

    exam = models.ForeignKey(Exam, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    email = models.EmailField(max_length=255)
    birth = models.DateField(null=True, blank=True)
    id_photo = models.CharField(null=True,blank=True,max_length=255)
    verification_rate = models.IntegerField(null=True, blank=True)
    check_out_state = models.CharField(max_length=255, choices=CHECK_OUT_STATE_CHOICES, default='abnormal')
    stored_state = models.CharField(max_length=255, choices=STORED_STATE_CHOICES, default='before')

    class Meta:
        db_table = 'taker'

    @property
    def is_authenticated(self):
        return True

class Logs(models.Model):
    TYPE_CHOICES = (
        ('entry', 'Entry'),
        ('exit', 'Exit')
    )

    taker = models.ForeignKey(Taker, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    time = models.TimeField(auto_now_add=True)

    class Meta:
        db_table = 'logs'

class Abnormal(models.Model):
    TYPE_CHOICES = (
        ('eyesight', 'Eyesight'),
        ('absence', 'Absence'),
        ('overcrowded', 'Overcrowded'),
        ('paper', 'Paper'),
        ('pen', 'Pen'),
        ('cup', 'Cup'),
        ('watch', 'Watch'),
        ('earphone', 'Earphone'),
        ('mobilephone', 'Mobilephone'),
        ('etc', 'Etc')
    )

    taker = models.ForeignKey(Taker, on_delete=models.CASCADE)
    detected_time = models.TimeField()
    end_time = models.TimeField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    segment_cam = models.CharField(max_length=255)

    class Meta:
        db_table = 'abnormal'