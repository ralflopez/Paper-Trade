import { BalanceType } from "@prisma/client"
import { prisma } from "../../../config/prisma/client"
import { BalanceDataSource } from "../../../graphql/balance/balanceDataSource"

let balanceDataSource: BalanceDataSource

beforeAll(async () => {
  balanceDataSource = new BalanceDataSource({ prisma })
  await prisma.user.create({
    data: {
      email: "test@email.com",
      password: "password",
      id: "123",
    },
  })

  await prisma.balance.createMany({
    data: [
      {
        amount: 100,
        type: BalanceType.DEPOSIT,
        userId: "123",
      },
      {
        amount: 100,
        type: BalanceType.DEPOSIT,
        userId: "123",
      },
      {
        amount: 50,
        type: BalanceType.TRADE,
        userId: "123",
      },
      {
        amount: 50,
        type: BalanceType.DEPOSIT,
        userId: "123",
      },
      {
        amount: 10,
        type: BalanceType.UNTRADE,
        userId: "123",
      },
    ],
  })
})

afterAll(async () => {
  await prisma.balance.deleteMany()
  await prisma.user.deleteMany()
})

describe("getPortfolio", () => {
  it("should return the right amount of asset allocation", async () => {
    const result = await balanceDataSource.getTotalCapital("123")
    expect(result).toBeUndefined()
  })
})
