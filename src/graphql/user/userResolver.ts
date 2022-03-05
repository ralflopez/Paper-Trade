import { idArg, list, mutationField, nonNull, queryField } from "nexus"
import { AuthenticationError } from "apollo-server-errors"

// Query
export const UserQuery = queryField("getUser", {
  type: "User",
  args: {
    id: nonNull(idArg()),
  },
  resolve(_parent, args, context) {
    return context.dataSources.user.getOne(args.id)
  },
})

export const UsersQuery = queryField("getUsers", {
  type: nonNull(list(nonNull("User"))),
  resolve(_parent, _args, context) {
    return context.dataSources.user.getMany()
  },
})

export const UserSelfQuery = queryField("getMyUser", {
  type: "User",
  resolve(_parent, _args, context) {
    if (!context.user?.id) throw new AuthenticationError("User ID not found")
    return context.dataSources.user.getOne(context.user?.id)
  },
})

// Mutation
export const UserDelete = mutationField("deleteUser", {
  type: "User",
  args: {
    id: nonNull(idArg()),
  },
  resolve(_parent, args, context) {
    return context.dataSources.user.deleteOne(args.id)
  },
})

export const UserUpdate = mutationField("updateUser", {
  type: "User",
  args: {
    id: nonNull(idArg()),
    data: nonNull("UserUpdateInput"),
  },
  resolve(_parent, args, context) {
    return context.dataSources.user.updateOne(
      args.id,
      args.data.email,
      args.data.password,
      args.data.name
    )
  },
})
