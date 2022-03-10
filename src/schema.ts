import { makeSchema } from "nexus"
import { join } from "path"
import * as types from "./graphql"
import { applyMiddleware } from "graphql-middleware"
import { permissions } from "./graphql/auth/permissions"
import { GraphQLSchema } from "graphql"

const nexusSchema = makeSchema({
  types,
  outputs: {
    schema: join(process.cwd(), "schema.graphql"),
    typegen: join(process.cwd(), "nexus-typegen.ts"),
  },
  contextType: {
    module: join(process.cwd(), "src/config/context.ts"),
    export: "Context",
  },
}) as unknown as GraphQLSchema

export const schema = applyMiddleware(nexusSchema, permissions)
