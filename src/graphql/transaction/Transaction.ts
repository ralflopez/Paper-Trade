import { objectType } from "nexus"
import { Context } from "../../config/context"

export const Transaction = objectType({
  name: "Transaction",
  description:
    "Keep tracks of buy, sell, deposit and withdraw actions of a user",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.datetime("timestamp")
    t.nonNull.field("type", {
      type: "TransactionType",
    })
    t.nonNull.float("amount")
    t.nonNull.float("valueUsd")
    t.nonNull.string("symbol")
    t.nonNull.string("assetId")
    t.nonNull.field("assetType", {
      type: "AssetType",
    })
    t.nonNull.string("userId")
    t.nonNull.field("user", {
      type: "User",
      resolve: async (parent, _args, context: Context) => {
        return context.dataloader.loader.load("user", parent.userId)
      },
    })
  },
})

export const AssetAllocationOutput = objectType({
  name: "AssetAllocationOutput",
  definition(t) {
    t.nonNull.string("symbol")
    t.nonNull.string("assetId")
    t.nonNull.float("total")
    t.nonNull.float("average")
  },
})

export const PortfolioOutput = objectType({
  name: "PortfolioOutput",
  definition(t) {
    t.nonNull.float("buyingPower")
    t.nonNull.list.nonNull.field("assetAllocation", {
      type: "AssetAllocationOutput",
    })
  },
})
