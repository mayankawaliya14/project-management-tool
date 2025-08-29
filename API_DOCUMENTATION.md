# API Documentation

## GraphQL Endpoint
- **URL**: `http://localhost:8000/graphql/`
- **Method**: POST
- **Headers**: 
  - `Content-Type: application/json`
  - `X-Org-Slug: {organization_slug}` (Required)

## Authentication
This API uses organization-based multi-tenancy. All requests must include the `X-Org-Slug` header to specify which organization's data to access.

## Queries

### Get All Projects
```graphql
query GetProjects {
  projects {
    id
    name
    description
    status
    dueDate
    createdAt
    taskCount
    completedTasks
    completionRate
  }
}
```

### Get Single Project
```graphql
query GetProject($id: ID!) {
  project(id: $id) {
    id
    name
    description
    status
    dueDate
    createdAt
    taskCount
    completedTasks
    completionRate
    tasks {
      id
      title
      status
      assigneeEmail
    }
  }
}
```

### Get Tasks for Project
```graphql
query GetTasks($projectId: ID!) {
  tasks(projectId: $projectId) {
    id
    title
    description
    status
    assigneeEmail
    dueDate
    createdAt
    comments {
      id
      content
      authorEmail
      createdAt
    }
  }
}
```

## Mutations

### Create Project
```graphql
mutation CreateProject(
  $name: String!
  $description: String
  $status: String
  $dueDate: Date
) {
  createProject(
    name: $name
    description: $description
    status: $status
    dueDate: $dueDate
  ) {
    project {
      id
      name
      description
      status
      dueDate
      taskCount
      completedTasks
      completionRate
    }
  }
}
```

### Update Project
```graphql
mutation UpdateProject(
  $id: ID!
  $name: String
  $description: String
  $status: String
  $dueDate: Date
) {
  updateProject(
    id: $id
    name: $name
    description: $description
    status: $status
    dueDate: $dueDate
  ) {
    project {
      id
      name
      description
      status
      dueDate
      taskCount
      completedTasks
      completionRate
    }
  }
}
```

### Create Task
```graphql
mutation CreateTask(
  $projectId: ID!
  $title: String!
  $description: String
  $status: String
  $assigneeEmail: String
  $dueDate: DateTime
) {
  createTask(
    projectId: $projectId
    title: $title
    description: $description
    status: $status
    assigneeEmail: $assigneeEmail
    dueDate: $dueDate
  ) {
    task {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      createdAt
    }
  }
}
```

### Update Task
```graphql
mutation UpdateTask(
  $id: ID!
  $title: String
  $description: String
  $status: String
  $assigneeEmail: String
  $dueDate: DateTime
) {
  updateTask(
    id: $id
    title: $title
    description: $description
    status: $status
    assigneeEmail: $assigneeEmail
    dueDate: $dueDate
  ) {
    task {
      id
      title
      description
      status
      assigneeEmail
      dueDate
      createdAt
    }
  }
}
```

### Add Task Comment
```graphql
mutation AddTaskComment(
  $taskId: ID!
  $content: String!
  $authorEmail: String!
) {
  addTaskComment(
    taskId: $taskId
    content: $content
    authorEmail: $authorEmail
  ) {
    comment {
      id
      content
      authorEmail
      createdAt
    }
  }
}
```

## Data Types

### Project Statuses
- `ACTIVE`: Project is currently active
- `COMPLETED`: Project has been completed
- `ON_HOLD`: Project is temporarily paused

### Task Statuses
- `TODO`: Task is not started
- `IN_PROGRESS`: Task is currently being worked on
- `DONE`: Task has been completed

## Error Handling

The API returns GraphQL errors in the following format:
```json
{
  "errors": [
    {
      "message": "Error description",
      "extensions": {
        "code": "ERROR_CODE"
      }
    }
  ]
}
```

### Common Errors
- `Organization not resolved. Provide header 'X-Org-Slug'.`: Missing or invalid organization slug
- `Project not found`: Project doesn't exist or doesn't belong to the organization
- `Task not found`: Task doesn't exist or doesn't belong to the organization
- `Project name must be at least 2 characters long`: Validation error
- `Invalid email format for assignee`: Email validation error
- `Due date cannot be in the past`: Date validation error

## Example Requests

```typescript
const client = new ApolloClient({
  uri: 'http://localhost:8000/graphql/',
  headers: {
    'X-Org-Slug': 'acme'
  }
});

// Get projects
const { data } = await client.query({
  query: gql`
    {
      projects {
        id
        name
        status
        taskCount
        completedTasks
        completionRate
      }
    }
  `
});
```