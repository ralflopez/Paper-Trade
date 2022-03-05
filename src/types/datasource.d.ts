import { PrismaClient } from "@prisma/client"
import { BalanceDataSource } from "../graphql/balance/balanceDataSource"
import { UserDataSource } from "../graphql/user/userDataSource"

export type DatasourceConstructor = {
  prisma: PrismaClient
}

export interface IDateSources {
  user: UserDataSource
  balance: BalanceDataSource
}

export interface CrudDataSource {
  createOne: any
  createMany?: any
  getOne: any
  getMany?: any
  updateOne: any
  updateMany?: any
  deleteOne: any
  deleteMany?: any
}
