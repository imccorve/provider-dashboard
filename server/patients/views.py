from rest_framework import viewsets, filters
from django.db.models import Q
from rest_framework.response import Response
from django_filters import rest_framework as django_filters
from django.db import models
from .models import Patient
from .serializers import PatientSerializer
from functools import reduce
from rest_framework.pagination import PageNumberPagination

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class PatientFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(method='filter_name')
    status = django_filters.ChoiceFilter(choices=Patient.STATUS_CHOICES)
    date_of_birth = django_filters.DateFromToRangeFilter()

    class Meta:
        model = Patient
        fields = ['status', 'date_of_birth']
        
    def filter_name(self, queryset, name, value):
        terms = value.split()
        conditions = [
            models.Q(first_name__icontains=term) |
            models.Q(middle_name__icontains=term) |
            models.Q(last_name__icontains=term)
            for term in terms
        ]
        return queryset.filter(reduce(and_, conditions))

class PatientViewSet(viewsets.ModelViewSet):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    filterset_class = PatientFilter
    pagination_class = StandardResultsSetPagination
    
    filter_backends = [
        django_filters.DjangoFilterBackend,
        filters.OrderingFilter,
        filters.SearchFilter,
    ]
    
    ordering_fields = ['created_at', 'last_name', 'first_name', 'middle_name', 'date_of_birth', 'status']
    ordering = ['-created_at']
    search_fields = ['first_name', 'middle_name', 'last_name']
    
    def get_queryset(self):
        """
        Extends the base queryset with additional filtering capabilities.
        """
        queryset = super().get_queryset()
        
        return (
            queryset
            .get_queryset()
            .select_related()
        )