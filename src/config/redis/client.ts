import { createClient, RedisClientType } from "redis"
import dotenv from "dotenv"
dotenv.config()

export class RedisClient {
  client: RedisClientType
  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    })

    this.client.on("error", (err) => {
      console.log("Redis Client Error", err)
    })
  }

  quit() {
    this.client.quit()
  }

  async checkCache<ReturnType>(key: string): Promise<ReturnType | null> {
    let parsedValue: ReturnType | null = null

    try {
      await this.client.connect()
      const cacheValue = await this.client.get(key)
      if (cacheValue) parsedValue = JSON.parse(cacheValue) as ReturnType
    } finally {
      await this.client.quit()
    }

    return parsedValue
  }

  async storeCache(key: string, value: string) {
    try {
      await this.client.connect()
      await this.client.set(key, value)
    } finally {
      await this.client.quit()
    }
  }
}

export const redisClient = new RedisClient()
