export function getCurrentSlot(): "asubuhi" | "jioni" {
  const hour = new Date().getHours()
  return hour >= 5 && hour < 12 ? "asubuhi" : "jioni"
}
