import { Transaction, TransactionType } from "@prisma/client"
import {
  createMockContext,
  MockContext,
} from "../../../config/prisma/testClient"
import { TransactionDataSource } from "../../../graphql"

let mockCtx: MockContext
let transactionDataSource: TransactionDataSource

beforeAll(() => {
  mockCtx = createMockContext()
  transactionDataSource = new TransactionDataSource({ prisma: mockCtx.prisma })
})

beforeEach(() => {
  jest
    .spyOn(TransactionDataSource.prototype as any, "getUserId")
    .mockImplementation(() => "123")
})

describe("buy", () => {
  it("should return transaction details", async () => {
    const mockTransaction: Transaction = {
      amount: -1,
      id: "1",
      symbol: "ABC",
      timestamp: new Date(Date.now()),
      type: TransactionType.BUY,
      userId: "123",
    }

    mockCtx.prisma.transaction.create.mockResolvedValue(mockTransaction)

    const returnedTransaction = await transactionDataSource.buy(1, "ABC")

    expect(returnedTransaction.id).toBe(mockTransaction.id)
  })

  // TODO: it("should throw if symbol is invalid")
})

describe("sell", () => {
  it("should return transaction details", async () => {
    const mockTransaction: Transaction = {
      amount: 1,
      id: "1",
      symbol: "ABC",
      timestamp: new Date(Date.now()),
      type: TransactionType.SELL,
      userId: "123",
    }

    mockCtx.prisma.transaction.create.mockResolvedValue(mockTransaction)

    const returnedTransaction = await transactionDataSource.sell(1, "ABC")

    expect(returnedTransaction.id).toBe(mockTransaction.id)
  })

  // TODO: it("should throw if symbol is invalid")
})

describe("deposit", () => {
  it("should return transaction details", async () => {
    const mockTransaction: Transaction = {
      amount: 1,
      id: "1",
      symbol: "PHP",
      timestamp: new Date(Date.now()),
      type: TransactionType.DEPOSIT,
      userId: "123",
    }

    mockCtx.prisma.transaction.create.mockResolvedValue(mockTransaction)

    const returnedTransaction = await transactionDataSource.deposit(1)

    expect(returnedTransaction.id).toBe(mockTransaction.id)
  })

  //   it("should throw if symbol is invalid", async () => {})
})

describe("withdraw", () => {
  it("should return transaction details", async () => {
    const mockTransaction: Transaction = {
      amount: -1,
      id: "1",
      symbol: "PHP",
      timestamp: new Date(Date.now()),
      type: TransactionType.WITHDRAW,
      userId: "123",
    }

    mockCtx.prisma.transaction.create.mockResolvedValue(mockTransaction)

    const returnedTransaction = await transactionDataSource.withdraw(1)

    expect(returnedTransaction.id).toBe(mockTransaction.id)
  })

  // TODO: it("should throw if symbol is invalid")
})
