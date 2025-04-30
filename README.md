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
    - python manage.py runserver

3. Configurar el Frontend

    - cd frontend_moneytrack
    - npm install
    - npm start

🔐 Login de Prueba

    1) Puedes usar el endpoint de login en Postman:

        * URL: http://localhost:8000/api/login/
        * Método: POST
        * Cuerpo:
                {
                "username": "admin1",
                "password": "admin"
                }
                
    2) O bien directo en la pagina web:

        * URL: http://localhost:3000
        * Método: Web
        * Credenciales:
            "username": "admin1",
            "password": "admin"

📊 Funcionalidades Implementadas

    1) Login/registro de usuarios con validación
    2) Dashboard con gráficos:
        A. Gráfico de barras: ingresos vs gastos por mes
        B. Gráficos de torta por categoría
        C. Balance automático
    3) Filtros por fechas
    4) Tablas dinámicas por transacción
    5) Cierre de sesión
    6) Interfaz responsiva

📝 Estado del Proyecto

    ✅ Login y registro
    ✅ Transacciones
    ✅ Dashboard con gráficos
    🕐 En desarrollo: Categorías, metas y alertas

👨‍💻 Autores

Álvaro Santis Catalán
David Romero Vallejos
Yazmin Améstica Aránguiz
Yubram Barraza Pérez
Erick Espínola Landaeta