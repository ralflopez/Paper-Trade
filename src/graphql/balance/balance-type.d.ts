interface BalanceAggregate {
  amount: number
  type: "WITHDRAW" | "DEPOSIT" | "TRADE" | "UNTRADE"
}
