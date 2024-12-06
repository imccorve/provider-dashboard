from rest_framework import serializers
from .models import Patient

class PatientSerializer(serializers.ModelSerializer):
    class Meta:
        model = Patient
        fields = [
            'id', 
            'first_name', 
            'middle_name', 
            'last_name',
            'date_of_birth', 
            'status', 
            'created_at', 
            'updated_at'
        ]