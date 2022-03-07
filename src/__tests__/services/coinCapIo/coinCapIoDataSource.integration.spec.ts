import { redisClient } from "../../../config/redis/client"
import { CoinCapIoDataSource } from "../../../services/coinCapIo/coinCapIoDataSource"

let coinCapIoDataSource: CoinCapIoDataSource

beforeAll(() => {
  coinCapIoDataSource = new CoinCapIoDataSource({ redisClient })
})

describe("getAllAssets", () => {
  it("should return details", async () => {
    const result = await coinCapIoDataSource.getAllAssets()
    console.log(result)
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
})
