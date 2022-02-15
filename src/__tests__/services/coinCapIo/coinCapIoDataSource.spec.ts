import { CoinCapIoDataSource } from "../../../services/coinCapIo/coinCapIoDataSource"

let coinCapIoDataSource: CoinCapIoDataSource

beforeAll(() => {
  coinCapIoDataSource = new CoinCapIoDataSource()
})

describe("getAllAssets", () => {
  it("should return all assets", async () => {
    const response = await coinCapIoDataSource.getAllAssets()
    expect(response).toBeInstanceOf(Array)
  })
})

describe("getOneAsset", () => {
  it("should return asset details", async () => {
    const id = "bitcoin"
    const response = await coinCapIoDataSource.getAsset(id)
    expect(response).toBeDefined()
  })
})

describe("getRates", () => {
  it("should return fiat rates", async () => {
    const response = await coinCapIoDataSource.getRates()
    expect(response).toBeDefined()
  })

  it("should include php as currency", async () => {
    const response = await coinCapIoDataSource.getRates()
    expect(response).toEqual(
      expect.arrayContaining([expect.objectContaining({ symbol: "PHP" })])
    )
  })
})
