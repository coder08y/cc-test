import { useCallback, useState } from 'react'

/**
 * 处理 All 联动逻辑
 * @param newType 新的选择类型
 * @param currentType 当前的类型
 * @returns 处理后的最终类型
 */
const processAllLinkage = (newType: string, currentType: string): string => {
  const selectedTypes = newType ? newType.split(',') : []
  const prevTypes = currentType ? currentType.split(',') : []

  const hasAll = selectedTypes.includes('All')
  const hasBuy = selectedTypes.includes('Buy')
  const hasSell = selectedTypes.includes('Sell')
  const prevHasAll = prevTypes.includes('All')

  let finalTypes: string[]

  if (hasAll && !prevHasAll) {
    finalTypes = ['All', 'Buy', 'Sell']
  } else if (!hasAll && prevHasAll) {
    finalTypes = []
  } else if (hasBuy && hasSell && !hasAll) {
    finalTypes = ['All', 'Buy', 'Sell']
  } else if (hasAll && (!hasBuy || !hasSell)) {
    finalTypes = selectedTypes.filter(t => t !== 'All')
  } else {
    finalTypes = selectedTypes
  }

  return finalTypes.join(',')
}

/**
 * 过滤订单数据 - 根据 side 筛选
 */
const filterOrdersBySide = (orders: any[], typeFilter: string) => {
  if (!typeFilter || typeFilter.split(',').includes('All')) {
    return orders
  }
  const types = typeFilter.split(',')
  return orders.filter((order: any) => types.includes(order.side))
}

/**
 * Side 筛选的 Hook
 */
export const useSideFilter = () => {
  const [type, setType] = useState('All,Buy,Sell')

  const handleTypeChange = useCallback(
    (newType: string) => {
      const finalType = processAllLinkage(newType, type)
      setType(finalType)
    },
    [type]
  )

  // 直接设置值，不经过联动逻辑（用于单选模式）
  const handleTypeChangeDirect = useCallback((newType: string) => {
    setType(newType)
  }, [])

  const filterOrders = useCallback(
    (orders: any[]) => {
      return filterOrdersBySide(orders, type)
    },
    [type]
  )

  return {
    type,
    handleTypeChange,
    handleTypeChangeDirect,
    filterOrders
  }
}

export default useSideFilter
