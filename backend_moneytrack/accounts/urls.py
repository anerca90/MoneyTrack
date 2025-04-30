from django.urls import path, include
from .views import RegisterView, LoginView, TransactionViewSet
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('', include(router.urls)),
    
]