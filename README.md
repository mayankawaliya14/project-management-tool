# Multi-Tenant Project Management System

A project management tool built with **Django + GraphQL** (backend) and **React + TypeScript** (frontend). It provides **organization-based data isolation**, clean UI, and responsive design for managing projects and tasks.

## 🚀 Features

### Backend
- Multi-tenant architecture with organization isolation
- GraphQL API (projects, tasks, comments, stats)
- Django models with constraints and indexes
- Postgres database with Docker support
- CORS & middleware configured

### Frontend
- React 18 + TypeScript + Apollo Client
- TailwindCSS responsive design
- Project dashboard & Kanban task board
- Comment system for tasks
- Form validation, error & loading states

## 🛠 Tech Stack
- **Backend**: Django 4.x, Graphene, PostgreSQL
- **Frontend**: React 18+, TypeScript, Apollo Client, TailwindCSS
- **Database**: PostgreSQL (Docker/local)

## 📂 Structure
```
project-management-tool/
├── backend/
│   ├── core/ (models, schema, migrations)
│   ├── pmtool/ (settings, middleware, graphql_view)
│   └── manage.py
├── frontend/
│   ├── src/components/ (ProjectList, TaskBoard, etc.)
│   ├── graphql/ (queries, mutations)
│   ├── types.ts, apollo.ts, App.tsx
│   └── package.json
└── README.md
```

## ⚡ Quick Start

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Start Postgres with Docker
docker run --name pmtool-db -e POSTGRES_DB=pmtool -e POSTGRES_USER=pmtool   -e POSTGRES_PASSWORD=pmtool -p 5432:5432 -d postgres

# Migrate and run
python manage.py migrate
python manage.py runserver
```
Create a sample org:
```python
from core.models import Organization
Organization.objects.create(name="ACME Corp", slug="acme", contact_email="admin@acme.com")
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_GRAPHQL_URL=http://localhost:8000/graphql/" > .env
npm run dev
```
- Frontend: http://localhost:5173  
- Backend: http://localhost:8000/graphql  

## 📊 GraphQL Usage
All queries/mutations require:
```
X-Org-Slug: acme
```
Example query:
```graphql
query {
  projects { id name status taskCount completedTasks completionRate }
}
```

## Troubleshooting
- **CSRF errors**: Ensure `/graphql/` view is `@csrf_exempt`
- **Org not found**: Check `X-Org-Slug` header and org in DB
- **DB errors**: Verify Postgres is running and env vars are correct

## Roadmap
- Authentication & role-based access
- Real-time updates (subscriptions)
- File attachments & notifications
- Advanced analytics & reporting# project-management-tool
