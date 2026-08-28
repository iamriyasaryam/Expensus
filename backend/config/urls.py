"""
Root URL Configuration for Expensus project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.0/topics/http/urls/
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def health_check(request):
    """Simple health check endpoint for container monitoring."""
    return JsonResponse({"status": "healthy", "service": "expensus-api"})


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/auth/', include('users.urls')),
    path('api/categories/', include('categories.urls')),
    path('api/expenses/', include('expenses.urls')),
    path('api/analytics/', include('analytics.urls')),
]
