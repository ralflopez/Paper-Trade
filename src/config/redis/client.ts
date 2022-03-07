import { RedisClientType } from "@node-redis/client"
import { createClient } from "redis"
export const client: RedisClientType = createClient({
  url: "redis://localhost:6379",
})
client.on("error", (err) => console.log("Redis Client Error", err))

export const withRedisClient = async (
  callback: (client: RedisClientType) => Promise<any>
) => {
  await client.connect()
  return callback(client).then(() => client.quit())
}
