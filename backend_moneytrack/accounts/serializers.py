from rest_framework import serializers
from .models import Transaction, Categoria

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nombre', 'tipo', 'icono']

class TransactionSerializer(serializers.ModelSerializer):
    categoria_nombre = serializers.SerializerMethodField()  # 🔧 AGREGAR ESTA LÍNEA

    class Meta:
        model = Transaction
        fields = ['id', 'type', 'description', 'actual', 'date', 'categoria', 'categoria_nombre']

    def get_categoria_nombre(self, obj):
        return obj.categoria.nombre if obj.categoria else None
