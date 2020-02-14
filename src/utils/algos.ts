export function arrayToBeetWiseArray<T>(items: T[]): T[][] {
  const out: T[][] = []

  for (const item of items) {
    for (const subItem of items) {
      if (item === subItem) {
        continue
      }
      out.push([item, subItem], [subItem, item])
    }
  }

  return out
}
