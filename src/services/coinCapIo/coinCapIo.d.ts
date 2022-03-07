interface CoinCapIo_Asset {
  id: string
  rank: string
  symbol: string
  name: string
  supply: string
  maxSupply: string
  marketCapUsd: string
  volumeUsd24Hr: string
  priceUsd: string
  changePercent24Hr: string
  vwap24Hr: string
  explorer: string
}

interface CoinCapIo_Assets {
  data: CoinCapIo_Asset[]
  timestamp: string
}

interface CoinCapIo_Asset_Result {
  data: CoinCapIo_Asset
  timestamp: string
}

interface CoinCapIo_Rate {
  id: string
  symbol: string
  currencySymbol: string
  type: string
  rateUsd: string
}

interface CoinCapIo_Rates {
  data: CoinCapIo_Rate[]
  timestamp: string
}

interface CoinCapIo_Rate_Result {
  data: CoinCapIo_Rate
  timestamp: string
}
