import { queryField } from "nexus"

export const TestRoute = queryField("test", {
  type: "String",
  description: "A query to test if endpoint can be reached",
  resolve: () => "Yes im alive",
})
