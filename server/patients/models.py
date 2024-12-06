from django.db import models
import uuid

class Patient(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    STATUS_CHOICES = [
        ('INQUIRY', 'Inquiry'),
        ('ONBOARDING', 'Onboarding'),
        ('ACTIVE', 'Active'),
        ('CHURNED', 'Churned'), 
    ]

    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100)
    date_of_birth = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='INQUIRY'
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class Address(models.Model):
    patient = models.ForeignKey(
        Patient, 
        on_delete=models.CASCADE,
        related_name='addresses'
    )
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=50)
    zip_code = models.CharField(max_length=10)
    is_primary = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Ensure only one primary address per patient
        if self.is_primary:
            self.patient.addresses.filter(is_primary=True).exclude(id=self.id).update(is_primary=False)
        super().save(*args, **kwargs)

class CustomFieldTemplate(models.Model):
    """Defines custom fields that can be added to patient records"""
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    is_required = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class CustomField(models.Model):
    """Stores the actual values for custom fields on patient records"""
    patient = models.ForeignKey(Patient, related_name='custom_fields', on_delete=models.CASCADE)
    template = models.ForeignKey(CustomFieldTemplate, related_name='values', on_delete=models.CASCADE)
    value = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ['patient', 'template']

    def __str__(self):
        return f"{self.template.name}: {self.value}"