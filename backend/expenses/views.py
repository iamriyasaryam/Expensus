from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Expense
from .serializers import ExpenseSerializer
from .filters import ExpenseFilter


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ViewSet for full CRUD operations on Expense records.
    Provides multi-tenant query isolation, N+1 query elimination via select_related,
    declarative filtering via django-filter, search, and ordering.
    """
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
        filters.OrderingFilter,
    ]
    filterset_class = ExpenseFilter
    search_fields = ['description', 'category__name']
    ordering_fields = ['expense_date', 'amount', 'created_at']
    ordering = ['-expense_date', '-created_at']

    def get_queryset(self):
        """
        Users can ONLY see and manipulate their own expenses.
        Uses select_related to fetch category metadata in a single SQL JOIN.
        """
        if getattr(self, 'swagger_fake_view', False):
            return Expense.objects.none()
        return Expense.objects.filter(
            user=self.request.user
        ).select_related('category')

    def perform_create(self, serializer):
        """
        Bind the authenticated user to the newly created expense.
        """
        serializer.save(user=self.request.user)
