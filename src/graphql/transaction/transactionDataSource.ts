import {
  AssetType,
  PrismaClient,
  Transaction,
  TransactionType,
} from "@prisma/client"
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
    symbol: string,
    assetId: string,
    valueUsd: number
  ): Promise<Transaction> {
    if (amount < 0) throw new UserInputError("Amount cannot be negative")

    const transaction = await this.prisma.transaction.create({
      data: {
        amount: this.toNegative(amount),
        symbol,
        type: TransactionType.BUY,
        userId,
        assetId,
        assetType: AssetType.CRYPTO,
        valueUsd,
      },
    })

    return transaction
  }

  async sell(
    userId: string,
    amount: number,
    symbol: string,
    assetId: string,
    valueUsd: number
  ): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        amount,
        symbol,
        type: TransactionType.SELL,
        userId,
        assetId,
        assetType: AssetType.CRYPTO,
        valueUsd,
      },
    })

    return transaction
  }

  async deposit(userId: string, amount: number): Promise<Transaction> {
    if (amount < 0) throw new UserInputError("Amount cannot be negative")
    const transaction = this.prisma.transaction.create({
      data: {
        amount,
        symbol: "USD",
        valueUsd: 1,
        type: TransactionType.DEPOSIT,
        userId,
        assetId: "united-states-dollar",
        assetType: AssetType.FIAT,
      },
    })

    return transaction
  }

  async withdraw(userId: string, amount: number): Promise<Transaction> {
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: this.toNegative(amount),
        symbol: "USD",
        valueUsd: 1,
        type: TransactionType.WITHDRAW,
        userId,
        assetId: "united-states-dollar",
        assetType: AssetType.FIAT,
      },
    })

    return transaction
  }

  async getMyTransactions(userId: string): Promise<Transaction[]> {
    try {
      const transaction = await this.prisma.transaction.findMany({
        where: {
          userId,
        },
      })

      return transaction
    } catch (e) {
      throw new ApolloError("Cannot get transaction information at the moment")
    }
  }

  async getMyPortfolio(userId: string): Promise<PortfolioSummary> {
    try {
      const buyingPowerQuery: BuyingPowerQuery[] = await this.prisma
        .$queryRaw`SELECT SUM(amount * "valueUsd") FROM "Transaction"`

      const assetAllocationQuery: AssetAllocationQuery[] = await this.prisma
        .$queryRaw`SELECT symbol, "assetId", SUM(amount*-1) as total, AVG("valueUsd") as average FROM "Transaction" GROUP BY symbol, "assetId" HAVING SUM(amount*-1) > 0`

      const portfolioSummary: PortfolioSummary = {
        allocation: assetAllocationQuery,
        buyingPower: buyingPowerQuery[0]?.sum || 0,
      }

      return portfolioSummary
    } catch (e) {
      throw new ApolloError(
        "Unable to get your portfolio information at the moment"
      )
    }
  }
}
