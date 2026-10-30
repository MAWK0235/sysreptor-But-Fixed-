from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import DesignAiChatViewSet

router = DefaultRouter()
router.register('chat', DesignAiChatViewSet, basename='designaichat')

urlpatterns = [
    path('', include(router.urls)),
]
