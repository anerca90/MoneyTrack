from django.urls import path, include
from .views import RegisterView, LoginView, TransactionViewSet, CategoriaViewSet
from rest_framework.routers import DefaultRouter
from .views import GoalViewSet, ContributionViewSet
from .views import AlertViewSet
from .views import EvaluarAlertasView
from .views import PasswordResetView, ResetPasswordView
from . import views
from .views import UserAdminViewSet, AdminChangePasswordView


router = DefaultRouter()
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'goals', GoalViewSet, basename='goal')
router.register(r'contributions', ContributionViewSet, basename='contribution')
router.register(r'alerts', AlertViewSet, basename='alert')
router.register(r'admin/users', UserAdminViewSet, basename='admin-users')

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('', include(router.urls)),
    path('evaluar-alertas/', EvaluarAlertasView.as_view(), name='evaluar-alertas'),
    path('password-reset/', PasswordResetView.as_view(), name='password-reset'),
    path('reset-password/<int:user_id>/', ResetPasswordView.as_view()),
    path('current_user/', views.current_user, name='current_user'),
    path('admin/users/<int:user_id>/change-password/', AdminChangePasswordView.as_view()),
     
]