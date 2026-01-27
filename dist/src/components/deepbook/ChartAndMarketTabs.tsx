import useDeepBookStore from '@/store/deepbook'
import { SelectTab } from '@cetus/design'
import { Box } from '@chakra-ui/react'
import { useEffect, useMemo, useRef } from 'react'

export default function ChartAndMarketTabs() {
  const { chartAndMarketCurrentTab, setChartAndMarketCurrentTab, currentDeepBookPool, tradeTypeByPool, getTradeType } = useDeepBookStore()

  // 使用 useRef 记录上一个 pool 地址，避免初始化时误触发
  const prevPoolAddressRef = useRef<string | undefined>(currentDeepBookPool?.address)

  // 计算当前 pool 的 tradeType
  const poolAddress = useMemo(() => currentDeepBookPool?.address, [currentDeepBookPool?.address])
  const tradeType = useMemo(() => {
    return poolAddress ? getTradeType(poolAddress) : 'Spot'
  }, [poolAddress, tradeTypeByPool, getTradeType])

  // 使用 useRef 记录上一个 tradeType，初始化为 undefined 避免初始化时误触发
  const prevTradeTypeRef = useRef<'Spot' | 'Margin' | undefined>(undefined)

  // 监听 pool 地址变化，切换时重置为 Chart 标签页
  useEffect(() => {
    const currentAddress = currentDeepBookPool?.address
    const prevAddress = prevPoolAddressRef.current

    // 如果地址发生变化（且不是初始化）
    if (currentAddress && prevAddress !== undefined && prevAddress !== currentAddress) {
      setChartAndMarketCurrentTab({ key: 'chart', label: 'Chart' })
      // 重置 tradeType ref，因为切换 pool 时 tradeType 也会变化
      prevTradeTypeRef.current = undefined
    }

    // 更新 ref
    prevPoolAddressRef.current = currentAddress
  }, [currentDeepBookPool?.address, setChartAndMarketCurrentTab])

  // 监听 tradeType 从 Margin 切换回 Spot，切换时重置为 Chart 标签页
  useEffect(() => {
    // 如果没有 pool 地址，不处理
    if (!poolAddress) return

    const prevTradeType = prevTradeTypeRef.current

    // 如果从 Margin 切换到 Spot（且不是初始化）
    if (prevTradeType !== undefined && prevTradeType === 'Margin' && tradeType === 'Spot') {
      setChartAndMarketCurrentTab({ key: 'chart', label: 'Chart' })
    }

    // 更新 ref
    prevTradeTypeRef.current = tradeType
  }, [tradeType, poolAddress, setChartAndMarketCurrentTab])

  const tabList = [
    {
      label: 'Chart',
      key: 'chart'
    },
    {
      label: 'Market Details',
      key: 'market'
    }
  ]

  return (
    <Box borderBottom="1px solid" borderColor="border" borderRadius="8px 8px 0 0" bg="bg_secondary" px="12px">
      <SelectTab
        type="borderTab"
        wrapStyle={{
          w: { base: '100%', lg: 'unset' },
          h: '37px',
          bg: 'none',
          border: 'none'
        }}
        itemStyle={{
          marginRight: '24px',
          fontSize: '14px',
          position: 'relative',
          fontWeight: '500',
          // flex: isApp ? '1' : 'auto',
          sx: {
            '&[data-active=true]': {
              color: 'primary'
            }
          }
        }}
        tabList={tabList as any}
        currentTab={chartAndMarketCurrentTab.key}
        activeColor="primary"
        handleChangeTab={item => {
          console.log(item)
          setChartAndMarketCurrentTab(item as any)
        }}
      />
    </Box>
  )
}
