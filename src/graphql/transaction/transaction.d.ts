interface AssetAllocation {
  symbol: string
  total: number
}
interface TransactionPortfolio {
  buyingPower: number
  assetAllocation: AssetAllocation[]
}
