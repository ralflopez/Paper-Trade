import { prisma } from "../../../config/prisma/client"
import { TradePortfolioSummary } from "../../../graphql/trade/trade-type"
import { TradeDataSource } from "../../../graphql/trade/tradeDataSource"

let tradeDataSource: TradeDataSource

beforeAll(async () => {
  tradeDataSource = new TradeDataSource({ prisma })
  await prisma.user.create({
    data: {
      email: "test@email.com",
      password: "password",
      id: "123",
    },
  })

  await prisma.trade.createMany({
    data: [
      {
        amount: 20,
        value: 5,
        coinId: "bitcoin",
        type: "BUY",
        userId: "123",
        id: "test1",
      },
      {
        amount: -5,
        value: 3,
        coinId: "bitcoin",
        type: "SELL",
        userId: "123",
        id: "test2",
      },
      {
        amount: 10,
        value: 2,
        coinId: "bitcoin",
        type: "BUY",
        userId: "123",
        id: "test3",
      },
      {
        amount: -2,
        value: 1,
        coinId: "bitcoin",
        type: "SELL",
        userId: "123",
        id: "test4",
      },
    ],
  })
})

afterAll(async () => {
  await prisma.trade.deleteMany()
  await prisma.user.deleteMany()
})

describe("getPortfolio", () => {
  it("should return the right amount of asset allocation", async () => {
    const returnedTrades: TradePortfolioSummary[] =
      await tradeDataSource.getPortfolio("123")
    expect(returnedTrades).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ amount: 23, coinId: "bitcoin" }),
      ])
    )
  })
})
