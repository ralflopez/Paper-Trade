import DataLoader from "dataloader"
import { prisma } from "./prisma/client"

export class Loader {
  private loaders: { [id: string | number]: DataLoader<any, any, any> } = {}

  load(table: string, id: string | number) {
    const loader = this.findLoader(table)
    return loader.load(id)
  }

  private findLoader(table: any) {
    if (!this.loaders[table]) {
      this.loaders[table] = new DataLoader(async (ids) => {
        const rows = await (prisma as any)[table].findMany({
          where: {
            id: {
              in: ids as any,
            },
          },
        })

        const lookup = rows.reduce(
          (acc: { [id: string | number]: any }, row: any) => {
            acc[row.id] = row
            return acc
          },
          {}
        )

        return ids.map((id) => lookup[id] || null)
      })
    }
    return this.loaders[table]
  }
}
