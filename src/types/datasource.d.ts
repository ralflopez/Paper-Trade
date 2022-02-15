import { PrismaClient } from "@prisma/client"
import { UserDataSource } from "../graphql/user/userDataSource"

export type DatasourceConstructor = {
  prisma: PrismaClient
}

export interface IDateSources {
  user: UserDataSource
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
