from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from django.db.models import Sum
from .models import Transaction, Categoria, Goal, Contribution, Alert
from .serializers import TransactionSerializer, CategoriaSerializer, GoalSerializer, ContributionSerializer, AlertSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework import serializers
from rest_framework.permissions import BasePermission




# Vista para obtener el usuario actual
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response({'username': request.user.username})

# Registro de usuario
class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Usuario ya existe'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Correo ya registrado'}, status=400)

        user = User.objects.create_user(username=username, email=email, password=password)
        return Response({'message': 'Usuario creado correctamente'})


# Login de usuario
class LoginView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        user = authenticate(username=username, password=password)
        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            return Response({'token': token.key, 'user': user.username})
        else:
            return Response({'error': 'Credenciales inválidas'}, status=400)


# Vista para Transacciones (privadas por usuario)
class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# Vista para Categorías (privadas por usuario)
class CategoriaViewSet(viewsets.ModelViewSet):
    serializer_class = CategoriaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Categoria.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# Vista para Metas (privadas por usuario)
class GoalViewSet(viewsets.ModelViewSet):
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Goal.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class ContributionViewSet(viewsets.ModelViewSet):
    serializer_class = ContributionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Contribution.objects.filter(goal__user=self.request.user)

    def perform_create(self, serializer):
        goal = serializer.validated_data['goal']
        if goal.user != self.request.user:
            raise PermissionDenied("No puedes agregar aportes a metas que no te pertenecen.")
        serializer.save()

# Vista para Alertas (privadas por usuario)
class AlertViewSet(viewsets.ModelViewSet):
    serializer_class = AlertSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Alert.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EvaluarAlertasView(APIView):
    def get(self, request):
        alertas = Alert.objects.filter(activa=True)
        resultados = []

        for alerta in alertas:
            total_gastos = Transaction.objects.filter(
                date__range=[alerta.fecha_inicio, alerta.fecha_fin],
                type='expense'
            ).aggregate(total=Sum('actual'))['total'] or 0

            if total_gastos >= alerta.limite:
                resultados.append({
                    'alerta': AlertSerializer(alerta).data,
                    'total_gastos': total_gastos,
                    'superado': True
                })
            else:
                resultados.append({
                    'alerta': AlertSerializer(alerta).data,
                    'total_gastos': total_gastos,
                    'superado': False
                })

        return Response(resultados)
    
class PasswordResetView(APIView):
    def post(self, request):
        user_or_email = request.data.get('user_or_email')

        try:
            user = User.objects.get(username=user_or_email)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=user_or_email)
            except User.DoesNotExist:
                return Response({'error': 'Usuario o correo no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        send_mail(
            subject='Recupera tu contraseña - MoneyTrack',
            message=f"Hola {user.username}, usa este enlace para recuperar tu contraseña: http://localhost:3000/reset-password/{user.id}",
            from_email='trackmoney36@gmail.com',
            recipient_list=[user.email],
            fail_silently=False,
        )

        return Response({'message': 'Correo de recuperación enviado'}, status=status.HTTP_200_OK)

from django.contrib.auth.hashers import make_password

class ResetPasswordView(APIView):
    def post(self, request, user_id):
        nueva_contrasena = request.data.get('new_password')

        if not nueva_contrasena:
            return Response({'error': 'Se requiere una nueva contraseña'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(id=user_id)
            user.set_password(nueva_contrasena)
            user.save()
            return Response({'message': 'Contraseña actualizada correctamente'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'error': 'Usuario no encontrado'}, status=status.HTTP_404_NOT_FOUND)

# 🔒 Permiso personalizado solo para admin1
class IsAdmin1(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.username == 'admin1'


# 🔄 Serializador para mostrar y editar usuarios
class AdminUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


# 🔄 Serializador exclusivo para cambiar contraseña
class AdminPasswordChangeSerializer(serializers.Serializer):
    new_password = serializers.CharField(write_only=True)


# 📋 Vista para gestionar usuarios (solo admin1)
class UserAdminViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = AdminUserSerializer
    permission_classes = [IsAuthenticated, IsAdmin1]

    def update(self, request, *args, **kwargs):
        # Solo permite editar username y correo
        return super().update(request, *args, **kwargs)


# 🔑 Vista para cambiar la contraseña de cualquier usuario (solo admin1)
class AdminChangePasswordView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin1]

    def post(self, request, user_id):
        serializer = AdminPasswordChangeSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = User.objects.get(id=user_id)
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                return Response({'message': 'Contraseña actualizada correctamente'})
            except User.DoesNotExist:
                return Response({'error': 'Usuario no encontrado'}, status=404)
        return Response(serializer.errors, status=400)