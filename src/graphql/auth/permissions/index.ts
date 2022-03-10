import { allow, or, shield } from "graphql-shield"
import { isAdmin, isAuthenticated, isSelf } from "./rules"

export const permissions = shield(
  {
    Query: {
      refreshToken: allow,
      test: allow,
      getUsers: isAdmin,
      getMyUser: isSelf,
      "*": isAuthenticated,
    },
    Mutation: {
      login: allow,
      signup: allow,
      updateUser: or(isSelf, isAdmin),
      deleteUser: or(isSelf, isAdmin),
      "*": isAuthenticated,
    },
  },
  {
    debug: true,
  }
)
