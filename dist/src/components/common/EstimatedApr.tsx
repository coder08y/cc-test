import usePositionApr from '@/hooks/position/usePositionApr'
import { SelectTab, TooltipIcon } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { isAvailableObject } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { DateSelect } from '../liquidity/common/DateSelect'
import PositionAprBlock from '../position/clmm/list/PositionAprBlock'

export const EstimatedAprDateTypeList = [
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

function EstimatedApr({
  ranges,
  currentPosPoolsRelatedData,
  posPoolInfo,
  isActive,
  tab,
  setTab,
  wrapStyle,
  showFarmingApr = false,
  flexDirection = 'column',
  isFarms = false,
  currentPosTvl,
  isPosition = false,
  isRebalance = false,
  children
}: {
  ranges: any
  currentPosPoolsRelatedData: any
  posPoolInfo: any
  isActive: boolean
  tab: any
  setTab: (item: any) => void
  showFarmingApr?: boolean
  flexDirection?: string
  wrapStyle?: any
  isFarms?: boolean
  currentPosTvl?: string
  isPosition?: boolean
  isRebalance?: boolean
  children?: React.ReactNode
}) {
  const { isApp } = useWindowWidth()
  const { getPositionApr } = usePositionApr()
  const positionApr = useMemo(() => {
    console.log('🚀🚀🚀 ~ EstimatedApr.tsx:54 ~ EstimatedApr ~ currentPosPoolsRelatedData:', { currentPosPoolsRelatedData, posPoolInfo, ranges, tab })
    if (
      isAvailableObject(currentPosPoolsRelatedData) &&
      isAvailableObject(posPoolInfo) &&
      isAvailableObject(ranges) &&
      (Number(currentPosPoolsRelatedData?.minPriceRaw) !== 0 || Number(currentPosPoolsRelatedData?.maxPriceRaw) !== 0) &&
      isAvailableObject(tab)
    ) {
      return getPositionApr(posPoolInfo, currentPosPoolsRelatedData, tab?.key, ranges[tab?.key], isFarms && !isPosition, currentPosTvl)
    }
  }, [JSON.stringify(currentPosPoolsRelatedData), JSON.stringify(posPoolInfo), JSON.stringify(tab?.key), JSON.stringify(ranges), isPosition])

  return (
    <HStack w="100%" justify={isRebalance && !isApp ? 'flex-start' : 'space-between'}>
      {children}
      <VStack
        w={{ base: '100% !important', lg: 'unset' }}
        gap="4px"
        align={{ base: 'space-between', lg: isRebalance ? 'center' : 'flex-start' }}
        flexDirection={{ base: 'row', lg: isRebalance ? 'row' : 'column' }}
        {...wrapStyle}
      >
        <HStack w={{ base: '190px', lg: 'unset' }} gap="4px" flexWrap={{ base: isRebalance ? 'nowrap' : 'wrap', lg: 'nowrap' }}>
          <Text color="text_paragraph" fontSize={isApp ? '12px' : '14px'} mr="-2px" whiteSpace="nowrap">
            Estimated APR
          </Text>
          <TooltipIcon
            // fontSize={isApp ? '16px' : '20px'}
            tooltipCon={`APR based on the past ${tab.type} historical trade fees and emissions. Only positions in range earn yield. Past performance is not indicative of future results.
Calculations are an estimate and only for reference.`}
          />
          {isApp && (
            <DateSelect
              useDrawer={true}
              type={tab}
              onTypeChange={tab => {
                setTab({ type: tab.label, key: tab.key })
              }}
              list={EstimatedAprDateTypeList}
              buttonStyle={{ bg: 'none', border: 'none', color: 'text_paragraph', p: { fontSize: isApp ? '12px' : '14px' } }}
            />
          )}
        </HStack>
        <HStack
          w={{ base: 'calc(100% - 190px)', lg: isRebalance ? 'unset' : '60px' }}
          align="center"
          justify={{ base: 'flex-end', lg: 'flex-start' }}
        >
          {/* <Skeleton isLoaded={!!positionApr}> */}
          <PositionAprBlock
            isActive={isActive}
            haveUnderline={true}
            showFarmingApr={showFarmingApr}
            poolInfo={posPoolInfo}
            positionApr={positionApr}
            flexDirection={flexDirection}
            farmingAprDisplay={positionApr?.farmingAprDisplay}
            totalAprDisplay={positionApr?.displayAprPercentageTotal}
          />
          {/* </Skeleton> */}
        </HStack>
      </VStack>
      {isRebalance && !isApp && (
        <DateSelect
          type={tab}
          onTypeChange={tab => {
            setTab({ type: tab.label, key: tab.key })
          }}
          list={EstimatedAprDateTypeList}
          buttonStyle={isRebalance ? { bg: 'none', border: 'none', color: 'text_paragraph', p: { fontSize: '14px' } } : undefined}
        />
      )}
      {!isApp && !isRebalance && (
        <SelectTab<any, any>
          type="outlineTab"
          tabList={EstimatedAprDateTypeList}
          currentTab={tab}
          handleChangeTab={item => {
            setTab({ type: item.label, key: item.key })
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
      )}
    </HStack>
  )
}
export default EstimatedApr
