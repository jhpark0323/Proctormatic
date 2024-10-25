from rest_framework import serializers
from .models import CoinCode

class CoinCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoinCode
        fields = '__all__'