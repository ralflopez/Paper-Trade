import { Balance, BalanceType, PrismaClient } from "@prisma/client"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime"
import { DataSource, DataSourceConfig } from "apollo-datasource"
import { ApolloError, UserInputError } from "apollo-server-errors"
import { Context } from "../../config/context"
import { CrudDataSource, DatasourceConstructor } from "../../types/datasource"

export class BalanceDataSource extends DataSource implements CrudDataSource {
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

  async getOne(id: string): Promise<Balance> {
    return await this.prisma.balance.findUnique({
      where: { id },
      rejectOnNotFound: () => new UserInputError("Trade not found"),
    })
  }

  async getAll(userId: string): Promise<Balance[]> {
    return await this.prisma.balance.findMany({
      where: {
        userId,
      },
      orderBy: {
        timestamp: "desc",
      },
    })
  }

  async getTotalCapital(userId: string): Promise<any> {
    const result = await this.prisma.balance.groupBy({
      by: ["type"],
      where: {
        userId,
      },
      _sum: {
        amount: true,
      },
    })

    const data: BalanceAggregate[] = result.map((r) => {
      return {
        amount: r._sum.amount,
        type: r.type,
      } as BalanceAggregate
    })

    return data
  }

  async createOne(
    amount: number,
    type: BalanceType,
    userId: string
  ): Promise<Balance> {
    try {
      return await this.prisma.balance.create({
        data: {
          amount,
          type,
          userId,
        },
      })
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
