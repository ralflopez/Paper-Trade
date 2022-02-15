import { PrismaClient, Trade, TradeType } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime"
import { DataSource, DataSourceConfig } from "apollo-datasource"
import { ApolloError, UserInputError } from "apollo-server-errors"
import { Context } from "../../config/context"
import { CrudDataSource, DatasourceConstructor } from "../../types/datasource"

export class TradeDataSource extends DataSource implements CrudDataSource {
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

  async getPortfolio(userId: string) {
    return await this.prisma.trade.groupBy({
      by: ["coinId"],
      where: {
        userId,
      },
      _sum: {
        amount: true,
        value: true,
      },
    })
  }

  async createOne(
    amount: number,
    value: number,
    coinId: string,
    type: TradeType,
    userId: string
  ): Promise<Trade> {
    try {
      const user = await this.prisma.trade.create({
        data: {
          amount,
          value,
          coinId,
          type,
          userId,
        },
      })

      return user
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        throw new UserInputError("Trade already exists")
      } else {
        throw new UserInputError("Error creating a new user")
      }
    }
  }

  async deleteOne() {
    return null
  }

  async updateOne() {
    return null
  }
}
