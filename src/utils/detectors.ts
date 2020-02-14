export function hasPhoneNumber(text: string): boolean {
  if (text.length > 8 && text.match(/(\d{3,})/)) {
    return true
  }
  return false
}
