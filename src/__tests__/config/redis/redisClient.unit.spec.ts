import { RedisClient } from "../../../config/redis/client"

let redisClient: RedisClient

beforeAll(() => {
  redisClient = new RedisClient()
})

describe("checkCache", () => {
  it("should return cached value with the right type", async () => {
    interface Type {
      a: string
      b: number
    }

    redisClient.client.connect = jest.fn()
    redisClient.client.quit = jest.fn()
    redisClient.client.get = jest.fn().mockReturnValue('{"a": "hello","b": 1}')

    const result = await redisClient.checkCache<Type>("KEY")

    expect(redisClient.client.connect).toBeCalled()
    expect(redisClient.client.quit).toBeCalled()
    expect(result?.a).toBeDefined()
    expect(typeof result?.a).toBe("string")
    expect(typeof result?.b).toBe("number")
  })

  it("should return null if no cache is found", async () => {
    interface Type {
      a: string
      b: number
    }

    redisClient.client.connect = jest.fn()
    redisClient.client.quit = jest.fn()
    redisClient.client.get = jest.fn().mockReturnValue(null)

    const result = await redisClient.checkCache<Type>("KEY")

    expect(redisClient.client.connect).toBeCalled()
    expect(redisClient.client.quit).toBeCalled()
    expect(result).toBeNull()
  })
})

describe("storeCache", () => {
  it("should call every function", async () => {
    redisClient.client.connect = jest.fn()
    redisClient.client.quit = jest.fn()
    redisClient.client.set = jest.fn()

    await redisClient.storeCache("KEY", "VALUE")

    expect(redisClient.client.connect).toBeCalled()
    expect(redisClient.client.quit).toBeCalled()
    expect(redisClient.client.set).toBeCalledWith("KEY", "VALUE")
  })
})
