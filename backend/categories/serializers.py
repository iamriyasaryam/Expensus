from rest_framework import serializers
from .models import Category


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for Category model supporting CRUD operations.
    Validates name uniqueness per authenticated user.
    """
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'color', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate_name(self, value):
        cleaned = value.strip() if value else ""
        if not cleaned:
            raise serializers.ValidationError("Category name cannot be blank.")
        return cleaned

    def validate(self, attrs):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return attrs

        name = attrs.get('name')
        if name:
            # Check for duplicate category name for this specific user
            queryset = Category.objects.filter(
                user=request.user,
                name__iexact=name.strip()
            )
            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)

            if queryset.exists():
                raise serializers.ValidationError({
                    "name": "You already have a category with this name."
                })

        return attrs
