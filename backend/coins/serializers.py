from rest_framework import serializers
from .models import Coin, CoinCode

class CoinCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CoinCode
        fields = '__all__'

class CoinCodeCreateSerializer(serializers.ModelSerializer):
    code = serializers.CharField(
        required=True,
        error_messages={
            'required': '적립금 코드를 입력해주세요.',
            'blank': '적립금 코드를 입력해주세요.',
    })

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