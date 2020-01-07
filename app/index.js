import app from './server/index.js'

app.listen({ port: 4000 }, () =>
  console.log('🚀 Server ready at http://localhost:4000/graphql')
)
