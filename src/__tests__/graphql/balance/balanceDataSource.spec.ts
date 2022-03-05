import {
  MockContext,
  createMockContext,
} from "../../../config/prisma/testClient"
import { Balance, BalanceType } from "@prisma/client"
import { BalanceDataSource } from "../../../graphql/balance/balanceDataSource"

let mockCtx: MockContext
let balanceDataSource: BalanceDataSource

beforeAll(() => {
  mockCtx = createMockContext()
  balanceDataSource = new BalanceDataSource({ prisma: mockCtx.prisma })
})

describe("getOne trade", () => {
  it("should return a trade", async () => {
    const mockBalance: Balance = {
      amount: 10,
      id: "1",
      timestamp: new Date(Date.now()),
      type: BalanceType.DEPOSIT,
      userId: "123",
    }

    mockCtx.prisma.balance.findUnique.mockResolvedValue(mockBalance)

    const returnedTrade = await balanceDataSource.getOne("1")
    expect(returnedTrade.id).toBe(mockBalance.id)
  })
})

describe("createOne trade", () => {
  it("should return the created user", async () => {
    const mockBalance: Balance = {
      amount: 10,
      id: "1",
      timestamp: new Date(Date.now()),
      type: BalanceType.DEPOSIT,
      userId: "123",
    }

    mockCtx.prisma.balance.create.mockResolvedValue(mockBalance)

    const returnedTrade = await balanceDataSource.createOne(
      1,
      BalanceType.DEPOSIT,
      "123"
    )
    expect(returnedTrade.id).toBe(mockBalance.id)
  })
})

describe("getMany trade of current user", () => {
  it("should return an array of all trades", async () => {
    const mockBalances: Balance[] = [
      {
        amount: 10,
        id: "1",
        timestamp: new Date(Date.now()),
        type: BalanceType.DEPOSIT,
        userId: "123",
      },
      {
        amount: 10,
        id: "12",
        timestamp: new Date(Date.now()),
        type: BalanceType.DEPOSIT,
        userId: "123",
      },
    ]

    mockCtx.prisma.balance.findMany.mockResolvedValue(mockBalances)

    const returnedTrades = await balanceDataSource.getAll("1234")

    expect(returnedTrades).toBeInstanceOf(Array)
    expect(returnedTrades).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "1" }),
        expect.objectContaining({ id: "12" }),
      ])
    )
  })
})
