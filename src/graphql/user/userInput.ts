import { inputObjectType } from "nexus"

export const UserUpdateInput = inputObjectType({
  name: "UserUpdateInput",
  definition(t) {
    t.nonNull.email("email")
    t.nonNull.string("password")
  },
})
