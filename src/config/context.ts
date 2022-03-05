import { ExpressContext } from "apollo-server-express"
import { UserDataSource } from "../graphql/user/userDataSource"
import { prisma } from "./prisma/client"
import { Request, Response } from "express"
import { IDateSources } from "../types/datasource"
import { getUserId } from "../vendor/victoriris/authUtil"
import { User } from "@prisma/client"

export interface Context {
  request: Request
  response: Response
  user: Partial<User> | null
  dataSources: IDateSources
}

export async function createContext(
  ctx: ExpressContext
): Promise<Partial<Context>> {
  const gqlCtx: Context = {
    ...ctx,
    request: ctx.req,
    response: ctx.res,
    user: null,
    dataSources: {
      user: new UserDataSource({ prisma }),
    },
  }
  try {
    const userId = getUserId({ request: ctx.req })
    if (!userId) return gqlCtx

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
    })
    if (!user) return gqlCtx

    gqlCtx.user = {
      email: user.email,
      id: user.id,
      name: user.name,
    }
    return gqlCtx
  } catch (error) {
    return gqlCtx
  }
}
