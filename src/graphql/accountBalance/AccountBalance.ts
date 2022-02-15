import { objectType } from "nexus"

export const AccountBalance = objectType({
  name: "AccountBalance",
  description:
    "Keeps track of the total balance deposited to the users account",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.datetime("timestamp")
    t.nonNull.field("type", {
      type: "AccountBalanceType",
    })
    t.nonNull.field("user", {
      type: "User",
    })
    t.nonNull.float("amount")
  },
})
