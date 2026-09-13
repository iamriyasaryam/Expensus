from rest_framework import permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .services import AnalyticsService
from .serializers import DashboardResponseSerializer


class DashboardAnalyticsView(APIView):
    """
    API view to retrieve comprehensive financial metrics, category breakdown,
    trailing monthly trends, and recent transactions for the authenticated user.
    Supports optional query parameter: ?month=YYYY-MM
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, *args, **kwargs):
        month_param = request.query_params.get('month', None)
        data = AnalyticsService.get_dashboard_data(request.user, month_param)
        serializer = DashboardResponseSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
