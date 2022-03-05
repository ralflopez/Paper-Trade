import { Balance } from "@prisma/client"
import { mutationField, nonNull } from "nexus"
import { Context } from "../../config/context"

// export const Deposit = mutationField("deposit", {
//   type: "Balance",
//   args: {
//     data: nonNull(""),
//   },
//   resolve: async (_parent, args, context: Context) => {
//     const userId = context.user?.id as string
//     const deposit = (await context.dataSources.balance.createOne(
//       args.data.amount,
//       args.data.type,
//       userId
//     )) as Balance

//     return deposit
//   },
// })
