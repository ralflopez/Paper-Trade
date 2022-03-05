import { inputObjectType } from "nexus"

export const BalanceInput = inputObjectType({
  name: "BalanceInput",
  definition(t) {
    t.nonNull.float("amount")
    t.nonNull.field("type", {
      type: "BalanceType",
    })
  },
})
