from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DocumentViewSet, TestViewSet, TestAttemptViewSet, contact_view, feedback_view

router = DefaultRouter()
router.register(r'documents', DocumentViewSet)
router.register(r'tests', TestViewSet)
router.register(r'test-attempts', TestAttemptViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('contact/', contact_view, name='contact'),
    path('feedback/', feedback_view, name='feedback'),
] 