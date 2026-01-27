import { d, formatPercentage } from '@cetus/utils'
import { useMemo } from 'react'
// 价格涨跌幅
export function useColorBgText({ initNum }: { initNum: string | number }) {
  const num = Number(initNum) * 100
  const isPositive = useMemo(() => {
    return d(initNum).gt(0)
  }, [initNum])

  const color = useMemo(() => {
    return Number(num) === 0 ? 'text_caption' : isPositive ? 'primary_green' : 'primary_red'
  }, [isPositive, num])
  const bg = useMemo(() => {
    return Number(num) === 0 ? 'white_color_opacity.10' : isPositive ? 'primary_green_opacity.10' : 'primary_red_opacity.10'
  }, [isPositive, num])

  const currencyText = useMemo(() => {
    const formatNum = d(num).abs().toFixed(2)
    return isPositive ? '+$' + formatNum : '-$' + formatNum
  }, [isPositive, num])

  const percentText = useMemo(() => {
    return isPositive ? '+' + formatPercentage(num) : formatPercentage(num)
  }, [num, isPositive])
  return {
    color,
    bg,
    currencyText,
    percentText
  }
}
