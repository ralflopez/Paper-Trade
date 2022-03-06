import { DeepMockProxy, mockDeep } from "jest-mock-extended"
import { PrismaClient, Role, User } from "@prisma/client"

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>
  user: Partial<User> | null
}

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>(),
    user: {
      id: "123",
      email: "test@email.com",
      password: "password",
      name: "name",
      createdAt: new Date(Date.now()),
      role: Role.USER,
      updatedAt: new Date(Date.now()),
    },
  }
}
