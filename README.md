# MoneyTrack – Control Inteligente de Gastos Personales

Descripción
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
    
    1) git clone https://github.com/anerca90/MoneyTrack.git
    2) cd MoneyTrack

2. Configurar el Backend

    1) cd backend_moneytrack
    2) python -m venv venv
    3) Entorno virtual
        A. Para Linux: source venv/bin/activate 
        B. Para Windows: venv\Scripts\activate
    4) pip install -r requirements.txt
    5) python manage.py migrate
    6) python manage.py runserver

3. Configurar el Frontend

    1) cd frontend_moneytrack
    2) npm install
    3) npm start

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