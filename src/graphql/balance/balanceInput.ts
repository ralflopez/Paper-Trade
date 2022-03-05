import { inputObjectType } from "nexus"

export const DepositIinput = inputObjectType({
  name: "DepositInput",
  definition(t) {
    t.nonNull.float("amount")
    t.nonNull.field("type", {
      type: "BalanceType",
    })
  },
})
