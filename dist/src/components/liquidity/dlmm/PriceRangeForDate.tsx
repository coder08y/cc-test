import { EstimatedAprDateTypeList } from '@/components/common/EstimatedApr'
import { useDlmmApr } from '@/hooks/dlmm/useDlmmApr'
import useDlmmLiquidityStore from '@/store/dlmm'
import useDlmmDepositStore from '@/store/dlmm/dlmmDeposit'
import { CurrentBinChartData, MaxBinRangeChartData } from '@/types/dlmm'
import { CetusTooltip, SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { d, formatPrice, formatSmallPrice, isAvailableObject, removeComma } from '@cetus/utils'
import { HStack, Skeleton, Stack, StackProps, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import { DateSelect } from '../common/DateSelect'
import EstimatedApr from './EstimatedApr'

const dateTypeList = [
  {
    label: '24H',
    key: 'day'
  },
  {
    label: '7D',
    key: 'week'
  },
  {
    label: '30D',
    key: 'month'
  }
]

function PriceRangeForDate({
  direct,
  wrapStyle = {},
  currentLiquidityBins,
  maxBinRangeData,
  activeId
}: {
  direct: boolean
  wrapStyle?: StackProps
  currentLiquidityBins?: CurrentBinChartData
  maxBinRangeData?: MaxBinRangeChartData
  activeId?: number
}) {
  const { priceRangeMap } = useDlmmDepositStore()
  const [tab, setTab] = useState({ type: '30D', key: 'month' })
  const { minPriceForDate, maxPriceForDate, setMinPriceForDate, setMaxPriceForDate, dlmmApiPoolInfo } = useDlmmLiquidityStore()
  useEffect(() => {
    let _min = ''
    let _max = ''
    if (isAvailableObject(priceRangeMap) && isAvailableObject(tab)) {
      const key = `${tab?.type}-${dlmmApiPoolInfo?.poolId}`
      const value = (priceRangeMap as any)[key]
      if (value) {
        const lowest = value[0]
        const lowValue = direct ? lowest : d(1).div(lowest).toString()
        const highest = value[1]
        const highValue = direct ? highest : d(1).div(highest).toString()
        _min = formatPrice(lowValue, 6)
        _max = formatPrice(highValue, 6)
      } else {
        _min = '-'
        _max = '-'
      }
    } else {
      _min = '-'
      _max = '-'
    }
    setMinPriceForDate(_min)
    setMaxPriceForDate(_max)
  }, [direct, tab?.key, priceRangeMap, dlmmApiPoolInfo?.poolId])

  const { isApp } = useWindowWidth()

  const { estimateApr, loading: aprLoading } = useDlmmApr(
    maxBinRangeData?.list || [],
    currentLiquidityBins?.list || [],
    tab?.type,
    activeId,
    dlmmApiPoolInfo
  )

  return isApp ? (
    <HStack w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }}>
      <VStack
        w={{ base: '100%', lg: '50%' }}
        flexDirection={{ base: 'row', lg: 'column' }}
        justify={{ base: 'space-between', lg: 'center' }}
        alignItems={{ base: 'center', lg: 'flex-start' }}
        flex="1"
        // bg="card_bg"
        borderRadius="8px"
      >
        <Text fontSize="12px" whiteSpace="nowrap">
          {tab?.type}&nbsp;Price Range
        </Text>
        <Skeleton minH="14px" isLoaded={minPriceForDate !== undefined && maxPriceForDate !== undefined}>
          <HStack flexDir={'row'} alignItems={'center'}>
            <Text fontSize="12px" color="text_caption">
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
          </HStack>
        </Skeleton>
      </VStack>
      <VStack
        w={{ base: '100%', lg: '50%' }}
        flexDirection={{ base: 'row', lg: 'column' }}
        justify={{ base: 'space-between', lg: 'center' }}
        alignItems={{ base: 'center', lg: 'flex-start' }}
        flex="1"
        // bg="card_bg"
        borderRadius="8px"
      >
        <HStack w={{ base: 'unset', lg: '100%' }} gap="4px" justify="space-between">
          <CetusTooltip
            tooltip={
              <Text fontSize="12px" lineHeight="20px">
                APR based on the past {tab?.type} historical trade fees and emissions. Only positions in range earn yield. Past performance is not
                indicative of future results. Calculations are an estimate and only for reference.
              </Text>
            }
          >
            <HStack gap="4px">
              <Text fontSize="12px" h="20px" lineHeight="20px">
                Estimated APR
              </Text>
              <Icon xlinkHref="#icon-icon_tips" fontSize={isApp ? '16px' : '20px'} />
            </HStack>
          </CetusTooltip>
          <HStack pos="relative" h="100%" alignItems="start">
            <DateSelect
              useDrawer={true}
              type={tab}
              onTypeChange={tab => {
                setTab({ type: tab.label, key: tab.key })
              }}
              list={EstimatedAprDateTypeList}
              buttonStyle={{ color: 'text_paragraph' }}
            />
          </HStack>
        </HStack>
        <EstimatedApr
          loading={aprLoading}
          estimateApr={currentLiquidityBins === undefined ? '--' : (estimateApr?.fee_apr ?? '0')}
          miningAprList={estimateApr?.miningAprList}
          haveMining={(estimateApr?.miningAprList?.length || 0) > 0}
        />
      </VStack>
      {/* <HStack h="100%" w="100%" padding="8px 12px" bg="card_bg" borderRadius="8px" justifyContent="space-between">
              <VStack align="flex-start" gap="8px" />
    
              <HStack pos="relative" h="100%" pt="8px" alignItems="start" />
            </HStack> */}
    </HStack>
  ) : (
    <HStack w="100%" gap="16px" justify="space-between" {...wrapStyle}>
      <Stack
        flexDir={{ base: 'row', lg: 'column' }}
        align={{ base: 'center', lg: 'flex-start' }}
        justify={{ base: 'space-between', lg: 'center' }}
        w={{ base: '100%', lg: 'auto' }}
        gap="4px"
      >
        <HStack>
          <Text lineHeight="20px" fontSize="14px" whiteSpace="nowrap">
            {tab?.type}&nbsp;Pool Price
          </Text>
        </HStack>

        <Text color="text_caption" fontSize="14px" lineHeight="14px" h="14px">
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

      <Stack
        flexDir={{ base: 'row', lg: 'column' }}
        align={{ base: 'center', lg: 'flex-start' }}
        justify={{ base: 'space-between', lg: 'center' }}
        w={{ base: '100%', lg: 'auto' }}
        gap="4px"
      >
        <HStack>
          <CetusTooltip
            tooltip={
              <Text fontSize="12px" lineHeight="20px">
                APR based on the past {tab?.type} historical trade fees and emissions. Only positions in range earn yield. Past performance is not
                indicative of future results. Calculations are an estimate and only for reference.
              </Text>
            }
          >
            <HStack gap="4px">
              <Text>Estimated APR</Text>
              <Icon xlinkHref="#icon-icon_tips" />
            </HStack>
          </CetusTooltip>
        </HStack>

        <EstimatedApr
          loading={aprLoading}
          estimateApr={currentLiquidityBins === undefined ? '--' : (estimateApr?.fee_apr ?? '0')}
          miningAprList={estimateApr?.miningAprList}
          haveMining={(estimateApr?.miningAprList?.length || 0) > 0}
        />
      </Stack>
      <SelectTab<any, any>
        type="outlineTab"
        tabList={EstimatedAprDateTypeList}
        currentTab={tab}
        handleChangeTab={tab => {
          setTab({ type: tab.label, key: tab.key })
        }}
        isActive={(currentTab, tab) => currentTab.key === tab.key}
        wrapStyle={{
          h: isApp ? '28px' : '32px',
          p: '3px',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: '8px',
          gap: '4px',
          w: 'auto'
        }}
        itemStyle={{
          h: isApp ? '20px' : '24px',
          p: isApp ? '4px 6px' : '4px 8px',
          fontSize: '12px',
          borderRadius: '4px',
          flex: 1
        }}
      />
    </HStack>
  )
}

export default PriceRangeForDate
