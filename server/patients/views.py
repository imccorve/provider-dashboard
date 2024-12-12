from rest_framework import viewsets, filters
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as django_filters
from django.db import models
from .models import Patient, Address, CustomFieldTemplate
from .serializers import PatientSerializer, AddressSerializer, CustomFieldTemplateSerializer
from functools import reduce
from rest_framework.pagination import PageNumberPagination
from operator import and_

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
    search_fields = ['first_name', 'middle_name', 'last_name', 'custom_fields__value']
    
    def get_queryset(self):
        """
        Extends the base queryset with additional filtering capabilities.
        """
        queryset = super().get_queryset()
        
        recent_only = self.request.query_params.get('recent', None)
        if recent_only:
            thirty_days_ago = timezone.now() - timezone.timedelta(days=30)
            queryset = queryset.filter(created_at__gte=thirty_days_ago)

        return (
            super()
            .get_queryset()
            .select_related()
            .prefetch_related('addresses', 'custom_fields', 'custom_fields__template')
        )

    @action(detail=True, methods=['post'])
    def add_address(self, request, pk=None):
        patient = self.get_object()
        serializer = AddressSerializer(data=request.data)
        
        if serializer.is_valid():
            serializer.save(patient=patient)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    @action(detail=False, methods=['get'])
    def stats(self, request):
        current_month = timezone.now()
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        stats = Patient.objects.aggregate(
            total_patients=Count('id'),
            new_patients_30d=Count('id', filter=Q(created_at__gte=thirty_days_ago)),
            current_month_count=Count('id', filter=Q(created_at__month=current_month.month)),
            last_month_count=Count('id', filter=Q(created_at__month=(current_month - timedelta(days=30)).month))
        )

        status_counts = [
            {'status': status, 'count': count}
            for status, count in Patient.objects.values('status')
            .annotate(count=Count('id'))
            .values_list('status', 'count')
        ]

        # Monthly growth
        last_month = current_month - timedelta(days=30)
        current_month_count = Patient.objects.filter(
            created_at__month=current_month.month
        ).count()
        
        return Response({
            'status_distribution': status_counts,
            'new_patients_30d': stats['new_patients_30d'],
            'total_patients': stats['total_patients'],
        })

class CustomFieldTemplateViewSet(viewsets.ModelViewSet):
    serializer_class = CustomFieldTemplateSerializer
    queryset = CustomFieldTemplate.objects.all()