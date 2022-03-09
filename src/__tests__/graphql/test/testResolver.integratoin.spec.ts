import { Role, User } from "@prisma/client"
import request, { Response } from "supertest"
import { createApolloServer } from "../../.."
import {
  createMockContext,
  MockContext,
} from "../../../config/prisma/testClient"
import { createAccessToken } from "../../../vendor/victoriris/authUtil"
import { Express } from "express"

let app: Express

beforeAll(() => {
  app = createApolloServer().app
})

describe("test", () => {
  it("should return a string", async () => {
    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .set("Authorization", "Bearer " + createAccessToken({ userId: "123" }))
      .send({
        query: `
          query Test {
            test
          }
        `,
      })

    const result = JSON.parse(response.text)

    expect(result.data.test).toBe("Yes im alive")
  })
})
