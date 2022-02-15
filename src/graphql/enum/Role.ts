import { enumType } from "nexus"
import { Role } from "@prisma/client"

export const RoleType = enumType({
  name: "Role",
  description: "Role of the User",
  members: [Role.ADMIN, Role.USER],
})
