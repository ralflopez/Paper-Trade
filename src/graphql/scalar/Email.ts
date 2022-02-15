import { asNexusMethod } from "nexus"
import { GraphQLEmailAddress } from "graphql-scalars"

export const GQLEmail = asNexusMethod(GraphQLEmailAddress, "email")
