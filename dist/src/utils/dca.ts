export function convertSecondsToString(seconds: number): string {
  const SECONDS_IN_A_MINUTE = 60
  const SECONDS_IN_AN_HOUR = SECONDS_IN_A_MINUTE * 60
  const SECONDS_IN_A_DAY = SECONDS_IN_AN_HOUR * 24
  const SECONDS_IN_A_WEEK = SECONDS_IN_A_DAY * 7
  const SECONDS_IN_A_MONTH = SECONDS_IN_A_DAY * 30 // 简化假设一个月有30天

  const months = Math.floor(seconds / SECONDS_IN_A_MONTH)
  seconds %= SECONDS_IN_A_MONTH

  const weeks = Math.floor(seconds / SECONDS_IN_A_WEEK)
  seconds %= SECONDS_IN_A_WEEK

  const days = Math.floor(seconds / SECONDS_IN_A_DAY)
  seconds %= SECONDS_IN_A_DAY

  const hours = Math.floor(seconds / SECONDS_IN_AN_HOUR)
  seconds %= SECONDS_IN_AN_HOUR

  const minutes = Math.floor(seconds / SECONDS_IN_A_MINUTE)
  seconds %= SECONDS_IN_A_MINUTE

  const result: any = []

  if (months > 0) result.push(`${months} Month${months > 1 ? 's' : ''}`)
  if (weeks > 0) result.push(`${weeks} Week${weeks > 1 ? 's' : ''}`)
  if (days > 0) result.push(`${days} Day${days > 1 ? 's' : ''}`)
  if (hours > 0) result.push(`${hours} Hour${hours > 1 ? 's' : ''}`)
  if (minutes > 0) result.push(`${minutes} Minute${minutes > 1 ? 's' : ''}`)

  return result.join(' ')
}
