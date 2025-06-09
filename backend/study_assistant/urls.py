from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, TestViewSet, TestAttemptViewSet

router = DefaultRouter()
router.register(r'documents', DocumentViewSet)
router.register(r'tests', TestViewSet)
router.register(r'test-attempts', TestAttemptViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 