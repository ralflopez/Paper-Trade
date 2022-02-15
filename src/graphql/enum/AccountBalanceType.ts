import { AccountBalanceType } from "@prisma/client"
import { enumType } from "nexus"

export const AccountBalanceTypeGQL = enumType({
  name: "AccountBalanceType",
  description: "WITHDRAW / DEPOSIT",
  members: [AccountBalanceType.DEPOSIT, AccountBalanceType.WITHDRAW],
})
