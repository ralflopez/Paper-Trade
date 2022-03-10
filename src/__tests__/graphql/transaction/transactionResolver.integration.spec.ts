/**
 * An integration test between the application and web layer
 */
import { Response } from "supertest"
import {
  createMockContext,
  MockContext,
} from "../../../config/prisma/testClient"
import { TransactionDataSource } from "../../../graphql"
import request from "supertest"
import { Express } from "express"
import { createApolloServer } from "../../.."
import { gql } from "apollo-server-core"
import { CoinCapIoDataSource } from "../../../services/coinCapIo/coinCapIoDataSource"
import { AssetType, Transaction, TransactionType } from "@prisma/client"
import { isAuthenticated } from "../../../graphql/auth/permissions/rules"
import { createContext } from "../../../config/context"

// mock authenticate request
jest.mock("../../../graphql/auth/permissions/rules", () => ({
  ...jest.requireActual("../../../graphql/auth/permissions/rules"),
  isAuthenticated: jest.fn().mockResolvedValue(true),
}))

// mock context
jest.mock("../../../config/context", () => ({
  ...jest.requireActual("../../../config/context"),
  createContext: jest.fn(),
}))

// setup
let app: Express
let transactionDataSource: TransactionDataSource
let coinCapIoDataSource: CoinCapIoDataSource

beforeAll(() => {
  app = createApolloServer().app
  transactionDataSource = new TransactionDataSource({ prisma: {} as any })
  coinCapIoDataSource = new CoinCapIoDataSource({ redisClient: {} as any })
  ;(createContext as jest.Mock).mockResolvedValue({
    user: { id: "123" },
    dataSources: {
      transaction: transactionDataSource,
      coinCapIo: coinCapIoDataSource,
    },
  })
})

// mock objects
const coinCapAssetMock: CoinCapIo_Asset = {
  changePercent24Hr: "1",
  explorer: "1",
  id: "bitcoin",
  marketCapUsd: "1",
  maxSupply: "1",
  name: "bitcoin",
  priceUsd: "1",
  rank: "1",
  supply: "1",
  symbol: "BTC",
  volumeUsd24Hr: "1",
  vwap24Hr: "1",
}

const portfolioSummaryMock: PortfolioSummary = {
  allocation: [{ assetId: "bitcoin", average: 100, symbol: "BTC", total: 999 }],
  buyingPower: 999999,
}

const assetAllocationMock: AssetAllocationQuery = {
  assetId: "bitcoin",
  average: 100,
  symbol: "BTC",
  total: 1,
}

// helpers
function createTransaction(
  assetType: AssetType,
  transactionType: TransactionType
): Transaction {
  return {
    amount:
      transactionType == TransactionType.BUY ||
      transactionType == TransactionType.WITHDRAW
        ? -1
        : 1,
    assetId: assetType == AssetType.CRYPTO ? "bitcoin" : "united-states-dollar",
    assetType,
    id: "id",
    symbol: assetType == AssetType.CRYPTO ? "BTC" : "USD",
    timestamp: new Date(Date.now()),
    type: transactionType,
    userId: "123",
    valueUsd: 1,
  }
}

function createRequest(body: { query: string; variables?: any }) {
  return request(app)
    .post("/graphql")
    .set("Content-Type", "application/json")
    .send(body)
}

// test
describe("buy", () => {
  it("should return the saved transaction", async () => {
    // given
    coinCapIoDataSource.getAsset = jest
      .fn()
      .mockResolvedValueOnce(coinCapAssetMock)
    transactionDataSource.getMyPortfolio = jest
      .fn()
      .mockResolvedValueOnce(portfolioSummaryMock)
    transactionDataSource.buy = jest
      .fn()
      .mockResolvedValueOnce(
        createTransaction(AssetType.CRYPTO, TransactionType.BUY)
      )

    // when
    const response: Response = await createRequest({
      query: `
        mutation Buy($amount: Float!, $assetId: String!) {
          buy(amount: $amount, assetId: $assetId) {
            amount
            symbol
          }
        }
      `,
      variables: {
        amount: 100,
        assetId: "bitcoin",
      },
    })

    // then
    const result = JSON.parse(response.text)

    expect(result.data.buy).toEqual(
      expect.objectContaining({ amount: -1, symbol: "BTC" })
    )
  })
})

describe("sell", () => {
  it("should return the saved transaction", async () => {
    // given
    transactionDataSource.getMyPortfolio = jest
      .fn()
      .mockResolvedValueOnce(portfolioSummaryMock)

    const a: any = jest.fn() // portfolio
    const b: any = (a.allocation = jest.fn()) // .allocation
    b.find = jest.fn().mockReturnValue(assetAllocationMock)

    coinCapIoDataSource.getAsset = jest
      .fn()
      .mockResolvedValueOnce(coinCapAssetMock)

    transactionDataSource.sell = jest
      .fn()
      .mockResolvedValueOnce(
        createTransaction(AssetType.CRYPTO, TransactionType.SELL)
      )

    // when
    const response: Response = await createRequest({
      query: `
        mutation Sell($amount: Float!, $assetId: String!) {
          sell(amount: $amount, assetId: $assetId) {
            amount
            symbol
          }
        }
      `,
      variables: {
        amount: 1,
        assetId: "bitcoin",
      },
    })

    // then
    const result = JSON.parse(response.text)

    expect(result.data.sell).toEqual(
      expect.objectContaining({ amount: 1, symbol: "BTC" })
    )
  })
})

describe("deposit", () => {
  it("should return the saved transaction", async () => {
    // given
    transactionDataSource.deposit = jest
      .fn()
      .mockResolvedValueOnce(
        createTransaction(AssetType.FIAT, TransactionType.DEPOSIT)
      )

    // when
    const response: Response = await createRequest({
      query: `
        mutation Deposit($amount: Float!) {
          deposit(amount: $amount) {
            amount
            symbol
          }
        }
      `,
      variables: {
        amount: 1,
      },
    })

    // then
    const result = JSON.parse(response.text)

    expect(result.data.deposit).toEqual(
      expect.objectContaining({ amount: 1, symbol: "USD" })
    )
  })
})

describe("withdraw", () => {
  it("should return the saved transaction", async () => {
    // given
    transactionDataSource.getMyPortfolio = jest
      .fn()
      .mockResolvedValueOnce(portfolioSummaryMock)

    transactionDataSource.withdraw = jest
      .fn()
      .mockResolvedValueOnce(
        createTransaction(AssetType.FIAT, TransactionType.WITHDRAW)
      )

    // when
    const response: Response = await createRequest({
      query: `
        mutation Withdraw($amount: Float!) {
          withdraw(amount: $amount) {
            amount
            symbol
          }
        }
      `,
      variables: {
        amount: 1,
      },
    })

    // then
    const result = JSON.parse(response.text)

    expect(result.data.withdraw).toEqual(
      expect.objectContaining({ amount: -1, symbol: "USD" })
    )
  })
})
