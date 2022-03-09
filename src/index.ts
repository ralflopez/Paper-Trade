import { schema } from "./schema"
import { createContext } from "./config/context"
import { GraphQLSchema } from "graphql"
import { ApolloServer, CorsOptions } from "apollo-server-express"
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core"
import express, { Express } from "express"
import http, { Server } from "http"
import cookieParser from "cookie-parser"
import dotenv from "dotenv"

dotenv.config()

export function createApolloServer() {
  const app = express()
  app.use(cookieParser())

  const httpServer = http.createServer(app)
  const server = new ApolloServer({
    schema: schema as unknown as GraphQLSchema,
    context: createContext,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: process.env.NODE_ENV !== "production",
  })

  const cors: CorsOptions = {
    origin: [
      "https://studio.apollographql.com",
      "http://localhost:3000",
      process.env.CLIENT_URL || "",
    ],
    credentials: true,
  }

  server.start().then(() => server.applyMiddleware({ app, cors }))
  return { server, httpServer, app }
}

async function startApolloServer(
  server: ApolloServer,
  httpServer: Server,
  app: Express
) {
  await new Promise<void>((resolve) =>
    httpServer.listen({ port: 4000 }, resolve)
  )
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
}

if (require.main === module) {
  // equivalent to if __name__ == '__main__' in python
  const { server, httpServer, app } = createApolloServer()
  startApolloServer(server, httpServer, app).catch(() =>
    console.error("Failed to run apollo server")
  )
}
