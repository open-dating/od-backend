export function transformInputEmailToValidFormat(email: string): string {
  return String(email).trim().toLowerCase()
}

export function mapRawItemsToDto<T>(items: any[], createDto: () => T): T[] {
  const out: T[] = []
  for (const item of items) {
    const cls = createDto()
    for (const key of Object.keys(item)) {
      cls[key] = item[key]
    }
    out.push(cls)
  }
  return out
}
