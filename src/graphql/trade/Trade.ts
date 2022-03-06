import { objectType } from "nexus"
import { Context } from "../../config/context"

export const Trade = objectType({
  name: "Trade",
  description: "Records buy and sell information of cryptos",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.datetime("timestamp")
    t.nonNull.string("userId")
    t.nonNull.field("user", {
      type: "User",
      resolve: async (parent, _args, context: Context) => {
        return await context.dataloader.loader.load("user", parent.userId)
      },
    })
    t.nonNull.string("coinId"), t.nonNull.float("amount")
    t.nonNull.field("type", {
      type: "TradeType",
    })
    t.nonNull.float("value")
  },
})
