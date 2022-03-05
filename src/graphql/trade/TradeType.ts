import { enumType } from "nexus"
import { TradeType } from "@prisma/client"

export const TradeTypeGQL = enumType({
  name: "TradeType",
  description: "Buy / Sell",
  members: [TradeType.BUY, TradeType.SELL],
})
