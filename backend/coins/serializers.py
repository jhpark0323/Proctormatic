from rest_framework import serializers
from .models import Coin, CoinCode

class CoinCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoinCode
        fields = '__all__'

class CoinCodeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoinCode
        fields = ('code',)

class CoinSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coin
        fields = '__all__'

class CoinHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Coin
        fields = ('type', 'amount', 'created_at',)