import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { onError } from '@apollo/client/link/error'
import { setContext } from '@apollo/client/link/context'


const httpLink = createHttpLink({ uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8000/graphql/' })


const errorLink = onError(({ graphQLErrors, networkError }) => {
if (graphQLErrors) {
for (const err of graphQLErrors) console.error('[GraphQL error]:', err.message)
}
if (networkError) console.error('[Network error]:', networkError)
})


const authLink = setContext((_, { headers }) => {
const orgSlug = localStorage.getItem('orgSlug') || 'acme'
return { headers: { ...headers, 'X-Org-Slug': orgSlug } }
})


export const client = new ApolloClient({
link: errorLink.concat(authLink).concat(httpLink),
cache: new InMemoryCache({
typePolicies: {
Project: { keyFields: ['id'] },
Task: { keyFields: ['id'] },
Query: {
fields: {
projects: { 
  merge(existing = [], incoming: any[]) { return incoming },
  read(existing = []) { return existing }
},
tasks: { 
  merge(_, incoming: any[]) { return incoming },
  read(existing = []) { return existing }
},
}
}
}
}),
defaultOptions: {
watchQuery: {
fetchPolicy: 'cache-and-network',
errorPolicy: 'ignore',
},
query: {
fetchPolicy: 'cache-and-network',
errorPolicy: 'all',
},
},
})