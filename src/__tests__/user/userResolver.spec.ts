import { Express } from "express"
import { createApolloServer } from "../../../index"
import request, { Response, Test } from "supertest"
import { prisma } from "../../../config/prisma/client"
import { createAccessToken } from "../../../vendor/victoriris/authUtil"
import { Role } from "@prisma/client"

let app: Express
let validId: string

beforeAll(async () => {
  const { app: expressApp } = createApolloServer()
  app = expressApp

  const mockUser = await prisma.user.create({
    data: {
      name: "name",
      email: "test123@email.com",
      password: "password",
      role: Role.ADMIN,
    },
  })

  validId = mockUser.id
})

afterAll(async () => {
  await prisma.user.delete({
    where: {
      id: validId,
    },
  })
})

describe("QUERY: getUsers", () => {
  it("should return a list of users if you are admin", async () => {
    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + createAccessToken({ userId: validId }))
      .send({
        query: "query { getUsers { id } }",
      })

    const result = JSON.parse(response.text)
    let data = null
    let errors = null

    if (result.data) {
      data = result.data.getUsers
    } else {
      errors = result.errors
    }
    expect(errors).toBeNull()
    expect(data).toBeInstanceOf(Array)
    expect(data?.length).toBeGreaterThanOrEqual(1)
    expect(data).toContainEqual({ id: validId })
  })

  it("should return an unauthorised error if user is not admin", async () => {
    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + createAccessToken({ userId: "124" }))
      .send({
        query: "query { getUsers { id } }",
      })

    const result = JSON.parse(response.text)

    let data = result?.data?.getUsers
    let errors = result?.errors

    expect(data).toBeFalsy()
    expect(errors.length).toBeGreaterThanOrEqual(1)
  })
})
