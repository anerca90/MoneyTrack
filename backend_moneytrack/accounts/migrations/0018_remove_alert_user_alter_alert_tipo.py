# Generated by Django 4.2.5 on 2025-05-12 13:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0017_alert'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='alert',
            name='user',
        ),
        migrations.AlterField(
            model_name='alert',
            name='tipo',
            field=models.CharField(choices=[('popup', 'Popup'), ('color', 'Color')], max_length=10),
        ),
    ]
