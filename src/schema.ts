import { makeSchema } from "nexus"
import { join } from "path"
import * as types from "./graphql"
import { applyMiddleware } from "graphql-middleware"
import { permissions } from "./graphql/permissions"
import { GraphQLSchema } from "graphql"

const ROOT_RELATIVE_PATH = join(__dirname, "..")

const nexusSchema = makeSchema({
  types,
  outputs: {
    schema: join(ROOT_RELATIVE_PATH, "schema.graphql"),
    typegen: join(ROOT_RELATIVE_PATH, "nexus-typegen.ts"),
  },
  contextType: {
    module: join(__dirname, "./config/context.ts"),
    export: "Context",
  },
}) as unknown as GraphQLSchema

export const schema = applyMiddleware(nexusSchema, permissions)
