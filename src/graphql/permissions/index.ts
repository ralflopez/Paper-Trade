import { allow, shield } from "graphql-shield"
import { isAuthenticated } from "./rules"
import { isA } from "jest-mock-extended"

export const permissions = shield({
  Query: {
    refreshToken: allow,
    "*": isAuthenticated,
  },
  Mutation: {
    login: allow,
    signup: allow,
    "*": isAuthenticated,
  },
})
