import { ExpressContext } from "apollo-server-express"
import { UserDataSource } from "../graphql/user/userDataSource"
import { prisma } from "./prisma/client"
import { Request, Response } from "express"
import { IDataSources } from "./datasource"
import { getUserId } from "../vendor/victoriris/authUtil"
import { User } from "@prisma/client"
import { Loader } from "./dataloader"
import { TransactionDataSource } from "../graphql/transaction/transactionDataSource"
import { CoinCapIoDataSource } from "../services/coinCapIo/coinCapIoDataSource"
import { redisClient } from "../config/redis/client"

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
      transaction: new TransactionDataSource({ prisma }),
      coinCapIo: new CoinCapIoDataSource({ redisClient }),
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
