import graphene
from graphene_django import DjangoObjectType
from graphql import GraphQLError
from django.db.models import Count, Q
from django.core.exceptions import ValidationError
from django.utils import timezone
from .models import Organization, Project, Task, TaskComment


# Helpers
def require_org(info):
    org = getattr(info.context, "organization", None)
    if not org:
        raise GraphQLError("Organization not resolved. Provide header 'X-Org-Slug'.")
    return org


# GraphQL Types
class OrganizationType(DjangoObjectType):
    class Meta:
        model = Organization
        fields = ("id", "name", "slug", "contact_email", "created_at")


class TaskCommentType(DjangoObjectType):
    class Meta:
        model = TaskComment
        fields = ("id", "content", "author_email", "created_at")


class TaskType(DjangoObjectType):
    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "status",
            "assignee_email",
            "due_date",
            "created_at",
            "comments",
        )


class ProjectType(DjangoObjectType):
    task_count = graphene.Int()
    completed_tasks = graphene.Int()
    completion_rate = graphene.Float()

    class Meta:
        model = Project
        fields = ("id", "name", "description", "status", "due_date", "created_at", "tasks")

    def resolve_task_count(self, info):
        return self.tasks.count()

    def resolve_completed_tasks(self, info):
        return self.tasks.filter(status="DONE").count()

    def resolve_completion_rate(self, info):
        total = self.tasks.count()
        done = self.tasks.filter(status="DONE").count()
        return (done / total) if total else 0.0


# Queries
class Query(graphene.ObjectType):
    organizations = graphene.List(OrganizationType)
    organization = graphene.Field(OrganizationType, id=graphene.ID(required=True))
    projects = graphene.List(ProjectType)
    project = graphene.Field(ProjectType, id=graphene.ID(required=True))
    tasks = graphene.List(TaskType, project_id=graphene.ID(required=True))

    def resolve_organizations(self, info):
        return Organization.objects.all()

    def resolve_organization(self, info, id):
        try:
            return Organization.objects.get(id=id)
        except Organization.DoesNotExist:
            raise GraphQLError("Organization not found")

    def resolve_projects(self, info):
        org = require_org(info)
        return Project.objects.filter(organization=org).prefetch_related("tasks")

    def resolve_project(self, info, id):
        org = require_org(info)
        try:
            return Project.objects.prefetch_related("tasks").get(id=id, organization=org)
        except Project.DoesNotExist:
            raise GraphQLError("Project not found")

    def resolve_tasks(self, info, project_id):
        org = require_org(info)
        try:
            project = Project.objects.get(id=project_id, organization=org)
        except Project.DoesNotExist:
            raise GraphQLError("Project not found")
        return project.tasks.all().prefetch_related("comments")


# Mutations
class CreateOrganization(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        slug = graphene.String(required=True)
        contact_email = graphene.String(required=True)

    organization = graphene.Field(OrganizationType)

    def mutate(self, info, name, slug, contact_email):
        # Validation
        if not name or len(name.strip()) < 2:
            raise GraphQLError("Organization name must be at least 2 characters long")
        
        if not slug or len(slug.strip()) < 2:
            raise GraphQLError("Organization slug must be at least 2 characters long")
        
        if "@" not in contact_email:
            raise GraphQLError("Invalid email format")
        
        # Check for duplicate slug
        if Organization.objects.filter(slug=slug).exists():
            raise GraphQLError("An organization with this slug already exists")
        
        organization = Organization.objects.create(
            name=name.strip(),
            slug=slug.strip(),
            contact_email=contact_email.strip()
        )
        return CreateOrganization(organization=organization)


class UpdateOrganization(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        slug = graphene.String()
        contact_email = graphene.String()

    organization = graphene.Field(OrganizationType)

    def mutate(self, info, id, name=None, slug=None, contact_email=None):
        try:
            organization = Organization.objects.get(id=id)
        except Organization.DoesNotExist:
            raise GraphQLError("Organization not found")

        if name is not None:
            if len(name.strip()) < 2:
                raise GraphQLError("Organization name must be at least 2 characters long")
            organization.name = name.strip()
        
        if slug is not None:
            if len(slug.strip()) < 2:
                raise GraphQLError("Organization slug must be at least 2 characters long")
            # Check for duplicate slug (excluding current organization)
            if Organization.objects.filter(slug=slug).exclude(id=id).exists():
                raise GraphQLError("An organization with this slug already exists")
            organization.slug = slug.strip()
        
        if contact_email is not None:
            if "@" not in contact_email:
                raise GraphQLError("Invalid email format")
            organization.contact_email = contact_email.strip()
        
        organization.save()
        return UpdateOrganization(organization=organization)


class DeleteOrganization(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)

    success = graphene.Boolean()

    def mutate(self, info, id):
        try:
            organization = Organization.objects.get(id=id)
            organization.delete()
            return DeleteOrganization(success=True)
        except Organization.DoesNotExist:
            raise GraphQLError("Organization not found")


class CreateProject(graphene.Mutation):
    class Arguments:
        name = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)

    def mutate(self, info, name, description=None, status="ACTIVE", due_date=None):
        org = require_org(info)
        
        # Validation
        if not name or len(name.strip()) < 2:
            raise GraphQLError("Project name must be at least 2 characters long")
        
        if status not in ["ACTIVE", "COMPLETED", "ON_HOLD"]:
            raise GraphQLError("Invalid status. Must be one of: ACTIVE, COMPLETED, ON_HOLD")
        
        if due_date and due_date < timezone.now().date():
            raise GraphQLError("Due date cannot be in the past")
        
        # Check for duplicate project names within organization
        if Project.objects.filter(organization=org, name=name).exists():
            raise GraphQLError("A project with this name already exists in your organization")
        
        project = Project.objects.create(
            name=name.strip(),
            description=description or "",
            status=status,
            due_date=due_date,
            organization=org
        )
        return CreateProject(project=project)


class UpdateProject(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        name = graphene.String()
        description = graphene.String()
        status = graphene.String()
        due_date = graphene.Date()

    project = graphene.Field(ProjectType)

    def mutate(self, info, id, name=None, description=None, status=None, due_date=None):
        org = require_org(info)
        try:
            project = Project.objects.get(id=id, organization=org)
        except Project.DoesNotExist:
            raise GraphQLError("Project not found")

        if name is not None:
            project.name = name
        if description is not None:
            project.description = description
        if status is not None:
            project.status = status
        if due_date is not None:
            project.due_date = due_date
        
        project.save()
        return UpdateProject(project=project)


class CreateTask(graphene.Mutation):
    class Arguments:
        project_id = graphene.ID(required=True)
        title = graphene.String(required=True)
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    task = graphene.Field(TaskType)

    def mutate(self, info, project_id, title, description=None, status="TODO", assignee_email=None, due_date=None):
        org = require_org(info)
        
        # Validation
        if not title or len(title.strip()) < 2:
            raise GraphQLError("Task title must be at least 2 characters long")
        
        if status not in ["TODO", "IN_PROGRESS", "DONE"]:
            raise GraphQLError("Invalid status. Must be one of: TODO, IN_PROGRESS, DONE")
        
        if assignee_email and "@" not in assignee_email:
            raise GraphQLError("Invalid email format for assignee")
        
        try:
            project = Project.objects.get(id=project_id, organization=org)
        except Project.DoesNotExist:
            raise GraphQLError("Project not found")

        task = Task.objects.create(
            project=project,
            title=title.strip(),
            description=description or "",
            status=status,
            assignee_email=assignee_email or "",
            due_date=due_date
        )
        return CreateTask(task=task)


class UpdateTask(graphene.Mutation):
    class Arguments:
        id = graphene.ID(required=True)
        title = graphene.String()
        description = graphene.String()
        status = graphene.String()
        assignee_email = graphene.String()
        due_date = graphene.DateTime()

    task = graphene.Field(TaskType)

    def mutate(self, info, id, title=None, description=None, status=None, assignee_email=None, due_date=None):
        org = require_org(info)
        try:
            task = Task.objects.get(id=id, project__organization=org)
        except Task.DoesNotExist:
            raise GraphQLError("Task not found")

        if title is not None:
            task.title = title
        if description is not None:
            task.description = description
        if status is not None:
            task.status = status
        if assignee_email is not None:
            task.assignee_email = assignee_email
        if due_date is not None:
            task.due_date = due_date
        
        task.save()
        return UpdateTask(task=task)


class AddTaskComment(graphene.Mutation):
    class Arguments:
        task_id = graphene.ID(required=True)
        content = graphene.String(required=True)
        author_email = graphene.String(required=True)

    comment = graphene.Field(TaskCommentType)

    def mutate(self, info, task_id, content, author_email):
        org = require_org(info)
        try:
            task = Task.objects.get(id=task_id, project__organization=org)
        except Task.DoesNotExist:
            raise GraphQLError("Task not found")

        comment = TaskComment.objects.create(
            task=task,
            content=content,
            author_email=author_email
        )
        return AddTaskComment(comment=comment)


class Mutation(graphene.ObjectType):
    create_organization = CreateOrganization.Field()
    update_organization = UpdateOrganization.Field()
    delete_organization = DeleteOrganization.Field()
    create_project = CreateProject.Field()
    update_project = UpdateProject.Field()
    create_task = CreateTask.Field()
    update_task = UpdateTask.Field()
    add_task_comment = AddTaskComment.Field()


# Schema
schema = graphene.Schema(query=Query, mutation=Mutation)
