import { enumType } from "nexus"
import { TransactionType } from "@prisma/client"

export const TransactionTypeGQL = enumType({
  name: "TransactionType",
  members: [
    TransactionType.BUY,
    TransactionType.SELL,
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAW,
  ],
})
