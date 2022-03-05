import { inputObjectType } from "nexus"

export const TradeInput = inputObjectType({
  name: "TradeInput",
  definition(t) {
    t.nonNull.float("amount")
    t.nonNull.float("value")
    t.nonNull.string("coinId")
    t.nonNull.field("type", {
      type: "TradeType",
    })
  },
})
