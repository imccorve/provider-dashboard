from rest_framework import serializers
from .models import Patient, Address, CustomField, CustomFieldTemplate

class CustomFieldSerializer(serializers.ModelSerializer):
    template_id = serializers.PrimaryKeyRelatedField(
        source='template',
        queryset=CustomFieldTemplate.objects.filter(is_active=True)
    )
    field_name = serializers.CharField(source='template.name', read_only=True)
    
    class Meta:
        model = CustomField
        fields = ['id', 'template_id', 'field_name', 'value']

    def create(self, validated_data):
        return CustomField.objects.create(**validated_data)

class CustomFieldTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomFieldTemplate
        fields = ['id', 'name', 'description', 'is_required', 'is_active', 'created_at', 'updated_at']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'street', 'city', 'state', 'zip_code', 'is_primary']

class PatientSerializer(serializers.ModelSerializer):
    addresses = AddressSerializer(many=True, required=False)
    custom_fields = CustomFieldSerializer(many=True, required=False)

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
            'custom_fields',
            'created_at', 
            'updated_at'
        ]
    
    def create(self, validated_data):
        addresses_data = validated_data.pop('addresses', [])
        custom_fields_data = validated_data.pop('custom_fields', [])

        patient = Patient.objects.create(**validated_data)
        
        for address_data in addresses_data:
            Address.objects.create(patient=patient, **address_data)
            
        for custom_field_data in custom_fields_data:
            CustomField.objects.create(
                patient=patient,
                **custom_field_data
            )

        return patient

    def update(self, instance, validated_data):
        addresses_data = validated_data.pop('addresses', [])
        custom_fields_data = validated_data.pop('custom_fields', [])

        # Update patient fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update addresses
        existing_addresses = {addr.id: addr for addr in instance.addresses.all()}
        
        # Replace all custom fields
        instance.custom_fields.all().delete()
        for custom_field_data in custom_fields_data:
            CustomField.objects.create(
                patient=instance,
                template=custom_field_data['template'],
                value=custom_field_data['value']
            )

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