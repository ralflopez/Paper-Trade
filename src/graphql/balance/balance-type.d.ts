import { TradeType } from "@prisma/client"

interface CoinAllocation {
  coinId: string
  type: TradeType
  boughtValue: number
}

interface BalanceSummary {
  buyingPower: number
  totalEquity: number
  initalBalance: number // buying power + all coins bought value
  allocation: CoinAllocation[]
}
