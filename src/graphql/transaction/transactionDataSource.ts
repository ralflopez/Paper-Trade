import { PrismaClient, Transaction, TransactionType } from "@prisma/client"
import { DataSource, DataSourceConfig } from "apollo-datasource"
import {
  ApolloError,
  ForbiddenError,
  UserInputError,
} from "apollo-server-errors"
import { Context } from "../../config/context"
import { DatasourceConstructor } from "../../config/datasource"

export class TransactionDataSource extends DataSource {
  context?: Context
  prisma: PrismaClient
  userId?: string

  constructor({ prisma }: DatasourceConstructor) {
    super()
    if (!prisma) throw new ApolloError("Persistent layer cannot be null")
    this.prisma = prisma
  }

  initialize(config: DataSourceConfig<Context>) {
    this.context = config.context
  }

  private getUserId(): string {
    const userId = this.context?.user?.id
    if (!userId) throw new ForbiddenError("You are not logged in")
    return userId
  }

  private toNegative(input: number): number {
    return input > 0 ? input * -1 : input
  }

  async buy(
    userId: string,
    amount: number,
    symbol: string
  ): Promise<Transaction> {
    if (amount < 0) throw new UserInputError("Amount cannot be negative")

    const transaction = await this.prisma.transaction.create({
      data: {
        amount: this.toNegative(amount),
        symbol,
        type: TransactionType.BUY,
        userId,
      },
    })

    return transaction
  }

  async sell(
    userId: string,
    amount: number,
    symbol: string
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        amount,
        symbol,
        type: TransactionType.SELL,
        userId,
      },
    })

    return transaction
  }

  async deposit(userId: string, amount: number): Promise<Transaction> {
    if (amount < 0) throw new UserInputError("Amount cannot be negative")
    const transaction = this.prisma.transaction.create({
      data: {
        amount,
        symbol: "CASH",
        type: TransactionType.DEPOSIT,
        userId,
      },
    })

    return transaction
  }

  async withdraw(userId: string, amount: number): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: this.toNegative(amount),
        symbol: "CASH",
        type: TransactionType.WITHDRAW,
        userId,
      },
    })

    return transaction
  }

  async getMyTransactions(
    userId: string,
    transactionId?: string
  ): Promise<Transaction[]> {
    const transaction = await this.prisma.transaction.findMany({
      where: {
        id: transactionId,
        userId,
      },
    })

    return transaction
  }
}
