import { log } from 'console'
import useDisplayPrice from '@/hooks/common/useDisplayPrice'
import useDisplayTickPrice from '@/hooks/common/useDisplayTickPrice'
import SelectTab, { Tab } from '@cetus/design/src/components/common/SelectTab'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { VTextLabelBox } from '@cetus/ui-kit'
import { Decimal, d, formatNumber } from '@cetus/utils'
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import PriceRangeBar from '../common/PriceRangeBar'

export function VaultsPositionRange({ currentVaultPool, apiVaultInfo }: { currentVaultPool?: any; apiVaultInfo?: any }) {
  const { currentPrice, minPrice, maxPrice } = currentVaultPool?.positionList?.[0] || {}
  const { displayTokenA, displayTokenB } = apiVaultInfo || {}
  const [changeSide, setChangeSide] = useState<boolean>(false)
  const { displayPrice } = useDisplayPrice({ price: currentPrice, changeSide })
  const { displayMaxPrice, displayMinPrice } = useDisplayTickPrice({ minPrice, maxPrice, changeSide })

  const baseCoin = useMemo(() => {
    return !changeSide ? displayTokenA : displayTokenB
  }, [displayTokenA, displayTokenB, changeSide])

  const rangeTabList = useMemo(() => {
    if (displayTokenA && displayTokenB) {
      return [displayTokenA, displayTokenB]?.filter(Boolean).map(item => ({
        label: item?.symbol,
        key: item?.coin_type,
        isToken: true,
        imgInfo: {
          src: item?.logo_url,
          w: '16px',
          h: '16px',
          coinType: item ? item?.coin_type : '',
          showTagWidth: '8px',
          showTagHeight: '8px'
        }
      }))
    } else {
      return []
    }
  }, [displayTokenA?.coin_type, displayTokenB?.coin_type])

  const [currentRangeTab, setCurrentRangeTab] = useState<string>()

  const onReverseClick = (item?: Tab) => {
    setChangeSide(!changeSide)
    if (item && item?.coin_type) {
      setCurrentRangeTab(item?.coin_type)
    } else {
      setCurrentRangeTab(rangeTabList?.find(tab => tab.key !== currentRangeTab)?.key)
    }
  }
  useEffect(() => {
    if (baseCoin) {
      setCurrentRangeTab(baseCoin?.coin_type)
    }
  }, [baseCoin])

  const { isApp } = useWindowWidth()

  const isActive = useMemo(() => {
    return (
      displayPrice &&
      displayMinPrice &&
      displayMaxPrice &&
      d(displayPrice).greaterThanOrEqualTo(displayMinPrice) &&
      d(displayPrice).lessThanOrEqualTo(displayMaxPrice)
    )
  }, [currentPrice, displayMinPrice, displayMaxPrice])

  if (currentVaultPool && currentPrice === undefined) {
    return null
  }

  return (
    <VStack w="100%">
      <HStack w="100%" justifyContent="space-between" mt={{ base: '12px', lg: '20px' }}>
        <Text fontSize="14px" color="text_caption">
          Position Range
        </Text>
        {/* 切换base */}
        {rangeTabList && rangeTabList?.length > 0 && (
          <SelectTab<any, any>
            type="outlineTab"
            tabList={rangeTabList}
            currentTab={currentRangeTab}
            handleChangeTab={tab => onReverseClick(tab)}
            wrapStyle={{
              h: '28px',
              p: '3px',
              border: '1px solid',
              borderColor: 'border',
              borderRadius: '8px',
              gap: '4px',
              zIndex: '99'
            }}
            itemStyle={{
              h: '20px',
              p: '2px 8px',
              borderRadius: '4px',
              gap: '4px',
              fontSize: '12px'
            }}
          />
        )}
      </HStack>
      <HStack w="100%" mt="50px" justifyContent="center">
        <PriceRangeBar
          minPrice={displayMinPrice}
          maxPrice={displayMaxPrice}
          currPrice={displayPrice}
          isActive={isActive}
          infinityW={isApp ? '320px' : '588px'}
          commonW={isApp ? '220px' : '404px'}
          showRatio={true}
        />
      </HStack>
      {!isApp ? (
        <HStack w="calc(100% - 64px)" bg="vaults_price_block_bg" mt="12px" borderRadius="8px">
          <VTextLabelBox
            title="Min Price"
            value={!displayMinPrice ? <Skeleton w="100px" h="20px" /> : formatNumber(displayMinPrice, 6, false, Decimal.ROUND_DOWN)}
            wrapStyle={{ flex: 1, alignItems: 'center', padding: '12px 0px', gap: '8px' }}
            titleStyle={{
              color: 'primary_gray',
              fontSize: '12px'
            }}
          />
          <VTextLabelBox
            title="Current Price"
            value={!displayPrice ? <Skeleton w="100px" h="20px" /> : formatNumber(displayPrice, 6, false, Decimal.ROUND_DOWN)}
            wrapStyle={{
              flex: 1,
              alignItems: 'center',
              padding: '12px 0px',
              borderRight: '2px solid',
              borderLeft: '2px solid',
              borderColor: 'bg_secondary',
              gap: '8px'
            }}
            titleStyle={{
              color: 'primary_gray',
              fontSize: '12px'
            }}
          />
          <VTextLabelBox
            title="Max Price"
            value={!displayMaxPrice ? <Skeleton w="100px" h="20px" /> : formatNumber(displayMaxPrice, 6, false, Decimal.ROUND_DOWN)}
            wrapStyle={{ flex: 1, alignItems: 'center', padding: '12px 0px', gap: '8px' }}
            titleStyle={{
              color: 'primary_gray',
              fontSize: '12px'
            }}
          />
        </HStack>
      ) : (
        <VStack w="100%" bg="vaults_price_block_bg" mt="12px" borderRadius="8px" gap="0">
          <VTextLabelBox
            title="Current Price"
            value={!displayPrice ? <Skeleton w="100px" h="20px" /> : formatNumber(displayPrice, 6, false, Decimal.ROUND_DOWN)}
            wrapStyle={{
              w: '100%',
              alignItems: 'center',
              padding: '12px 0px',
              borderBottom: '2px solid',
              borderColor: 'bg_secondary',
              gap: '8px'
            }}
            titleStyle={{
              color: 'primary_gray'
            }}
          />
          <HStack w="100%">
            <VTextLabelBox
              title="Min Price"
              value={!displayMinPrice ? <Skeleton w="100px" h="20px" /> : formatNumber(displayMinPrice, 6, false, Decimal.ROUND_DOWN)}
              wrapStyle={{ w: '50%', alignItems: 'center', padding: '12px 0px', gap: '8px' }}
              titleStyle={{
                color: 'primary_gray'
              }}
            />
            <VTextLabelBox
              title="Max Price"
              value={!displayMaxPrice ? <Skeleton w="100px" h="20px" /> : formatNumber(displayMaxPrice, 6, false, Decimal.ROUND_DOWN)}
              wrapStyle={{ w: '50%', alignItems: 'center', padding: '12px 0px', gap: '8px' }}
              titleStyle={{
                color: 'primary_gray'
              }}
            />
          </HStack>
        </VStack>
      )}
    </VStack>
  )
}
