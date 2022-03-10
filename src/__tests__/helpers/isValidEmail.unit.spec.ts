import { isValidEmail } from "../../helpers/auth/isValidEmail"

describe("isValidEmail", () => {
  it("shuuld return false if email is blank", () => {
    const result = isValidEmail("")
    expect(result).toBeFalsy()
  })

  it("should return false if email doesn't contain @", () => {
    const result = isValidEmail("thisisastring")
    expect(result).toBeFalsy()
  })

  it("should return true if email is test@email.com", () => {
    const result = isValidEmail("test@email.com")
    expect(result).toBeTruthy()
  })
})
