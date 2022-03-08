import { Express } from "express"
import { createApolloServer } from "../../../index"
import request, { Response } from "supertest"
import { createAccessToken } from "../../../vendor/victoriris/authUtil"
import { TransactionDataSource } from "../../../graphql"
import { CoinCapIoDataSource } from "../../../services/coinCapIo/coinCapIoDataSource"
import { createContext } from "../../../config/context"
import { AssetType, Transaction, TransactionType } from "@prisma/client"

jest.mock("../../../config/context", () => ({
  ...jest.requireActual("../../../config/context"),
  createContext: jest.fn(),
}))

let app: Express
let userId: string
let transactionDataSource: TransactionDataSource
let coinCapIoDataSource: CoinCapIoDataSource

jest.setTimeout(10000)

beforeAll(async () => {
  const { app: expressApp } = createApolloServer()
  app = expressApp
})

beforeAll(() => {
  transactionDataSource = new TransactionDataSource({ prisma: {} as any })
  coinCapIoDataSource = new CoinCapIoDataSource({ redisClient: {} as any })
  ;(createContext as any).mockResolvedValue({
    user: { id: "123" },
    dataSources: {
      coinCapIo: coinCapIoDataSource,
      transaction: transactionDataSource,
    },
  })
})

describe("buy", () => {
  it("should return the correct data", async () => {
    coinCapIoDataSource.getAsset = jest.fn().mockResolvedValue({
      id: "bitcoin",
      rank: "1",
      symbol: "BTC",
      name: "Bitcoin",
      supply: "18977362.0000000000000000",
      maxSupply: "21000000.0000000000000000",
      marketCapUsd: "738609479365.0710107161781780",
      volumeUsd24Hr: "14494859551.1954554049017945",
      priceUsd: "38920.5559426579421690",
      changePercent24Hr: "1.6550215183754409",
      vwap24Hr: "38630.9866031708526347",
      explorer: "https://blockchain.info/",
    })

    transactionDataSource.getMyPortfolio = jest.fn().mockResolvedValue({
      buyingPower: 100,
      assetAllocation: [],
    })

    transactionDataSource.buy = jest.fn().mockResolvedValue({
      amount: -100,
      assetId: "bitcoin",
      assetType: AssetType.CRYPTO,
      id: "1234",
      symbol: "BTC",
      timestamp: new Date(Date.now()),
      type: TransactionType.BUY,
      userId: "123",
    } as Transaction)

    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + createAccessToken({ userId }))
      .send({
        query: `
          mutation Buy($amount: Float!, $assetId: String!) {
            buy(amount: $amount, assetId: $assetId) {
              amount
              assetId
              userId
            }
          }
        `,
        variables: {
          amount: 100,
          assetId: "bitcoin",
        },
      })

    const result = JSON.parse(response.text)

    expect(result.errors).toBeUndefined()
    expect(result.data.buy).toEqual(
      expect.objectContaining({
        amount: -100,
        assetId: "bitcoin",
        userId: "123",
      })
    )
  })
})

describe("sell", () => {
  it("should return the correct data", async () => {
    coinCapIoDataSource.getAsset = jest.fn().mockResolvedValue({
      id: "bitcoin",
      rank: "1",
      symbol: "BTC",
      name: "Bitcoin",
      supply: "18977362.0000000000000000",
      maxSupply: "21000000.0000000000000000",
      marketCapUsd: "738609479365.0710107161781780",
      volumeUsd24Hr: "14494859551.1954554049017945",
      priceUsd: "38920.5559426579421690",
      changePercent24Hr: "1.6550215183754409",
      vwap24Hr: "38630.9866031708526347",
      explorer: "https://blockchain.info/",
    })

    transactionDataSource.getMyPortfolio = jest.fn().mockResolvedValue({
      buyingPower: 100,
      assetAllocation: [{ symbol: "BTC", assetId: "bitcoin", total: 100 }],
    })

    const a: any = jest.fn()
    const b: any = (a.assetAllocation = jest.fn())
    b.find = jest.fn().mockReturnValue({
      assetId: "bitcoin",
      symbol: "BTC",
      total: 100,
    } as AssetAllocation)

    transactionDataSource.sell = jest.fn().mockResolvedValue({
      amount: 100,
      assetId: "bitcoin",
      assetType: AssetType.CRYPTO,
      id: "1234",
      symbol: "BTC",
      timestamp: new Date(Date.now()),
      type: TransactionType.BUY,
      userId: "123",
    } as Transaction)

    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + createAccessToken({ userId }))
      .send({
        query: `
          mutation Sell($amount: Float!, $assetId: String!) {
            sell(amount: $amount, assetId: $assetId) {
              amount
              assetId
              userId
            }
          }
        `,
        variables: {
          amount: 100,
          assetId: "bitcoin",
        },
      })

    const result = JSON.parse(response.text)
    expect(result.errors).toBeUndefined()
    expect(result.data.sell).toEqual(
      expect.objectContaining({
        amount: 100,
        assetId: "bitcoin",
        userId: "123",
      })
    )
  })
})

describe("deposit", () => {
  it("should return the correct data", async () => {
    transactionDataSource.deposit = jest.fn().mockResolvedValue({
      amount: 100,
      assetId: "united-states-dollar",
      assetType: AssetType.FIAT,
      id: "1234",
      symbol: "USD",
      timestamp: new Date(Date.now()),
      type: TransactionType.DEPOSIT,
      userId: "123",
    } as Transaction)

    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + createAccessToken({ userId }))
      .send({
        query: `
          mutation Deposit($amount: Float!) {
            deposit(amount: $amount) {
              amount
              assetId
              userId
            }
          }
        `,
        variables: {
          amount: 100,
          assetId: "united-states-dollar",
        },
      })

    const result = JSON.parse(response.text)

    expect(result.errors).toBeUndefined()
    expect(result.data.deposit).toEqual(
      expect.objectContaining({
        amount: 100,
        assetId: "united-states-dollar",
        userId: "123",
      })
    )
  })
})

describe("withdraw", () => {
  it("should return the correct data", async () => {
    transactionDataSource.withdraw = jest.fn().mockResolvedValue({
      amount: -100,
      assetId: "united-states-dollar",
      assetType: AssetType.FIAT,
      id: "1234",
      symbol: "USD",
      timestamp: new Date(Date.now()),
      type: TransactionType.WITHDRAW,
      userId: "123",
    } as Transaction)

    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + createAccessToken({ userId }))
      .send({
        query: `
          mutation Withdraw($amount: Float!) {
            withdraw(amount: $amount) {
              amount
              assetId
              userId
            }
          }
        `,
        variables: {
          amount: 100,
          assetId: "united-states-dollar",
        },
      })

    const result = JSON.parse(response.text)

    expect(result.errors).toBeUndefined()
    expect(result.data.withdraw).toEqual(
      expect.objectContaining({
        amount: -100,
        assetId: "united-states-dollar",
        userId: "123",
      })
    )
  })
})

describe("transactions", () => {
  it("should return the correct data", async () => {
    transactionDataSource.getMyTransactions = jest.fn().mockResolvedValue([
      {
        amount: 100000,
        assetId: "united-states-dollar",
        assetType: AssetType.FIAT,
        id: "1234",
        symbol: "USD",
        timestamp: new Date(Date.now()),
        type: TransactionType.DEPOSIT,
        userId: "123",
      },
      {
        amount: 100,
        assetId: "bitcoin",
        assetType: AssetType.CRYPTO,
        id: "12345",
        symbol: "BTC",
        timestamp: new Date(Date.now()),
        type: TransactionType.BUY,
        userId: "123",
      },
      {
        amount: 1000,
        assetId: "united-states-dollar",
        assetType: AssetType.FIAT,
        id: "1234",
        symbol: "USD",
        timestamp: new Date(Date.now()),
        type: TransactionType.WITHDRAW,
        userId: "123",
      },
    ] as Transaction[])

    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + createAccessToken({ userId }))
      .send({
        query: `
          query Transactions {
            transactions {
              amount
              assetId
              userId  
            }
          }
        `,
      })

    const result = JSON.parse(response.text)

    expect(result.erros).toBeUndefined()
    expect(result.data.transactions.length).toBe(3)
    expect(result.data.transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          amount: 1000,
          assetId: "united-states-dollar",
          userId: "123",
        }),
      ])
    )
  })
})

describe("transactions", () => {
  it("should return the correct data", async () => {
    transactionDataSource.getMyPortfolio = jest.fn().mockResolvedValue({
      buyingPower: 100,
      assetAllocation: [
        {
          assetId: "bitcoin",
          symbol: "BTC",
          total: 10,
        },
        {
          assetId: "etherium",
          symbol: "ETH",
          total: 1,
        },
      ],
    } as TransactionPortfolio)

    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + createAccessToken({ userId }))
      .send({
        query: `
          query MyPortfolio {
            myPortfolio {
              buyingPower
              assetAllocation {
                symbol
                total
              }
            }
          }
        `,
      })

    const result = JSON.parse(response.text)

    expect(result.erros).toBeUndefined()
    expect(result.data.myPortfolio).toEqual(
      expect.objectContaining({
        buyingPower: 100,
      })
    )
  })
})
