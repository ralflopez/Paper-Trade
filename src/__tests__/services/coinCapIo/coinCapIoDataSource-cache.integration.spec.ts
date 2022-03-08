import { RedisClient, redisClient } from "../../../config/redis/client"
import { CoinCapIoDataSource } from "../../../services/coinCapIo/coinCapIoDataSource"

let coinCapIoDataSource: CoinCapIoDataSource

beforeAll(async () => {
  coinCapIoDataSource = new CoinCapIoDataSource({ redisClient })
})

beforeEach(async () => {
  // refresh db
  await redisClient.client.connect()
  await redisClient.client.flushDb()
  await redisClient.client.quit()
})

describe("getAllAssets", () => {
  it("should save the correct value in cache", async () => {
    const CACHE_KEY = "coincapio.allassets"
    const mockAssets: CoinCapIo_Assets = {
      data: [
        {
          id: "abc",
          rank: "abc",
          symbol: "abc",
          name: "abc",
          supply: "abc",
          maxSupply: "abc",
          marketCapUsd: "abc",
          volumeUsd24Hr: "abc",
          priceUsd: "abc",
          changePercent24Hr: "abc",
          vwap24Hr: "abc",
          explorer: "abc",
        },
      ],
      timestamp: "123",
    }

    jest
      .spyOn(RedisClient.prototype as any, "checkCache")
      .mockResolvedValueOnce(null)

    jest
      .spyOn(CoinCapIoDataSource.prototype as any, "get")
      .mockReturnValue(mockAssets)

    await coinCapIoDataSource.getAllAssets()
    const cacheValue = await redisClient.checkCache<CoinCapIo_Asset>(CACHE_KEY)

    expect(cacheValue).toBeDefined()
    expect(Array.isArray(cacheValue)).toBeTruthy()
    expect(cacheValue).toEqual(
      expect.arrayContaining([expect.objectContaining(mockAssets.data[0])])
    )
  })

  it("should return the value in cache if it exists", async () => {
    const CACHE_KEY = "coincapio.allassets"
    const mockAssets: CoinCapIo_Assets = {
      data: [
        {
          id: "abc",
          rank: "abc",
          symbol: "abc",
          name: "abc",
          supply: "abc",
          maxSupply: "abc",
          marketCapUsd: "abc",
          volumeUsd24Hr: "abc",
          priceUsd: "abc",
          changePercent24Hr: "abc",
          vwap24Hr: "abc",
          explorer: "abc",
        },
      ],
      timestamp: "123",
    }

    await redisClient.storeCache(CACHE_KEY, JSON.stringify(mockAssets.data))

    const result = await coinCapIoDataSource.getAllAssets()

    expect(result).toBeTruthy()
    expect((CoinCapIoDataSource.prototype as any).get).not.toHaveBeenCalled()
    expect(Array.isArray(result)).toBeTruthy()
    expect(result).toEqual(
      expect.arrayContaining([expect.objectContaining(mockAssets.data[0])])
    )
  })
})
