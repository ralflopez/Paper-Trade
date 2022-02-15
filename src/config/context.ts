import {ExpressContext} from "apollo-server-express"
import {UserDataSource} from "../graphql/user/userDataSource";
import {prisma} from './prisma/client'
import {Request, Response} from "express";
import {IDateSources} from "../types/datasource";

export interface Context {
  request: Request
  response: Response
  user: { id: string } | null
  dataSources: IDateSources
}

export async function createContext(
  request: ExpressContext
): Promise<Partial<Context>> {
  return {
    ...request,
    request: request.req,
    response: request.res,
    user: null,
    dataSources: ({
      user: new UserDataSource({ prisma }),
    })
  } as Context
}