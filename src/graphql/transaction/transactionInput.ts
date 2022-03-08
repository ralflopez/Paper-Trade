import { inputObjectType } from "nexus"

export const AssetAllocationInput = inputObjectType({
  name: "AssetAllocationInput",
  definition(t) {
    t.nonNull.string("symbol")
    t.nonNull.float("total")
  },
})

export const PortfolioInput = inputObjectType({
  name: "PortfolioInput",
  definition(t) {
    t.nonNull.float("buyingPower")
    t.nonNull.list.nonNull.field("assetAllocation", {
      type: "AssetAllocationInput",
    })
  },
})
