import useLiquidityStore from '@/store/clmm'
import useDepositStore from '@/store/clmm/deposit'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d, formatPrice, formatSmallPrice, isAvailableObject, removeComma } from '@cetus/utils'
import { Center, HStack, Stack, StackProps, Text } from '@chakra-ui/react'
import { useEffect } from 'react'

function PriceRangeForDate({
  direct,
  tab,
  wrapStyle = {},
  setTab,
  liquidityChartTab
}: {
  direct: boolean
  wrapStyle?: StackProps
  tab: any
  setTab: (item: any) => void
  liquidityChartTab?: any
}) {
  const { priceRangeMap } = useDepositStore()
  // const [tab, setTab] = useState({ type: '30D', key: 'month' })
  const { minPriceForDate, maxPriceForDate, setMinPriceForDate, setMaxPriceForDate } = useLiquidityStore()
  useEffect(() => {
    let _min = ''
    let _max = ''
    if (isAvailableObject(priceRangeMap)) {
      const lowest = (priceRangeMap as any)[tab?.key]?.[0]
      const lowValue = direct ? lowest : d(1).div(lowest).toString()
      const highest = (priceRangeMap as any)[tab?.key]?.[1]
      const highValue = direct ? highest : d(1).div(highest).toString()
      _min = formatPrice(lowValue, 6)
      _max = formatPrice(highValue, 6)
    } else {
      _min = '-'
      _max = '-'
    }
    setMinPriceForDate(_min)
    setMaxPriceForDate(_max)
  }, [direct, tab.key, priceRangeMap])

  const { isApp } = useWindowWidth()

  return (
    <HStack w="100%" justify="center" {...wrapStyle}>
      <Stack className="price-range-for-date-hstack" flexDir="column" align={{ base: 'center', lg: 'flex-start' }} gap={{ base: '8px', lg: '4px' }}>
        <HStack>
          {liquidityChartTab !== 'prices' && (
            <Center borderRadius="4px" border="1px solid" borderColor="border" p={{ base: '0px', lg: '4px' }} w="20px" h="20px" color="text_caption">
              <svg width="100%" height="2" viewBox="0 0 100 2" preserveAspectRatio="none">
                <line x1="0" y1="1" x2="100" y2="1" stroke="#909CA4" strokeWidth="1" strokeDasharray="20 16" strokeLinecap="butt" />
              </svg>
            </Center>
          )}
          <Text fontSize={{ base: '12px', lg: '14px' }} whiteSpace="nowrap" h="20px" lineHeight="20px">
            {tab?.type}&nbsp;Pool Price
          </Text>
        </HStack>

        <Text
          color="text_caption"
          fontSize={{ base: '12px', lg: '14px' }}
          lineHeight={{ base: '12px', lg: '14px' }}
          h={{ base: '12px', lg: '14px' }}
          whiteSpace="nowrap"
        >
          {direct
            ? minPriceForDate === '-'
              ? minPriceForDate
              : formatSmallPrice(removeComma(minPriceForDate))
            : maxPriceForDate === '-'
              ? maxPriceForDate
              : formatSmallPrice(removeComma(maxPriceForDate))}
          &nbsp;-&nbsp;
          {direct
            ? maxPriceForDate === '-'
              ? maxPriceForDate
              : formatSmallPrice(removeComma(maxPriceForDate))
            : minPriceForDate === '-'
              ? minPriceForDate
              : formatSmallPrice(removeComma(minPriceForDate))}
        </Text>
      </Stack>
      {/* TODO APR 上的时候布局改变需要删掉 */}
      {/* <SelectTab<any, any>
      <SelectTab<any, any>
        type="outlineTab"
        tabList={EstimatedAprDateTypeList}
        currentTab={tab}
        handleChangeTab={tab => {
          setTab({ type: tab.label, key: tab.key })
        }}
        isActive={(currentTab, tab) => currentTab.key === tab.key}
        wrapStyle={{
          h: isApp ? '28px' : '20px',
          p: '1px',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: { base: '8px', lg: '4px' },
          gap: '0px',
          w: 'auto'
        }}
        itemStyle={{
          h: isApp ? '24px' : '16px',
          p: '2px 8px',
          fontSize: '12px',
          borderRadius: '4px',
          flex: 1
        }}
      /> */}
    </HStack>
  )
}

export default PriceRangeForDate
