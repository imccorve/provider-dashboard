from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('patients', views.PatientViewSet, basename='patient')
router.register('custom-field-templates', views.CustomFieldTemplateViewSet, basename='custom-field-template')

urlpatterns = [
    path('', include(router.urls)),
]