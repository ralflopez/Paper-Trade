import { enumType } from "nexus"
import { AssetType, TransactionType } from "@prisma/client"

export const TransactionTypeGQL = enumType({
  name: "TransactionType",
  members: [
    TransactionType.BUY,
    TransactionType.SELL,
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAW,
  ],
})

export const AssetTypeGQL = enumType({
  name: "AssetType",
  members: [AssetType.CRYPTO, AssetType.FIAT],
})
