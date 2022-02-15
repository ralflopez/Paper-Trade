import { objectType } from "nexus"

export const AuthPayload = objectType({
  name: "AuthPayload",
  description: "Return data for authenticated users",
  definition(t) {
    t.nonNull.field("user", {
      type: "User",
    })
    t.nonNull.string("token")
  },
})
