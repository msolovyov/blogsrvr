import express from 'express'
// import { ApolloServer, gql } from 'apollo-server'
import apollo from 'apollo-server-express'
import apolloRest from 'apollo-datasource-rest'

import uniqBy from 'lodash/fp/uniqBy.js'

import flow from 'lodash/fp/flow.js'
import orderBy from 'lodash/fp/orderBy.js'
import ast from 'apollo-server-testing'

// reasons for using apollo/graphql:
// we can extend it into the future to include any other apis or sources easily
// describe the data in any way easily for querying
// we get caching for free
// easy to add restrictions to allowed variables
const gql = apollo.gql
const ApolloServer = apollo.ApolloServer
const RESTDataSource = apolloRest.RESTDataSource
const createTestClient = ast.createTestClient

class BlogPostsAPI extends RESTDataSource {
  constructor () {
    super()
    // setup super secret rest source api for getting posts by single tag
    var _0xe013 = ['\x62\x61\x73\x65\x55\x52\x4C', '\x68\x74\x74\x70\x73\x3A\x2F\x2F\x68\x61\x74\x63\x68\x77\x61\x79\x73\x2E\x69\x6F\x2F\x61\x70\x69\x2F\x61\x73\x73\x65\x73\x73\x6D\x65\x6E\x74\x2F\x62\x6C\x6F\x67\x2F']; this[_0xe013[0]] = _0xe013[1]
  }

  async getPosts (tag) {
    const res = await this.get('posts', {
      tag: tag
    })

    return res.posts
  }
}

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  enum AllowedSortKey {
    id
    reads
    likes
    popularity
  }

  enum AllowedDirection {
    asc
    desc
  }
  type Post {
    id: Int!,
    author: String,
    authorId: Int,
    likes: Int,
    popularity: Float,
    reads: Int,
    tags: [String!]!
  }
  type Query {
    posts(tags: [String!]!, sortKey: AllowedSortKey = "id", direction: AllowedDirection = "asc"): [Post]
  }
  
`

// Provide resolver functions for your schema fields
const resolvers = {
  Query: {
    posts: async (_source, { tags, sortKey, direction }, { dataSources }) => {
      // get the posts from the REST api and flatten them to be one array
      const posts = (await Promise.all(tags.flatMap(tag => dataSources.blogPostsAPI.getPosts(tag)))).flat(1)

      return flow(
        uniqBy('id'), // remove duplicate posts
        orderBy(sortKey, direction) // sort by key and direction
      )(posts)
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => {
    return {
      blogPostsAPI: new BlogPostsAPI()
    }
  }
})

const app = express()
app.get('/api/ping', (req, res) => res.status(200).json({ success: true }))
app.get('/api/posts', async (req, res) => {
  const restQuery = req.query
  const { tags, sortBy, direction } = restQuery
  if (!tags) {
    res.status(400).json({ error: 'Tags parameter is required' })
    return
  }
  const tagsArr = tags && tags.split(',')

  const GET_POSTS = gql`
    query posts($tags: [String!]!, $sortKey: AllowedSortKey, $direction: AllowedDirection) {
    posts (tags:$tags, sortKey: $sortKey, direction: $direction) {
      id
      author
      authorId
      likes
      popularity
      reads
      tags
    }
  }`
  const { query } = createTestClient(server)
  let resp
  try {
    resp = await query({ query: GET_POSTS, variables: { tags: tagsArr, sortKey: sortBy, direction: direction } })
    if (resp.errors) {
      res.status(400).json({ error: 'sortBy parameter is invalid' })
    }
  } catch (error) {
    res.status(400).json({ error: error })
  }
  res.status(200).json(resp.data)
})
server.applyMiddleware({ app })

export default app
