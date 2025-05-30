# Generated by Django 4.2.5 on 2025-05-02 08:34

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0010_metaahorro'),
    ]

    operations = [
        migrations.CreateModel(
            name='Contribution',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.DecimalField(decimal_places=2, max_digits=10)),
                ('date', models.DateField()),
            ],
        ),
        migrations.CreateModel(
            name='Goal',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('tipo', models.CharField(max_length=100)),
                ('monto', models.DecimalField(decimal_places=2, max_digits=12)),
                ('fecha', models.DateField()),
                ('progreso', models.PositiveIntegerField(default=0)),
            ],
        ),
        migrations.DeleteModel(
            name='MetaAhorro',
        ),
        migrations.AddField(
            model_name='contribution',
            name='goal',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='contributions', to='accounts.goal'),
        ),
    ]
