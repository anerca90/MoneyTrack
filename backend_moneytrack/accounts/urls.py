from django.urls import path, include
from .views import RegisterView, LoginView, TransactionViewSet, CategoriaViewSet
from rest_framework.routers import DefaultRouter
from .views import GoalViewSet, ContributionViewSet


router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'goals', GoalViewSet)
router.register(r'contributions', ContributionViewSet)

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('', include(router.urls)),
    
    
]