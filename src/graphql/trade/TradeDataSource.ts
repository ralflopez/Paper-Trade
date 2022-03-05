import { PrismaClient, Trade, TradeType } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime"
import { DataSource, DataSourceConfig } from "apollo-datasource"
import { ApolloError, UserInputError } from "apollo-server-errors"
import { Context } from "../../config/context"
import { CrudDataSource, DatasourceConstructor } from "../../types/datasource"
import { TradePortfolioSummary } from "./trade-type"

export class TradeDataSource
  extends DataSource
  implements Partial<CrudDataSource>
{
  context?: Context
  prisma: PrismaClient

  constructor({ prisma }: DatasourceConstructor) {
    super()
    if (!prisma) throw new ApolloError("Persistent layer cannot be null")
    this.prisma = prisma
  }

  initialize(config: DataSourceConfig<Context>) {
    this.context = config.context
  }

  async getOne(id: string): Promise<Trade> {
    return await this.prisma.trade.findUnique({
      where: { id },
      rejectOnNotFound: () => new UserInputError("Trade not found"),
    })
  }

  async getAll(userId: string): Promise<Trade[]> {
    return await this.prisma.trade.findMany({
      where: {
        userId,
      },
      orderBy: {
        timestamp: "desc",
      },
    })
  }

  async getPortfolio(userId: string): Promise<TradePortfolioSummary[]> {
    const result = await this.prisma.trade.groupBy({
      by: ["coinId"],
      where: {
        userId,
      },
      _sum: {
        amount: true,
        value: true,
      },
    })

    const data: TradePortfolioSummary[] = result.map((r) => {
      return {
        amount: r._sum.amount as number,
        coinId: r.coinId,
      } as TradePortfolioSummary
    })

    return data
  }

  async createOne(
    amount: number,
    value: number,
    coinId: string,
    type: TradeType,
    userId: string
  ): Promise<Trade> {
    try {
      const trade = await this.prisma.trade.create({
        data: {
          amount,
          value,
          coinId,
          type,
          userId,
        },
      })

      return trade
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new UserInputError("Trade already exists")
      } else {
        throw new UserInputError("Error creating a new user")
      }
    }
  }
}
