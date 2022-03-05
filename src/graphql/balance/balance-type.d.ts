interface BalanceTypeInfo {
  amount: number
  type: "WITHDRAW" | "DEPOSIT"
}

interface BalanceSummary {
  available: number
  total: number
  allocation: BalanceTypeInfo[]
}
