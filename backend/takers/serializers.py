from rest_framework import serializers
from .models import Taker

class TakerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Taker
        fields = ['name', 'email', 'entry_time','exam']

