from rest_framework import serializers
from .models import Transaction, Categoria
from .models import Goal, Contribution

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

class ContributionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contribution
        fields = '__all__'

class GoalSerializer(serializers.ModelSerializer):
    contributions = ContributionSerializer(many=True, read_only=True)

    class Meta:
        model = Goal
        fields = '__all__'