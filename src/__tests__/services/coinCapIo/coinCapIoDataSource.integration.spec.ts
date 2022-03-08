import { redisClient } from "../../../config/redis/client"
import { CoinCapIoDataSource } from "../../../services/coinCapIo/coinCapIoDataSource"

let coinCapIoDataSource: CoinCapIoDataSource

beforeAll(() => {
  coinCapIoDataSource = new CoinCapIoDataSource({ redisClient })
})

beforeEach(async () => {
  // clear cache
  await redisClient.client.connect()
  await redisClient.client.flushDb()
  await redisClient.client.quit()
})

describe("getAllAssets", () => {
  it("should return details", async () => {
    const result = await coinCapIoDataSource.getAllAssets()
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBeTruthy()
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ symbol: "BTC" })])
    )
  })
})

describe("getAsset", () => {
  it("should return details", async () => {
    const result = await coinCapIoDataSource.getAsset("bitcoin")
    expect(result).toBeDefined()
    expect(result).toEqual(expect.objectContaining({ symbol: "BTC" }))
  })

  it("should return null if asset doesnt exist", async () => {
    const result = await coinCapIoDataSource.getAsset("blahblah")
    expect(result).toBeFalsy()
  })
})

describe("getRates", () => {
  it("should return details", async () => {
    const result = await coinCapIoDataSource.getRates()
    expect(result).toBeDefined()
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining({ symbol: "PHP" })])
    )
  })
})

describe("getRate", () => {
  it("should return details", async () => {
    const result = await coinCapIoDataSource.getRate("philippine-peso")
    expect(result).toBeDefined()
    expect(result).toEqual(expect.objectContaining({ symbol: "PHP" }))
  })

  it("should return null if not found", async () => {
    const result = await coinCapIoDataSource.getRate("blahblah")
    expect(result).toBeFalsy()
  })
})
