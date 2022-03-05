interface BalanceTypeInfo {
  amount: number
  type: "WITHDRAW" | "DEPOSIT" | "TRADE" | "UNTRADE"
}

interface BalanceSummary {
  available: number
  total: number
  allocation: BalanceTypeInfo[]
}
