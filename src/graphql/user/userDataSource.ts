import { DataSource, DataSourceConfig } from "apollo-datasource"
import { PrismaClient, User as PrismaUser } from "@prisma/client"
import { User } from "./user-type"
import { ApolloError, UserInputError } from "apollo-server-errors"
import { CrudDataSource, DatasourceConstructor } from "../../config/datasource"
import bcrypt from "bcrypt"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime"
import { Context } from "../../config/context"

export class UserDataSource extends DataSource implements CrudDataSource {
  context?: Context
  prisma: PrismaClient

  constructor({ prisma }: DatasourceConstructor) {
    super()
    if (!prisma) throw new ApolloError("Persistent client cannot be null")
    this.prisma = prisma
  }

  initialize(config: DataSourceConfig<Context>): void | Promise<void> {
    this.context = config.context
  }

  async getMany(): Promise<User[]> {
    const result: PrismaUser[] = await this.prisma.user.findMany()
    return result.map((u) => ({
      id: u.id,
      role: u.role,
      email: u.email,
      name: u.name,
    }))
  }

  async getOne(id: string): Promise<User> {
    return await this.prisma.user.findUnique({
      where: {
        id,
      },
      rejectOnNotFound: () =>
        new UserInputError(`User with id:${id} not found`),
    })
  }

  async getOneByEmailAndPassword(
    email: string,
    password: string
  ): Promise<User> {
    let user: PrismaUser | null
    try {
      user = await this.prisma.user.findFirst({
        where: {
          email,
        },
      })
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        const num = parseInt(e.code.substring(1))
        if (num >= 1000 && num <= 1011)
          throw new ApolloError("Cannot reach the database at the moment")
        if (e.code == "P1012") throw new UserInputError("User not found")
        else throw new ApolloError("Error creating new user: " + e.message)
      } else {
        throw new ApolloError("Error connecting to the database")
      }
    }

    if (!user) {
      throw new UserInputError("User not found")
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      throw new UserInputError("Incorrect Username / Password")
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user?.role,
    } as User
  }

  async createOne(
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    let user: PrismaUser
    const hashPassword = await bcrypt.hash(password, 10)

    try {
      user = await this.prisma.user.create({
        data: {
          email,
          name,
          password: hashPassword,
        },
      })
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        const num = parseInt(e.code.substring(1))
        if (num >= 1000 && num <= 1011)
          throw new ApolloError("Cannot reach the database at the moment")
        throw new ApolloError("Error creating new user: " + e.message)
      } else {
        throw new ApolloError("Error connecting to the database")
      }
    }

    return {
      email: user.email,
      id: user.id,
      role: user.role,
    } as User
  }

  async updateOne(
    id: string,
    email: string,
    password: string,
    name: string
  ): Promise<User> {
    try {
      const hashed = await bcrypt.hash(password, 10)
      return await this.prisma.user.update({
        where: { id },
        data: {
          email,
          name,
          password: hashed,
        },
      })
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        const num = parseInt(e.code.substring(1))
        if (num >= 1000 && num <= 1011)
          throw new ApolloError("Cannot reach the database at the moment")
        throw new ApolloError("Error updating user: " + e.message)
      } else {
        throw new ApolloError("Error connecting to the database")
      }
    }
  }

  async deleteOne(id: string): Promise<User> {
    try {
      return this.prisma.user.delete({
        where: {
          id,
        },
      })
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        const num = parseInt(e.code.substring(1))
        if (num >= 1000 && num <= 1011)
          throw new ApolloError("Cannot reach the database at the moment")
        throw new ApolloError("Error deleting user: " + e.message)
      } else {
        throw new ApolloError("Error connecting to the database")
      }
    }
  }
}
