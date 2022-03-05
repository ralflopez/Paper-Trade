import { BalanceType } from "@prisma/client"
import { enumType } from "nexus"

export const BalanceTypeGQL = enumType({
  name: "BalanceType",
  description: "WITHDRAW / DEPOSIT",
  members: [
    BalanceType.DEPOSIT,
    BalanceType.WITHDRAW,
    BalanceType.TRADE,
    BalanceType.UNTRADE,
  ],
})
