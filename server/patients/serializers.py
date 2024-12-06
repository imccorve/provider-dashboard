from rest_framework import serializers
from .models import Patient, Address

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'street', 'city', 'state', 'zip_code', 'is_primary']

class PatientSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, required=False)

    class Meta:
        model = Patient
        fields = [
            'id', 
            'first_name', 
            'middle_name', 
            'last_name',
            'date_of_birth', 
            'status', 
            'addresses',
            'created_at', 
            'updated_at'
        ]
    
    def create(self, validated_data):
        addresses_data = validated_data.pop('addresses', [])
        
        patient = Patient.objects.create(**validated_data)
        
        for address_data in addresses_data:
            Address.objects.create(patient=patient, **address_data)
            
        return patient

    def update(self, instance, validated_data):
        addresses_data = validated_data.pop('addresses', [])
        
        # Update patient fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update addresses
        existing_addresses = {addr.id: addr for addr in instance.addresses.all()}
        
        for address_data in addresses_data:
            address_id = address_data.get('id')
            if address_id and address_id in existing_addresses:
                address = existing_addresses[address_id]
                for attr, value in address_data.items():
                    setattr(address, attr, value)
                address.save()
                existing_addresses.pop(address_id)
            else:
                Address.objects.create(patient=instance, **address_data)
        
        for address in existing_addresses.values():
            address.delete()
                
        return instance