import { bnToAmount, d, fixDown, formatNumberWithDown, removePercentSign, symbolDataDisplayProcessing } from '@cetus/utils'

// 多个Apr值相加, displayProcessing: 是否做展示处理
export const addApr = (arr: any[], displayProcessing?: boolean) => {
  if (!arr || arr?.length < 1) return displayProcessing ? '0%' : '0'
  const sum = arr.reduce((accumlator, currentValue) => {
    const current = !currentValue ? '0' : String(currentValue)
    const value = removePercentSign(current)
    return accumlator.add(value)
  }, d(0))

  const result = displayProcessing ? (d(sum).gt(10000) ? '>1,000,000%' : symbolDataDisplayProcessing(sum.mul(100).toString(), '%')) : sum.toString()
  return result
}

// 单个Apr处理, displayProcessing: 是否做展示处理
export const aprProcessing = (value: any, displayProcessing?: boolean, isShowGt10000?: boolean, isShowGt1000000?: boolean) => {
  if (!value) return displayProcessing ? '0%' : '0'
  if (value === '--') return '--'
  const str = removePercentSign(value)

  if (isShowGt1000000) {
    return d(str).gt(10000) ? '>1,000,000%' : displayProcessing ? symbolDataDisplayProcessing(d(str).mul(100).toString(), '%') : str
  }

  return isShowGt10000 && d(str).gt(100) ? '>10,000%' : displayProcessing ? symbolDataDisplayProcessing(d(str).mul(100).toString(), '%') : str
}

// fee展示处理
export const feeDisplayProcessing = (value: string | number) => {
  const res = d(value).mul(100).toString()
  return `${res}%`
}

// current_tx接口的token amount处理
export const bnAmountNumericAbbreviation = (value: string | number, decimals: number) => {
  const str = bnToAmount(value, decimals)
  // 产品要求不展示kmb
  // return numericAbbreviation(str, decimals)
  return formatNumberWithDown(str.toString(), decimals)
}

// 日期数字小于10前面补零处理
export const dayStrZeroPadding = (value: string | number) => {
  const day = new Date(value).getDate()
  if (day < 10) {
    return `0${day}`
  }
  return String(day)
}

// 处理k线处时间的展示
export const formatTime = (value: any): string => {
  if (!value) return '--'
  const date = new Date(value)
  let hours = date.getHours()
  const minutes = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'

  // 将24小时制转换为12小时制
  hours = hours % 12
  hours = hours ? hours : 12 // 如果是0点则改为12点

  // 格式化分钟，确保两位数显示
  const minutesStr = minutes < 10 ? '0' + minutes : minutes

  return `${hours}:${minutesStr} ${ampm}`
}

// 处理为
export const processedAsEmissionsEveryDay = (emissionsPerSecond: string | number) => {
  return fixDown(
    d(emissionsPerSecond)
      ?.mul(60 * 60 * 24)
      .toString(),
    0
  )
}
