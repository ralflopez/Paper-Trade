import { and, rule } from "graphql-shield"
import { Context } from "../../../config/context"
import { getUserId } from "../../../vendor/victoriris/authUtil"
import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from "apollo-server-errors"

export const isAuthenticated = rule({
  /*cache: "contextual" */
})(async (_parent, _args, context: Context) => {
  const userId = getUserId({ request: context.request })
  if (!userId) throw new AuthenticationError("No token provided")

  const exists = await context.dataSources.user.getOne(userId)
  if (!exists) throw new UserInputError("User doesn't exist")

  context.user = { id: userId as string }
  return true
})

const selfRule = rule({})(async (_parent, _args, context: Context) => {
  const userId = getUserId({ request: context.request })
  if (!userId) throw new AuthenticationError("No token provided")

  const storedUser = await context.dataSources.user.getOne(userId)

  if (storedUser.id !== userId)
    throw new ForbiddenError("You don't own this user")

  return true
})

export const isSelf = and(isAuthenticated, selfRule)

const adminRule = rule({
  /* cache: "contextual" */
})(async (_parent, _args, context: Context) => {
  const id = context.user?.id
  if (!id) throw new AuthenticationError("No token provided")

  const user = await context.dataSources.user.getOne(id)
  if (!user) throw new UserInputError("User not found")

  if (user?.role !== "ADMIN") throw new ForbiddenError("You are not an admin")

  return true
})

export const isAdmin = and(isAuthenticated, adminRule)
