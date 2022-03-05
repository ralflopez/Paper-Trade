import { User } from "../user/user-type"

export type SignupInput = {
  email: string
  password: string
  name: string
  repeatPassword: string
}

export type LoginInput = {
  username: string
  password: string
}

export type AuthPayload = {
  user: User
  token: string
}
