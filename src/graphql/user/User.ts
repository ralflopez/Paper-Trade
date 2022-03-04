import { objectType } from "nexus"

export const User = objectType({
  name: "User",
  description: "User model from the database",
  definition(t) {
    t.nonNull.id("id")
    t.nonNull.string("name")
    t.nonNull.email("email")
    t.nonNull.field("role", {
      type: "Role",
    })
  },
})
