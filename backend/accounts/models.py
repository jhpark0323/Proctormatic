from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.db import models
from rest_framework.exceptions import ValidationError


# Create your models here.
class UserManager(BaseUserManager):
    def create_user(self, email, password, **extra_fields):
        if not email:
            raise ValidationError('이메일은 필수입니다.')
        if not password:
            raise ValidationError('비밀번호는 필수입니다.')

        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    birth = models.DateField()
    coin_amount = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    policy = models.BooleanField()
    marketing = models.BooleanField()
    is_active = models.BooleanField(default=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name', 'birth', 'policy', 'marketing']

    class Meta:
        db_table = 'user'