import { HTTPCache, RESTDataSource } from "apollo-datasource-rest"
import { ApolloError } from "apollo-server-errors"
import { RedisClient } from "../../config/redis/client"

export class CoinCapIoDataSource extends RESTDataSource {
  private redisClient: RedisClient

  constructor({ redisClient }: { redisClient: RedisClient }) {
    super()
    this.baseURL = "https://api.coincap.io/v2/"
    this.httpCache = new HTTPCache()
    this.redisClient = redisClient
  }

  throwFailError() {
    throw new ApolloError("[Coin Cap] Failed to retrieve data from the server")
  }

  async getAllAssets(): Promise<CoinCapIo_Asset[] | undefined | null> {
    // check cache
    const CACHE_KEY = "coincapio.allassets"
    const cacheValue = await this.redisClient.checkCache<CoinCapIo_Asset[]>(
      CACHE_KEY
    )
    if (cacheValue) return cacheValue

    // no cache
    try {
      const result: CoinCapIo_Assets = await this.get("assets")
      await this.redisClient.storeCache(CACHE_KEY, JSON.stringify(result.data))
      return result.data
    } catch (e) {
      this.redisClient.quit()
      this.throwFailError()
    }
  }

  async getAsset(id: string): Promise<CoinCapIo_Asset | undefined> {
    try {
      const response: CoinCapIo_Asset_Result = await this.get(
        this.baseURL + "assets/" + id
      )
      return response.data
    } catch (e) {
      this.throwFailError()
    }
  }

  async getRates(): Promise<CoinCapIo_Rate[] | undefined> {
    try {
      const response: CoinCapIo_Rates = await this.get(this.baseURL + "rates")
      const data: CoinCapIo_Rate[] = response.data.filter(
        (d: any) => d.type === "fiat"
      )
      return data
    } catch (e) {
      this.throwFailError()
    }
  }

  async getRate(id: string): Promise<CoinCapIo_Rate | undefined> {
    try {
      const response: CoinCapIo_Rate_Result = await this.get(
        this.baseURL + "rates/" + id
      )
      return response.data
    } catch (e) {
      this.throwFailError()
    }
  }
}
