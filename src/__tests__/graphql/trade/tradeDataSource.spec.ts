import {
  MockContext,
  createMockContext,
} from "../../../config/prisma/testClient"
import { TradeDataSource } from "../../../graphql/trade/tradeDataSource"
import { Trade, TradeType } from "@prisma/client"

let mockCtx: MockContext
let tradeDataSource: TradeDataSource

beforeAll(() => {
  mockCtx = createMockContext()
  tradeDataSource = new TradeDataSource({ prisma: mockCtx.prisma })
})

describe("getOne trade", () => {
  it("should return a trade", async () => {
    const mockTrade: Trade = {
      amount: 1,
      value: 1,
      coinId: "bitcoin",
      id: "1",
      timestamp: new Date(Date.now()),
      type: TradeType.BUY,
      userId: "1234",
    }

    mockCtx.prisma.trade.findUnique.mockResolvedValue(mockTrade)

    const returnedTrade = await tradeDataSource.getOne("1")
    expect(returnedTrade.id).toBe(mockTrade.id)
  })
})

describe("createOne trade", () => {
  it("should return the created user", async () => {
    const mockTrade: Trade = {
      amount: 1,
      value: 1,
      coinId: "bitcoin",
      id: "1",
      timestamp: new Date(Date.now()),
      type: TradeType.BUY,
      userId: "1234",
    }

    mockCtx.prisma.trade.create.mockResolvedValue(mockTrade)

    const returnedTrade = await tradeDataSource.createOne(
      1,
      1,
      "1",
      "BUY",
      "123"
    )
    expect(returnedTrade.id).toBe(mockTrade.id)
  })
})

describe("getMany trade of current user", () => {
  it("should return an array of all trades", async () => {
    const mockTrades: Trade[] = [
      {
        amount: 1,
        value: 1,
        coinId: "bitcoin",
        id: "1",
        timestamp: new Date(Date.now()),
        type: TradeType.BUY,
        userId: "1234",
      },
      {
        amount: 1,
        value: 1,
        coinId: "bitcoin",
        id: "12",
        timestamp: new Date(Date.now()),
        type: TradeType.BUY,
        userId: "1234",
      },
    ]

    mockCtx.prisma.trade.findMany.mockResolvedValue(mockTrades)

    const returnedTrades = await tradeDataSource.getAll("1234")

    expect(returnedTrades).toBeInstanceOf(Array)
    expect(returnedTrades).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "1" }),
        expect.objectContaining({ id: "12" }),
      ])
    )
  })
})
