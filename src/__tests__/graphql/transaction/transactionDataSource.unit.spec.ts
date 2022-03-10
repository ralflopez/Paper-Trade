import { AssetType, Transaction, TransactionType } from "@prisma/client"
import { UserInputError } from "apollo-server-errors"
import {
  createMockContext,
  MockContext,
} from "../../../config/prisma/testClient"
import { TransactionDataSource } from "../../../graphql"

let mockCtx: MockContext
let transactionDataSource: TransactionDataSource

const transactionMock: Transaction = {
  amount: 10,
  assetId: "bitcoin",
  assetType: AssetType.CRYPTO,
  id: "1234",
  symbol: "BTC",
  timestamp: new Date(Date.now()),
  type: TransactionType.BUY,
  userId: "123",
  valueUsd: 1000,
}

const transactionMockNegativeAmount: Transaction = {
  ...transactionMock,
  amount: -10,
}

beforeAll(() => {
  console.log(1)
  mockCtx = createMockContext()
  console.log(2)
  transactionDataSource = new TransactionDataSource({ prisma: mockCtx.prisma })
})

describe("buy", () => {
  it("should return the saved transaction", async () => {
    mockCtx.prisma.transaction.create.mockResolvedValue(
      transactionMockNegativeAmount
    )
    const result = await transactionDataSource.buy(
      "123",
      10,
      "BTC",
      "bitcoin",
      1000
    )

    expect(result).toMatchObject(transactionMockNegativeAmount)
  })

  it("should throw if amount is not positive", async () => {
    mockCtx.prisma.transaction.create.mockResolvedValue(transactionMock)
    await expect(
      transactionDataSource.buy("123", -1, "BTC", "bitcoin", 1000)
    ).rejects.toEqual(new UserInputError("Amount cannot be negative"))
  })
})

describe("sell", () => {
  it("should return the saved transaction", async () => {
    mockCtx.prisma.transaction.create.mockResolvedValue(transactionMock)
    const result = await transactionDataSource.sell(
      "123",
      1,
      "BTC",
      "bitcoin",
      1000
    )
    expect(result).toMatchObject(transactionMock)
  })
})

describe("deposit", () => {
  it("should return the saved transaction", async () => {
    mockCtx.prisma.transaction.create.mockResolvedValue(transactionMock)
    const result = await transactionDataSource.deposit("123", 1)
    expect(result).toMatchObject(transactionMock)
  })
})

describe("withdraw", () => {
  it("should return the saved transaction", async () => {
    mockCtx.prisma.transaction.create.mockResolvedValue(
      transactionMockNegativeAmount
    )
    const result = await transactionDataSource.withdraw("123", 1)
    expect(result).toMatchObject(transactionMockNegativeAmount)
  })
})

describe("getMyTransactions", () => {
  it("should return a list of transaction", async () => {
    mockCtx.prisma.transaction.findMany.mockResolvedValue([
      transactionMock,
      transactionMockNegativeAmount,
    ])
    const result = await transactionDataSource.getMyTransactions("123")
    expect(Array.isArray(result)).toBe(true)
  })
})

describe("getMyPortfolio", () => {
  it("should return the portfolio summary", async () => {
    mockCtx.prisma.$queryRaw.mockResolvedValue([
      [{ sum: 100 }],
      [
        {
          assetId: "bitcoin",
          average: 100,
          symbol: "BTC",
          total: 1,
        },
      ],
    ])
    const result = await transactionDataSource.getMyPortfolio("123")
    expect(result).toHaveProperty("buyingPower")
  })
})
