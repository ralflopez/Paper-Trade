import { AuthenticationError } from "apollo-server-errors"
import { list, mutationField, nonNull, queryField } from "nexus"
import { Context } from "../../config/context"

// Query
export const transactions = queryField("transactions", {
  type: nonNull(list(nonNull("Transaction"))),
  description: "Returns all transactions in the ledger",
  resolve: async (_parent, args, { user, dataSources }: Context) => {
    // validatoin
    if (!user?.id) throw new AuthenticationError("You are not logged in")

    // read from database
    const transactions = dataSources.transaction.getMyTransactions(user.id)
    return transactions
  },
})
// Mutation
export const BuyMutation = mutationField("buy", {
  type: "Transaction",
  description: "Buy operation of a certain cryptocurrency",
  args: {
    amount: nonNull("Float"),
    symbol: nonNull("String"),
  },
  resolve: async (_parent, args, { user, dataSources }: Context) => {
    // validation
    if (!user?.id) throw new AuthenticationError("You are not logged in")

    // write to database
    const { amount, symbol } = args
    const result = await dataSources.transaction.buy(user.id, amount, symbol)

    return result
  },
})

export const SellMutation = mutationField("sell", {
  type: "Transaction",
  description: "sell operation of a certain cryptocurrency",
  args: {
    amount: nonNull("Float"),
    symbol: nonNull("String"),
  },
  resolve: async (_parent, args, { user, dataSources }: Context) => {
    // validation
    if (!user?.id) throw new AuthenticationError("You are not logged in")

    // write to database
    const { amount, symbol } = args
    const result = await dataSources.transaction.sell(user.id, amount, symbol)

    return result
  },
})

export const DepositMutation = mutationField("deposit", {
  type: "Transaction",
  description: "deposit operation of a certain cryptocurrency",
  args: {
    amount: nonNull("Float"),
  },
  resolve: async (_parent, args, { user, dataSources }: Context) => {
    // validation
    if (!user?.id) throw new AuthenticationError("You are not logged in")

    // write to database
    const { amount } = args
    const result = await dataSources.transaction.deposit(user.id, amount)

    return result
  },
})

export const WithdrawMutation = mutationField("withdraw", {
  type: "Transaction",
  description: "withdraw operation of a certain cryptocurrency",
  args: {
    amount: nonNull("Float"),
  },
  resolve: async (_parent, args, { user, dataSources }: Context) => {
    // validation
    if (!user?.id) throw new AuthenticationError("You are not logged in")

    // write to database
    const { amount } = args
    const result = await dataSources.transaction.withdraw(user.id, amount)

    return result
  },
})
