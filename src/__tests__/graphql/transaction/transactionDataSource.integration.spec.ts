/**
 * An integration test between the application and database layer
 */
import { TransactionDataSource } from "../../../graphql/transaction/transactionDataSource"
import { prisma } from "../../../config/prisma/client"
import { AssetType, TransactionType } from "@prisma/client"
import { UserInputError } from "apollo-server-errors"

let transactionDataSource: TransactionDataSource
let userId: string

beforeAll(async () => {
  transactionDataSource = new TransactionDataSource({ prisma })

  // create user
  const user = await prisma.user.create({
    data: {
      email: "test@email.com",
      name: "name",
      password: "password123",
    },
  })

  userId = user.id

  // create transactions
  await prisma.transaction.createMany({
    data: [
      {
        amount: 100000,
        assetId: "united-states-dollar",
        symbol: "USD",
        type: TransactionType.DEPOSIT,
        userId,
        assetType: AssetType.FIAT,
        valueUsd: 1,
      },
      {
        amount: -10,
        assetId: "bitcoin",
        symbol: "BTC",
        type: TransactionType.BUY,
        userId,
        assetType: AssetType.CRYPTO,
        valueUsd: 100,
      },
      {
        amount: -20,
        assetId: "etherium",
        symbol: "ETH",
        type: TransactionType.BUY,
        userId,
        assetType: AssetType.CRYPTO,
        valueUsd: 50,
      },
      {
        amount: -100,
        assetId: "dodgecoin",
        symbol: "DODGE",
        type: TransactionType.BUY,
        userId,
        assetType: AssetType.CRYPTO,
        valueUsd: 1,
      },
      {
        amount: -20000,
        assetId: "united-states-dollar",
        symbol: "USD",
        type: TransactionType.WITHDRAW,
        userId,
        assetType: AssetType.FIAT,
        valueUsd: 1,
      },
      {
        amount: 1,
        assetId: "etherium",
        symbol: "ETH",
        type: TransactionType.SELL,
        userId,
        assetType: AssetType.CRYPTO,
        valueUsd: 40,
      },
      {
        amount: -5,
        assetId: "bitcoin",
        symbol: "BTC",
        type: TransactionType.BUY,
        userId,
        assetType: AssetType.CRYPTO,
        valueUsd: 105,
      },
    ],
  })
})

afterAll(async () => {
  const deleteTransactions = prisma.transaction.deleteMany()
  const deleteUsers = prisma.user.deleteMany()

  await prisma.$transaction([deleteTransactions, deleteUsers])

  await prisma.$disconnect()
})

describe("getMyTransactions", () => {
  it("should return a list", async () => {
    const result = await transactionDataSource.getMyTransactions(userId)

    expect(Array.isArray(result)).toBeTruthy()
  })
})

describe("getMyPortfolio", () => {
  it("prisma should return buying power", async () => {
    const result: BuyingPowerQuery[] =
      await prisma.$queryRaw`SELECT SUM(amount * "valueUsd") FROM "Transaction"`

    expect(result[0].sum).toBe(77415)
  })

  it("prisma should return allocatoin of assets", async () => {
    const result: AssetAllocationQuery =
      await prisma.$queryRaw`SELECT symbol, "assetId", SUM(amount*-1) as total, AVG("valueUsd") as average FROM "Transaction" GROUP BY symbol, "assetId" HAVING SUM(amount*-1) > 0`

    console.log(result)
    expect(result).toBeDefined()
  })

  it("should return the correct data", async () => {
    const result = await transactionDataSource.getMyPortfolio(userId)

    expect(result).toHaveProperty("buyingPower")
    expect(result).toHaveProperty("allocation")
  })
})

describe("getMyTransaction", () => {
  it("should return a list of transactions", async () => {
    const result = await transactionDataSource.getMyTransactions(userId)

    expect(Array.isArray(result)).toBeTruthy()
  })
})

describe("buy", () => {
  it("should return the saved transaction", async () => {
    const result = await transactionDataSource.buy(
      userId,
      1,
      "BTC",
      "bitcoin",
      1000
    )

    expect(result).toHaveProperty("amount", -1)
    expect(result).toHaveProperty("symbol", "BTC")
  })
})

describe("sell", () => {
  it("should return the saved transaction", async () => {
    const result = await transactionDataSource.sell(
      userId,
      1,
      "BTC",
      "bitcoin",
      1000
    )

    expect(result).toHaveProperty("amount", 1)
    expect(result).toHaveProperty("symbol", "BTC")
  })
})

describe("deposit", () => {
  it("should return the saved transaction", async () => {
    const result = await transactionDataSource.deposit(userId, 100)

    expect(result).toHaveProperty("amount", 100)
    expect(result).toHaveProperty("symbol", "USD")
  })
})

describe("withdraw", () => {
  it("should return the saved transaction", async () => {
    const result = await transactionDataSource.withdraw(userId, 100)

    expect(result).toHaveProperty("amount", -100)
    expect(result).toHaveProperty("symbol", "USD")
  })
})
