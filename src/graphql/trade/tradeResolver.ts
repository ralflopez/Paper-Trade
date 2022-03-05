import { Trade, TradeType } from "@prisma/client"
import { mutationField, nonNull } from "nexus"
import { Context } from "../../config/context"

export const BuyMutation = mutationField("buy", {
  type: "Trade",
  description: "Perform buy operation of a certain coin",
  args: {
    data: nonNull("TradeInput"),
  },
  resolve: async (_parent, args, context: Context) => {
    // check if enough balance
    // execute trade
    const userId = context.user?.id as string
    const trade: Trade = await context.dataSources.trade.createOne(
      args.data.amount,
      args.data.value,
      args.data.coinId,
      TradeType.BUY,
      userId
    )

    return trade
  },
})

export const SellMutation = mutationField("sell", {
  type: "Trade",
  args: {
    data: nonNull("TradeInput"),
  },
  resolve: async (_parent, args, context: Context) => {
    const userId = context.user?.id as string
    const trade: Trade = await context.dataSources.trade.createOne(
      args.data.amount,
      args.data.value,
      args.data.coinId,
      TradeType.SELL,
      userId
    )

    return trade
  },
})
