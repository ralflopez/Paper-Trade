import { ExpressContext } from "apollo-server-express"
import { UserDataSource } from "../graphql/user/userDataSource"
import { prisma } from "./prisma/client"
import { Request, Response } from "express"
import { IDataSources } from "../types/datasource"
import { getUserId } from "../vendor/victoriris/authUtil"
import { User } from "@prisma/client"
import { BalanceDataSource } from "../graphql/balance/balanceDataSource"
import { TradeDataSource } from "../graphql/trade/tradeDataSource"
import { Loader } from "./dataloader"

export interface Context {
  request: Request
  response: Response
  user: Partial<User> | null
  dataSources: IDataSources
  dataloader: {
    loader: Loader
  }
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
      balance: new BalanceDataSource({ prisma }),
      trade: new TradeDataSource({ prisma }),
    },
    dataloader: {
      loader: new Loader(),
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
