import { and, rule } from "graphql-shield"
import { Context } from "../../../config/context"
import { getUserId } from "../../../vendor/victoriris/authUtil"

export const isAuthenticated = rule({
  /*cache: "contextual" */
})(async (_parent, _args, context: Context) => {
  const userId = getUserId({ request: context.request })
  if (!userId) return false

  const exists = await context.dataSources.user.getOne(userId)
  if (!exists) return false

  context.user = { id: userId as string }
  return true
})

const selfRule = rule({})(async (_parent, _args, context: Context) => {
  const userId = getUserId({ request: context.request })
  if (!userId) return false

  const storedUser = await context.dataSources.user.getOne(userId)

  return storedUser.id == userId
})

export const isSelf = and(isAuthenticated, selfRule)

const adminRule = rule({
  /* cache: "contextual" */
})(async (_parent, _args, context: Context) => {
  const id = context.user?.id
  if (!id) return false

  const user = await context.dataSources.user.getOne(id)
  if (!user) return false

  return user?.role === "ADMIN"
})

export const isAdmin = and(isAuthenticated, adminRule)
