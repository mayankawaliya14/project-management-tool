#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pmtool.settings')
django.setup()

from core.models import Organization, Project, Task

# Create organizations
orgs = [
    {"name": "ACME Corporation", "slug": "acme", "contact_email": "contact@acme.com"},
    {"name": "TechCorp Inc", "slug": "techcorp", "contact_email": "info@techcorp.com"},
    {"name": "StartupX", "slug": "startupx", "contact_email": "hello@startupx.io"},
]

for org_data in orgs:
    org, created = Organization.objects.get_or_create(
        slug=org_data["slug"],
        defaults={
            "name": org_data["name"],
            "contact_email": org_data["contact_email"]
        }
    )
    print(f"{'Created' if created else 'Found'} organization: {org.name}")

# Create projects for ACME
acme_org = Organization.objects.get(slug="acme")
acme_projects = [
    {"name": "First Project", "description": "Description for first project", "status": "ACTIVE"},
    {"name": "Project 2", "description": "Description for project 2", "status": "COMPLETED"},
]

for proj_data in acme_projects:
    project, created = Project.objects.get_or_create(
        organization=acme_org,
        name=proj_data["name"],
        defaults=proj_data
    )
    print(f"{'Created' if created else 'Found'} project: {project.name} for {acme_org.name}")

# Create projects for TechCorp
techcorp_org = Organization.objects.get(slug="techcorp")
techcorp_projects = [
    {"name": "Mobile App", "description": "New mobile application", "status": "ACTIVE"},
    {"name": "Website Redesign", "description": "Redesigning company website", "status": "ACTIVE"},
]

for proj_data in techcorp_projects:
    project, created = Project.objects.get_or_create(
        organization=techcorp_org,
        name=proj_data["name"],
        defaults=proj_data
    )
    print(f"{'Created' if created else 'Found'} project: {project.name} for {techcorp_org.name}")

# Create tasks for First Project (ACME)
first_project = Project.objects.get(organization=acme_org, name="First Project")
tasks = [
    {"title": "Setup environment", "description": "Setup development environment", "status": "DONE", "assignee_email": "dev@acme.com"},
    {"title": "Design mockups", "description": "Create UI mockups", "status": "IN_PROGRESS", "assignee_email": "designer@acme.com"},
    {"title": "Implement API", "description": "Build REST API", "status": "TODO", "assignee_email": ""},
]

for task_data in tasks:
    task, created = Task.objects.get_or_create(
        project=first_project,
        title=task_data["title"],
        defaults=task_data
    )
    print(f"{'Created' if created else 'Found'} task: {task.title} for {first_project.name}")

print("Test data creation completed!")