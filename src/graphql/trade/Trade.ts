import { objectType } from "nexus"

export const Trade = objectType({
  name: "Trade",
  description: "Records buy and sell information of cryptos",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.datetime("timestamp")
    t.nonNull.field("User", {
      type: "User",
    })
    t.nonNull.string("coinId"), t.nonNull.float("amount")
    t.nonNull.field("TradeType", {
      type: "TradeType",
    })
    t.nonNull.float("boughtValue")
  },
})
