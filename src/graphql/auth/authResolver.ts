import { mutationField, nonNull, queryField } from "nexus"
import { AuthPayload } from "./auth-type"
import { User } from "../user/user-type"
import {
  createTokens,
  getRefreshCookie,
} from "../../vendor/victoriris/authUtil"
import { AuthenticationError } from "apollo-server-errors"

// Query
export const RefreshTokenQuery = queryField("refreshToken", {
  type: "AuthPayload",
  resolve: async (_parent, _args, context): Promise<AuthPayload> => {
    const refreshToken = getRefreshCookie({ request: context.request })
    if (!refreshToken) throw new AuthenticationError("No credentials found")

    const { accessToken } = await createTokens({ userId: refreshToken.userId })

    const user: User = await context.dataSources.user.getOne(
      refreshToken.userId as string
    )
    if (!user) throw new AuthenticationError("Invalid token")

    return {
      user,
      token: accessToken,
    }
  },
})

// Mutation
export const signupMutation = mutationField("signup", {
  type: "AuthPayload",
  args: {
    data: nonNull("SignupInput"),
  },
  resolve: async (_parent, args, context): Promise<AuthPayload> => {
    const user: User = await context.dataSources.user.createOne(
      args.data.email,
      args.data.password,
      args.data.name
    )

    const { accessToken } = await createTokens({ userId: user.id }, context)

    context.user = user

    return {
      user,
      token: accessToken,
    }
  },
})

export const loginMutation = mutationField("login", {
  type: "AuthPayload",
  args: {
    data: nonNull("LoginInput"),
  },
  resolve: async (_parent, args, context): Promise<AuthPayload> => {
    const user: User = await context.dataSources.user.getOneByEmailAndPassword(
      args.data.email,
      args.data.password
    )

    const { accessToken } = await createTokens({ userId: user.id }, context)

    context.user = user

    return {
      user: user,
      token: accessToken,
    }
  },
})
