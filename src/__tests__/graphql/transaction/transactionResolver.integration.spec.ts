import { Express } from "express"
import { createApolloServer } from "../../../index"
import { prisma } from "../../../config/prisma/client"
import { Role } from "@prisma/client"
import request, { Response } from "supertest"
import { createAccessToken } from "../../../vendor/victoriris/authUtil"

let app: Express
let userId: string

jest.setTimeout(10000)

beforeAll(async () => {
  const { app: expressApp } = createApolloServer()
  app = expressApp

  const mockUser = await prisma.user.create({
    data: {
      name: "name",
      email: "test123@email.com",
      password: "password",
      role: Role.USER,
    },
  })

  userId = mockUser.id
})

afterAll(async () => {
  await prisma.transaction.deleteMany()
  await prisma.user.deleteMany()
})

describe("buy", () => {
  it("should return the correct data", async () => {
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
      expect.objectContaining({ amount: -100, assetId: "bitcoin", userId })
    )
  })
})

describe("sell", () => {
  it("should return the correct data", async () => {
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
      expect.objectContaining({ amount: 100, assetId: "bitcoin", userId })
    )
  })
})

describe("withdraw", () => {
  it("should return the correct data", async () => {
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
          amount: 1000,
        },
      })

    const result = JSON.parse(response.text)

    expect(result.errors).toBeUndefined()
    expect(result.data.withdraw).toEqual(
      expect.objectContaining({
        amount: -1000,
        assetId: "united-states-dollar",
        userId,
      })
    )
  })
})

describe("deposit", () => {
  it("should return the correct data", async () => {
    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + createAccessToken({ userId }))
      .send({
        query: `
          mutation Withdraw($amount: Float!) {
            deposit(amount: $amount) {
              amount
              assetId
              userId  
            }
          }
        `,
        variables: {
          amount: 1000,
        },
      })

    const result = JSON.parse(response.text)

    expect(result.errors).toBeUndefined()
    expect(result.data.deposit).toEqual(
      expect.objectContaining({
        amount: 1000,
        assetId: "united-states-dollar",
        userId,
      })
    )
  })
})
