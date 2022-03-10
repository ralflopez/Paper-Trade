import {
  createMockContext,
  MockContext,
} from "../../../config/prisma/testClient"
import { Context } from "../../../config/context"
import { UserDataSource } from "../../../graphql/user/userDataSource"
import { DataSourceConfig } from "apollo-datasource"
import { User as PrismaUser } from "@prisma/client"
import bcrypt from "bcrypt"
import { UserInputError } from "apollo-server-errors"
import { SignupInput } from "../../../graphql/auth/auth-type"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime"

// Mock an entire module: https://stackoverflow.com/questions/55198790/mock-an-entire-module-with-jest-in-javascript
// Testing modules example: https://www.strv.com/blog/quickest-simplest-way-mocking-module-dependencies-jest-engineering
jest.mock("bcrypt")

let mockCtx: MockContext
let ctx: Context
let userDateSource: UserDataSource

let mockBcryptCompare: jest.Mock

beforeEach(() => {
  mockCtx = createMockContext()
  ctx = mockCtx as unknown as Context
  userDateSource = new UserDataSource({ prisma: mockCtx.prisma })
  userDateSource.initialize({ context: ctx } as DataSourceConfig<any>)
  mockBcryptCompare = bcrypt.compare as jest.Mock
})

describe("getMany user", () => {
  it("should return all users", async () => {
    const mockUsers: PrismaUser[] = [
      {
        id: "123",
        name: "name",
        role: "USER",
        email: "test1@email.com",
        password: "password",
        updatedAt: new Date(Date.now()),
        createdAt: new Date(Date.now()),
      },
      {
        id: "124",
        name: "name",
        role: "USER",
        email: "test2@email.com",
        password: "password",
        updatedAt: new Date(Date.now()),
        createdAt: new Date(Date.now()),
      },
      {
        id: "126",
        name: "name",
        role: "USER",
        email: "test3@email.com",
        password: "password",
        updatedAt: new Date(Date.now()),
        createdAt: new Date(Date.now()),
      },
    ]

    mockCtx.prisma.user.findMany.mockResolvedValue(mockUsers)

    const returnedUsers = await userDateSource.getMany()
    expect(returnedUsers.length).toBeGreaterThanOrEqual(3)
  })
})

describe("getOne user", () => {
  it("should return the user", async () => {
    const mockUser: PrismaUser = {
      id: "123",
      name: "name",
      email: "test1@email.com",
      role: "USER",
      createdAt: new Date(Date.now()),
      password: "password",
      updatedAt: new Date(Date.now()),
    }

    mockCtx.prisma.user.findUnique.mockResolvedValue(mockUser)

    const returnedUser = await userDateSource.getOne("123")

    expect(returnedUser.id).toBe(mockUser.id)
  })

  it("should throw if user is not found", async () => {
    const id = "123"
    mockCtx.prisma.user.findUnique.mockRejectedValue(
      new UserInputError(`User with id:${id} not found`)
    )

    await expect(userDateSource.getOne(id)).rejects.toEqual(
      new UserInputError("User with id:123 not found")
    )
  })
})

describe("getOneByEmailAndPassword", () => {
  it("should return a user", async () => {
    const mockUser: PrismaUser = {
      id: "123",
      name: "name",
      role: "USER",
      email: "test1@email.com",
      password: "password",
      updatedAt: new Date(Date.now()),
      createdAt: new Date(Date.now()),
    }

    // const mockBcryptCompare = jest.spyOn(bcrypt, 'compare')

    mockCtx.prisma.user.findFirst.mockResolvedValue(mockUser)
    mockBcryptCompare.mockResolvedValue(true)

    const returnedUser = await userDateSource.getOneByEmailAndPassword(
      "test1@gmail.com",
      "password"
    )
    expect(returnedUser.id).toBe(mockUser.id)
  })

  it("should throw if password doesn't match", async () => {
    const email = "test1@email.com"
    const password = "wrongPassword"
    const mockUser: PrismaUser = {
      id: "123",
      role: "USER",
      name: "name",
      email: "test1@email.com",
      password: "password",
      updatedAt: new Date(Date.now()),
      createdAt: new Date(Date.now()),
    }

    mockCtx.prisma.user.findFirst.mockResolvedValue(mockUser)
    mockBcryptCompare.mockResolvedValue(false)

    await expect(
      userDateSource.getOneByEmailAndPassword(email, password)
    ).rejects.toEqual(new UserInputError("Incorrect Username / Password"))
  })
})

describe("createOne User", () => {
  it("should return a created user", async () => {
    const mockUser: PrismaUser = {
      id: "123",
      name: "name",
      role: "USER",
      email: "test1@email.com",
      password: "password",
      updatedAt: new Date(Date.now()),
      createdAt: new Date(Date.now()),
    }

    mockCtx.prisma.user.create.mockResolvedValue(mockUser)

    const returnedUser = await userDateSource.createOne(
      "test1@email.com",
      "password",
      "name"
    )

    expect(returnedUser.id).toBe(mockUser.id)
  })

  it("should throw if user already exists", async () => {
    const signupInput: SignupInput = {
      name: "name",
      email: "test@email.com",
      password: "password",
      repeatPassword: "password",
    }

    mockCtx.prisma.user.create.mockRejectedValueOnce(
      new PrismaClientKnownRequestError("message", "P2002", "x")
    )

    await expect(
      userDateSource.createOne("test@email.com", "password", "name")
    ).rejects.toEqual(new UserInputError("User already exists"))
  })
})

describe("updateOne User", () => {
  it("should return a user", async () => {
    const mockUser: PrismaUser = {
      id: "123",
      name: "name",
      role: "USER",
      email: "test1@email.com",
      password: "password",
      updatedAt: new Date(Date.now()),
      createdAt: new Date(Date.now()),
    }

    mockCtx.prisma.user.update.mockResolvedValue(mockUser)

    const returnedUser = await userDateSource.updateOne(
      "123",
      "test1@email.com",
      "password",
      "name"
    )

    expect(returnedUser.id).toBe(mockUser.id)
  })
})

describe("deleteOne User", () => {
  it("should return a user", async () => {
    const mockUser: PrismaUser = {
      id: "123",
      name: "name",
      role: "USER",
      email: "test1@email.com",
      password: "password",
      updatedAt: new Date(Date.now()),
      createdAt: new Date(Date.now()),
    }

    mockCtx.prisma.user.delete.mockResolvedValue(mockUser)

    const returnedUser = await userDateSource.deleteOne("123")

    expect(returnedUser.id).toBe(mockUser.id)
  })
})
