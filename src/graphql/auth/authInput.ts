import { inputObjectType } from "nexus"

export const SignupInput = inputObjectType({
  name: "SignupInput",
  description: "Required data to make an account",
  definition(t) {
    t.nonNull.string("email")
    t.nonNull.string("password")
    t.nonNull.string("repeatPassword")
  },
})

export const LoginInput = inputObjectType({
  name: "LoginInput",
  description: "Required data to login the user",
  definition(t) {
    t.nonNull.string("email")
    t.nonNull.string("password")
  },
})
