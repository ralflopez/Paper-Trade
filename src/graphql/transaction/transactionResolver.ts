import { AuthenticationError } from "apollo-server-errors"
import { mutationField, nonNull } from "nexus"
import { Context } from "../../config/context"

export const BuyMutation = mutationField("buy", {
  type: "Transaction",
  description: "Buy operation of a certain cryptocurrency",
  args: {
    amount: nonNull("Float"),
    symbol: nonNull("String"),
  },
  resolve: async (_parent, args, context: Context) => {
    if (!context.user?.id) throw new AuthenticationError("User ID not found")
    const { amount, symbol } = args
    const result = await context.dataSources.transaction.buy(
      context.user.id,
      amount,
      symbol
    )

    return result
  },
})
