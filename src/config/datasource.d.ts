import { PrismaClient } from "@prisma/client"
import { BalanceDataSource } from "../graphql/balance/balanceDataSource"
import { TradeDataSource } from "../graphql/trade/tradeDataSource"
import { UserDataSource } from "../graphql/user/userDataSource"
import { TransactionDataSource } from "../graphql/transaction/transactionDataSource"

export type DatasourceConstructor = {
  prisma: PrismaClient
}

export interface IDataSources {
  user: UserDataSource
  transaction: TransactionDataSource
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
