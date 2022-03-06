import { objectType } from "nexus"
import { Context } from "../../config/context"

export const Balance = objectType({
  name: "Balance",
  description:
    "Keeps track of the total balance deposited to the users account",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.datetime("timestamp")
    t.nonNull.field("type", {
      type: "BalanceType",
    })
    t.nonNull.string("userId")
    t.nonNull.field("user", {
      type: "User",
      resolve: async (parent, _args, context: Context) => {
        return context.dataloader.loader.load("user", parent.userId)
      },
    })
    t.nonNull.float("amount")
  },
})
