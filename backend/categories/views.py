from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from django.db.models import ProtectedError
from .models import Category
from .serializers import CategorySerializer


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Category CRUD operations.
    Enforces user-level multi-tenancy and handles cascade protection gracefully.
    """
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Users can ONLY see and manipulate their own categories.
        """
        if getattr(self, 'swagger_fake_view', False):
            return Category.objects.none()
        return Category.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """
        Automatically bind the authenticated user to the newly created category.
        """
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        """
        Safely delete category or return a 400 Bad Request if expenses protect it.
        """
        instance = self.get_object()
        try:
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ProtectedError:
            return Response(
                {
                    "detail": "Cannot delete this category because it contains active expenses. Reassign or delete those expenses first.",
                    "code": "category_protected"
                },
                status=status.HTTP_400_BAD_REQUEST
            )
