import { mutationField, nonNull } from "nexus"
import { Context } from "../../config/context"

// export const BuyMutation = mutationField("buy", {
//   type: "TransactionType",
//   description: "Buy operation of a certain cryptocurrency",
//   args: {
//     amount: nonNull("Float"),
//     symbol: nonNull("String"),
//   },
//   resolve: async (_parent, args, context: Context) => {
//     return context.dataSources.transaction.buy(args.amount, args.symbol)
//   },
// })
