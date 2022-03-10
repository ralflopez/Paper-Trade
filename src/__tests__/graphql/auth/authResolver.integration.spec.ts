import { Response } from "supertest"
import { createApolloServer } from "../../.."
import { createContext } from "../../../config/context"
import { UserDataSource } from "../../../graphql/user/userDataSource"
import request from "supertest"
import {
  createAccessToken,
  createTokens,
} from "../../../vendor/victoriris/authUtil"
import { Express } from "express"
import { User } from "@prisma/client"
import { UserInputError } from "apollo-server-errors"

// mock server
let app: Express
beforeAll(() => {
  app = createApolloServer().app
})

// mock creation of tokens
// or const { search } = require.requireMock('./search.js');
jest.mock("../../../vendor/victoriris/authUtil", () => ({
  ...jest.requireActual("../../../vendor/victoriris/authUtil"),
  createTokens: jest.fn().mockResolvedValue({
    accessToken: "accessToken",
    refreshToken: "refreshToken",
  }),
}))

// mock Context
let userDataSource: UserDataSource
let userId = "123"

jest.mock("../../../config/context", () => ({
  ...jest.requireActual("../../../config/context"),
  createContext: jest.fn(),
}))

beforeAll(() => {
  userDataSource = new UserDataSource({ prisma: {} as any })
  ;(createContext as jest.Mock).mockResolvedValue({
    user: { id: userId },
    dataSources: {
      user: userDataSource,
    },
  })
})

describe("signup", () => {
  it("should return an error if email is blank", async () => {
    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .send({
        query: `
            mutation Signup($data: SignupInput!) {
                signup(data: $data) {
                    token
                    user {
                        email
                        id
                    }
                }
            }
          `,
        variables: {
          data: {
            email: "",
            password: "",
            name: "",
          },
        },
      })

    const result = JSON.parse(response.text)

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Invalid Email: " }),
      ])
    )
  })

  it("should return an error if password is less than 8 characters", async () => {
    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .send({
        query: `
            mutation Signup($data: SignupInput!) {
                signup(data: $data) {
                    token
                    user {
                        email
                        id
                    }
                }
            }
          `,
        variables: {
          data: {
            email: "test@email.com",
            password: "pass",
            name: "",
          },
        },
      })

    const result = JSON.parse(response.text)

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          message: "Password must be atleast 8 characters",
        }),
      ])
    )
  })

  it("should return an error if name is blank", async () => {
    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .send({
        query: `
            mutation Signup($data: SignupInput!) {
                signup(data: $data) {
                    token
                    user {
                        email
                        id
                    }
                }
            }
          `,
        variables: {
          data: {
            email: "test@email.com",
            password: "password123",
            name: "",
          },
        },
      })

    const result = JSON.parse(response.text)

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Name cannot be blank" }),
      ])
    )
  })

  it("should return an auth payload if user is created", async () => {
    userDataSource.createOne = jest.fn().mockResolvedValueOnce({
      id: userId,
      email: "test@email.com",
      password: "password123",
      name: "name",
      role: "USER",
      createdAt: new Date(Date.now()),
      updatedAt: new Date(Date.now()),
    } as User)

    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .send({
        query: `
            mutation Signup($data: SignupInput!) {
                signup(data: $data) {
                    token
                    user {
                        email
                        id
                    }
                }
            }
          `,
        variables: {
          data: {
            email: "test@email.com",
            password: "password123",
            name: "name",
          },
        },
      })

    const result = JSON.parse(response.text)

    expect(result.data.signup).toHaveProperty("token")
    expect(result.data.signup).toHaveProperty("user")
  })

  it("should return an error if email is already taken", async () => {
    userDataSource.createOne = jest
      .fn()
      .mockRejectedValueOnce(new UserInputError("User already exists"))

    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .send({
        query: `
          mutation Signup($data: SignupInput!) {
            signup(data: $data) {
              token
              user {
                email
              }
            }
          }
          `,
        variables: {
          data: {
            email: "test@email.com",
            password: "password123",
            name: "name",
          },
        },
      })

    const result = JSON.parse(response.text)

    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "User already exists" }),
      ])
    )
  })
})

describe("login", () => {
  it("should return an error if user doesnt exist", async () => {
    userDataSource.getOneByEmailAndPassword = jest
      .fn()
      .mockRejectedValueOnce(new UserInputError("User not found"))

    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .send({
        query: `
            mutation Login($data: LoginInput!) {
              login(data: $data) {
                token
                user {
                  email
                }
              }
            }
          `,
        variables: {
          data: {
            email: "test@email.com",
            password: "password123",
          },
        },
      })

    const result = JSON.parse(response.text)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "User not found" }),
      ])
    )
  })

  it("should return an error if username and password is incorrect", async () => {
    userDataSource.getOneByEmailAndPassword = jest
      .fn()
      .mockRejectedValueOnce(
        new UserInputError("Incorrect Username / Password")
      )

    const response: Response = await request(app)
      .post("/graphql")
      .set("Content-Type", "application/json")
      .send({
        query: `
            mutation Login($data: LoginInput!) {
              login(data: $data) {
                token
                user {
                  email
                }
              }
            }
          `,
        variables: {
          data: {
            email: "test@email.com",
            password: "password123",
          },
        },
      })

    const result = JSON.parse(response.text)
    expect(result.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ message: "Incorrect Username / Password" }),
      ])
    )
  })
})
