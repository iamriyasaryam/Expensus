from rest_framework import serializers
from decimal import Decimal
from .models import Expense, PaymentMethod
from categories.models import Category


class ExpenseSerializer(serializers.ModelSerializer):
    """
    Serializer for Expense model.
    Accepts integer category ID on write and returns nested category representation on read.
    Enforces user ownership on the assigned category and positive amount validation.
    """
    category = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        help_text="Category ID classifying this expense"
    )

    class Meta:
        model = Expense
        fields = [
            'id',
            'amount',
            'category',
            'description',
            'expense_date',
            'payment_method',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_amount(self, value):
        if value is None or value <= Decimal('0.00'):
            raise serializers.ValidationError("Amount must be a positive number greater than 0.00.")
        return value

    def validate_category(self, value):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if value.user_id != request.user.id:
                raise serializers.ValidationError("The selected category does not belong to you.")
        return value

    def validate_description(self, value):
        return value.strip() if value else ""

    def to_representation(self, instance):
        """
        Enrich read response with nested category metadata without extra queries.
        """
        representation = super().to_representation(instance)
        if instance.category:
            representation['category'] = {
                'id': instance.category.id,
                'name': instance.category.name,
                'icon': instance.category.icon,
                'color': instance.category.color,
            }
        return representation
