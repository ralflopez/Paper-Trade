import { mutationField, nonNull, queryField } from "nexus"
import { AuthPayload } from "./auth-type"
import { User } from "../user/user-type"
import {
  createTokens,
  getRefreshCookie,
  removeRefreshCookie,
} from "../../vendor/victoriris/authUtil"
import { AuthenticationError, UserInputError } from "apollo-server-errors"
import { isValidEmail } from "../../helpers/auth/isValidEmail"
// Query
export const logoutQuery = queryField("logout", {
  type: "Boolean",
  resolve: async (_parent, _args, context) => {
    removeRefreshCookie(context)
    return true
  },
})

export const refreshTokenQuery = queryField("refreshToken", {
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
  resolve: async (
    _parent,
    { data: { email, password, name } },
    context
  ): Promise<AuthPayload> => {
    // validation
    if (!isValidEmail(email))
      throw new UserInputError(`Invalid Email: ${email}`)
    if (password.length < 8)
      throw new UserInputError("Password must be atleast 8 characters")
    if (name.length < 1) throw new UserInputError("Name cannot be blank")

    const user: User = await context.dataSources.user.createOne(
      email,
      password,
      name
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
  resolve: async (
    _parent,
    { data: { email, password } },
    context
  ): Promise<AuthPayload> => {
    const user: User = await context.dataSources.user.getOneByEmailAndPassword(
      email,
      password
    )

    const { accessToken } = await createTokens({ userId: user.id }, context)

    context.user = user

    return {
      user: user,
      token: accessToken,
    }
  },
})
