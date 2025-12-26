Hospital Management System Backend API
Django
DRF
PostgreSQL
AWS S3
JWT
A robust, production-ready Django REST Framework backend for a hospital management system. This API powers user authentication, appointment booking, staff assignments, vital signs recording, lab results, medical reports, and an admin blog feature.
Designed with role-based access control (Patient, Doctor, Nurse, Lab Scientist, Admin), secure JWT authentication, Google OAuth support, and media storage on AWS S3.
Live API Base URL: https://dhospitalback.onrender.com/api/
Frontend Demo (built separately): https://ettahospitalclone.vercel.app
🚀 Key Features

Role-Based Authentication & Authorization
Users: Patient, Doctor, Nurse, Lab Scientist, Admin
Custom Profile model with role-specific permissions
JWT tokens (access/refresh) + Google OAuth login

Appointment Workflow
Patients book appointments → Auto/random doctor assignment
Doctors assign nurses for vitals & lab scientists for tests
Nurses record vitals → Lab scientists submit results
Doctors issue final medical reports → Appointment completed

Media Handling
Profile pictures & blog images stored on AWS S3 (public-read)
Robust upload handling with fallbacks and logging

Blog System (Admin-only)
Rich text posts with featured images
Auto-generated table of contents & subheadings
Images automatically synced to S3 on save

Security & Production Ready
CORS configured for frontend
CSRF/Secure cookies for social auth
Redis caching support
Whitenoise for static files
Environment-based config (.env)


🛠 Tech Stack

Framework: Django 4.x + Django REST Framework
Authentication: DRF SimpleJWT + Social Django (Google OAuth)
Database: PostgreSQL (Render-hosted)
Storage: AWS S3 (via django-storages)
Cache: Redis (optional fallback to locmem)
Deployment: Render.com (with Gunicorn)
Other: django-decouple, dj-database-url, corsheaders, whitenoise

📊 API Documentation (Swagger UI Example)
The API is clean and well-structured. In a full setup with drf-spectacular or drf-yasg, it would look like this:
helloastrologer.compinterest.comdocuwriter.ai


🧪 Testing with Postman
Endpoints are thoroughly tested using Postman collections:
blog.postman.comstackhawk.com

🗄 Database Schema (ER Diagram Example)
The models form a comprehensive hospital workflow:
geeksforgeeks.orgFailed to load imageView link

🏗 System Architecture
High-level overview of the backend setup:
adityashekokar.medium.comtestdriven.io

🔧 Setup & Running Locally

Clone the repo
Create .env file (see example below)
Bashpython -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

📄 Example .env
envSECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DATABASE_URL=postgresql://user:pass@host:port/dbname

AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_REGION_NAME=eu-north-1

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY=your-google-client-id
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET=your-google-secret

CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
CSRF_TRUSTED_ORIGINS=https://your-frontend.vercel.app,http://localhost:5173
👥 Contributing
Contributions welcome! Open issues or PRs for improvements, bug fixes, or new features.
📜 License
MIT License

Built with ❤️ by a full-stack developer passionate about healthcare tech.
Open to backend/full-stack opportunities — let's connect! 🚀
#grok #Django #DRF #Python #BackendDevelopment #RESTAPI #HospitalManagement #AWS #PostgreSQL #JWT #OpenToWork