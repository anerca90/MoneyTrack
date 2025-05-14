from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Categoria(models.Model):
    TIPO_CHOICES = (
        ('ingreso', 'Ingreso'),
        ('gasto', 'Gasto'),
    )

    nombre = models.CharField(max_length=100)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    icono = models.CharField(max_length=10, blank=True, null=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE) 

    def __str__(self):
        return f"{self.nombre} ({self.tipo})"

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('income', 'Ingreso'),
        ('expense', 'Gasto')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=255)
    actual = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    date = models.DateField(default=timezone.now)
    categoria = models.ForeignKey(Categoria, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return f'{self.user.username} - {self.description}'

class Goal(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    tipo = models.CharField(max_length=100)
    monto = models.DecimalField(max_digits=12, decimal_places=2)
    fecha = models.DateField()

class Contribution(models.Model):
    goal = models.ForeignKey(Goal, related_name='contributions', on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

class Alert(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100, blank=True, null=True)  # ✅ Añadir esta línea
    fecha_inicio = models.DateField()
    fecha_fin = models.DateField()
    limite = models.DecimalField(max_digits=10, decimal_places=2)
    tipo = models.CharField(max_length=10, choices=[('popup', 'Notificación'), ('color', 'Cambio de color')])
    activa = models.BooleanField(default=True)

    def __str__(self):
        return self.nombre or f'Alerta #{self.id}'