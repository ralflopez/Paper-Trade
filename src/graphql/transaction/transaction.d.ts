interface AssetAllocation {
  symbol: string
  assetId: string
  total: number
}
interface TransactionPortfolio {
  buyingPower: number
  assetAllocation: AssetAllocation[]
}
