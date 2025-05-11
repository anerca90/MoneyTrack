# MoneyTrack – Control Inteligente de Gastos Personales


MoneyTrack es una aplicación web desarrollada en React y Django REST Framework que permite gestionar ingresos y egresos 
personales de forma visual, segura y organizada. Incluye gráficos, filtros y análisis de balance mensual, además de 
funcionalidades como login, dashboard interactivo, y token de autenticación.

🧰 Tecnologías Utilizadas

    - Frontend: React (JavaScript)
    - Backend: Django REST Framework (Python)
    - Base de Datos: SQLite (modo local)
    - Herramientas de apoyo: Postman, GitHub, draw.io, VSCode

    Requisitos:

    - Node.js y npm
    - Python 3.8+
    - pipenv o virtualenv

⚙️ Instalación Local
1. Clonar el repositorio
    
    - git clone https://github.com/anerca90/MoneyTrack.git
    - cd MoneyTrack

2. Configurar el Backend

    - cd backend_moneytrack
    - python -m venv venv
    - Entorno virtual
        - Para Linux: source venv/bin/activate 
        - Para Windows: venv\Scripts\activate
    - pip install -r requirements.txt
    - python manage.py migrate
    - python manage.py runserver 0.0.0.0:8000

3. Configurar el Frontend

    - cd frontend_moneytrack
    - npm install
    - npm start

🔐 Login de Prueba

    1) Puedes usar el endpoint de login en Postman:

        * URL: http://192.168.1.90:8000/api/login/
        * Método: POST
        * Cuerpo:
                {
                "username": "admin1",
                "password": "admin"
                }
                
    2) O bien directo en la pagina web:

        * URL: http://192.168.1.90:3000
        * Método: Web
        * Credenciales:
            "username": "admin1",
            "password": "admin"

📱 Versión Móvil

    La aplicación móvil se conecta al backend por IP local. 
        
        Verifica que:

        1) Que ambos dispositivos estén en la misma red Wi-Fi.
        2) Que tu servidor Django esté corriendo con 0.0.0.0:8000.
        3) Que hayas reemplazado localhost por tu IP en los archivos fetch, axios, o servicios.

📊 Funcionalidades Implementadas

    1) Autenticación con token (registro, login, logout)
    2) Dashboard con gráficos:
        A. Gráfico de barras: ingresos vs. gastos por mes
        B. Gráficos de torta por categoría
        C. Balance automáticoo
    3) Filtros por rango de fechas
    4) Registro, edición y eliminación de transacciones
    5) Gestión de categorías de ingreso/gasto
    6) Metas de ahorro con progreso y aportes
    7) Alertas por límite de gasto (en desarrollo)
    8) Totalmente responsiva (adaptada a móvil)

🚧 Estado del Proyecto

    ✅ Login y registro
    ✅ Transacciones
    ✅ Dashboard con gráficos
    ✅ Categorías
    ✅ Metas
    ✅ APK Móvil
    🕐 En desarrollo: Alertas

👨‍💻 Autores

Álvaro Santis Catalán
David Romero Vallejos
Yazmin Améstica Aránguiz
Yubram Barraza Pérez
Erick Espínola Landaeta