interface BuyingPowerQuery {
  sum: number
}

interface AssetAllocationQuery {
  symbol: string
  assetId: string
  total: number
  average: number
}

interface PortfolioSummary {
  buyingPower: number
  allocation: AssetAllocationQuery[]
}
