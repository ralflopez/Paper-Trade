import {
  ApolloError,
  AuthenticationError,
  UserInputError,
} from "apollo-server-errors"
import { list, mutationField, nonNull, queryField } from "nexus"
import { Context } from "../../config/context"

// Query
export const transactionsQuery = queryField("transactions", {
  type: nonNull(list(nonNull("Transaction"))),
  description: "Returns all transactions in the ledger",
  resolve: async (_parent, _args, { user, dataSources }: Context) => {
    // validation
    if (!user?.id) throw new AuthenticationError("You are not logged in")

    // read from database
    const transactions = await dataSources.transaction.getMyTransactions(
      user.id
    )
    return transactions
  },
})

export const MyPortfolioQuery = queryField("myPortfolio", {
  type: "PortfolioOutput",
  description: "a summary of all assets owned by the user",
  resolve: async (_parent, _args, { user, dataSources }: Context) => {
    // validation
    if (!user?.id) throw new AuthenticationError("You are not logged in")

    const myPortfolio = await dataSources.transaction.getMyPortfolio(user.id)
    return myPortfolio
  },
})

// Mutation
export const BuyMutation = mutationField("buy", {
  type: "Transaction",
  description: "Buy operation of a certain cryptocurrency",
  args: {
    amount: nonNull("Float"),
    assetId: nonNull("String"),
  },
  resolve: async (
    _parent,
    { amount, assetId },
    { user, dataSources }: Context
  ) => {
    // validation
    if (!user?.id) throw new AuthenticationError("You are not logged in")

    // validate enough funds
    const portfolio: TransactionPortfolio =
      await dataSources.transaction.getMyPortfolio(user.id)
    if (portfolio.buyingPower < amount)
      throw new UserInputError("You don't have enough balance in your account")

    // validate asset
    const asset: CoinCapIo_Asset | null = await dataSources.coinCapIo.getAsset(
      assetId
    )
    if (!asset) throw new UserInputError("Asset not found")
    const cryptoAmount = amount / Number(asset.priceUsd)

    // write to database
    const result = await dataSources.transaction.buy(
      user.id,
      cryptoAmount,
      asset.symbol,
      asset.id
    )

    return result
  },
})

export const SellMutation = mutationField("sell", {
  type: "Transaction",
  description: "sell operation of a certain cryptocurrency",
  args: {
    amount: nonNull("Float"),
    assetId: nonNull("String"),
  },
  resolve: async (
    _parent,
    { amount, assetId },
    { user, dataSources }: Context
  ) => {
    // validation
    if (!user?.id) throw new AuthenticationError("You are not logged in")

    // validate asset
    const asset: CoinCapIo_Asset | null = await dataSources.coinCapIo.getAsset(
      assetId
    )
    if (!asset) throw new UserInputError("Asset not found")

    // validate enough funds
    const portfolio: TransactionPortfolio =
      await dataSources.transaction.getMyPortfolio(user.id)
    const assetInPortfolio = portfolio.assetAllocation.find(
      (a) => a.assetId == assetId
    )
    if (!assetInPortfolio?.total || assetInPortfolio.total < amount)
      throw new UserInputError(
        `You don't have enough ${asset.symbol} in your account`
      )

    const cryptoAmount = assetInPortfolio.total * Number(asset.priceUsd)

    // write to database
    const result = await dataSources.transaction.sell(
      user.id,
      cryptoAmount,
      asset.symbol,
      asset.id
    )

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
  resolve: async (_parent, { amount }, { user, dataSources }: Context) => {
    // validation
    if (!user?.id) throw new AuthenticationError("You are not logged in")

    // validate available funds
    const portfolio: TransactionPortfolio =
      await dataSources.transaction.getMyPortfolio(user.id)
    if (portfolio.buyingPower < amount)
      throw new UserInputError("You don't have enough balance in your account")

    // write to database
    const result = await dataSources.transaction.withdraw(user.id, amount)

    return result
  },
})
