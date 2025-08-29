import { gql } from '@apollo/client'


export const GET_ORGANIZATIONS = gql`
query GetOrganizations { organizations { id name slug contactEmail createdAt } }
`

export const GET_ORGANIZATION = gql`
query GetOrganization($id: ID!) { organization(id: $id) { id name slug contactEmail createdAt } }
`

export const GET_PROJECTS = gql`
query GetProjects { projects { id name description status dueDate taskCount completedTasks completionRate } }
`


export const GET_TASKS = gql`
query GetTasks($projectId: ID!) { tasks(projectId: $projectId) { id title description status assigneeEmail dueDate } }
`