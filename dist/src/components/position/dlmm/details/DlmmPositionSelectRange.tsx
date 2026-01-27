import PriceInput from '@/components/liquidity/dlmm/ControlPriceRange/PriceInput'
import { PriceDataType } from '@/hooks/create-pool/useCreateDLMMPool'
import { useMinMaxPriceData } from '@/hooks/dlmm/useDlmmHelper'
import useDlmmPosDetailStore from '@/store/dlmm-position/detail'
import { RangePriceType } from '@/store/dlmm/addDlmmLiquidity'
import { CetusTooltip, ErrorTips } from '@cetus/design'
import { Token } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { removeComma, textEllipses } from '@cetus/utils'
import { BinUtils } from '@cetusprotocol/dlmm-sdk'
import { Box, Center, HStack, RangeSlider, RangeSliderFilledTrack, RangeSliderThumb, RangeSliderTrack, Stack, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

type DlmmPositionSelectRangeProps = {
  baseToken: Token
  quoteToken: Token
  tokenA: Token
  tokenB: Token
  minPriceData: Omit<RangePriceType, 'tokenA' | 'tokenB'>
  maxPriceData: Omit<RangePriceType, 'tokenA' | 'tokenB'>
  handlePriceAction: (type: 'Add' | 'Sub', price: PriceDataType, isMinPrice: boolean) => void
  posMinPrice: string
  posMaxPrice: string
  posMinPriceBinId: number
  posMaxPriceBinId: number
  handleSlider: (binIds: number[]) => void
  isShowError: boolean
  isReverse: boolean
  binStep: number
}
export default function DlmmPositionSelectRange(props: DlmmPositionSelectRangeProps) {
  const {
    baseToken,
    quoteToken,
    minPriceData,
    maxPriceData,
    handlePriceAction,
    posMinPrice,
    posMaxPrice,
    handleSlider,
    isShowError,
    posMinPriceBinId,
    posMaxPriceBinId,
    isReverse,
    binStep,
    tokenA,
    tokenB
  } = props
  const { setMinPriceData, setMaxPriceData } = useDlmmPosDetailStore(state => ({
    setMinPriceData: state.setMinPriceData,
    setMaxPriceData: state.setMaxPriceData
  }))
  const { dlmmPosDetailDirect } = useDlmmPosDetailStore()
  const [isSelectRange, setIsSelectRange] = useState(false)
  const { buildPriceData } = useMinMaxPriceData(tokenA, tokenB, binStep)
  const perText = useMemo(() => {
    return `${textEllipses(dlmmPosDetailDirect ? quoteToken?.symbol : baseToken?.symbol)}/${textEllipses(dlmmPosDetailDirect ? baseToken?.symbol : quoteToken?.symbol)}`
  }, [baseToken?.symbol, quoteToken?.symbol, dlmmPosDetailDirect])

  const rangeSliderValue = useMemo(() => {
    if (minPriceData?.displayPrice && maxPriceData?.displayPrice) {
      if (isReverse) {
        if (dlmmPosDetailDirect) {
          return [maxPriceData.binId * -1, minPriceData.binId * -1]
        } else {
          return [minPriceData.binId, maxPriceData.binId]
        }
      } else {
        if (dlmmPosDetailDirect) {
          return [minPriceData.binId, maxPriceData.binId]
        } else {
          return [maxPriceData.binId * -1, minPriceData.binId * -1]
        }
      }
    }
    return []
  }, [minPriceData?.binId, maxPriceData?.binId, dlmmPosDetailDirect])

  const displayMinBinId = useMemo(() => {
    if (isReverse) {
      if (dlmmPosDetailDirect) {
        return posMaxPriceBinId * -1
      } else {
        return posMinPriceBinId
      }
    } else {
      if (dlmmPosDetailDirect) {
        return posMinPriceBinId
      } else {
        return posMaxPriceBinId * -1
      }
    }
  }, [isReverse, dlmmPosDetailDirect, posMinPriceBinId, posMaxPriceBinId])

  const displayMaxBinId = useMemo(() => {
    if (isReverse) {
      if (dlmmPosDetailDirect) {
        return posMinPriceBinId * -1
      } else {
        return posMaxPriceBinId
      }
    } else {
      if (dlmmPosDetailDirect) {
        return posMaxPriceBinId
      } else {
        return posMinPriceBinId * -1
      }
    }
  }, [isReverse, dlmmPosDetailDirect, posMinPriceBinId, posMaxPriceBinId])

  // 检查最大值和最小值是否相等
  const isMinMaxEqual = useMemo(() => {
    return displayMinBinId === displayMaxBinId
  }, [displayMinBinId, displayMaxBinId])

  // 调整后的 min 和 max 值，确保滑块有足够的空间
  const adjustedMinBinId = useMemo(() => {
    if (isMinMaxEqual) {
      return displayMinBinId - 10
    }
    return displayMinBinId
  }, [isMinMaxEqual, displayMinBinId])

  const adjustedMaxBinId = useMemo(() => {
    if (isMinMaxEqual) {
      return displayMaxBinId + 10
    }
    return displayMaxBinId
  }, [isMinMaxEqual, displayMaxBinId])

  // 当最大值和最小值相等时，给滑块设置偏移量
  const adjustedRangeSliderValue = useMemo(() => {
    if (isMinMaxEqual && rangeSliderValue.length === 2) {
      // 使用调整后的范围值，确保滑块铺满整个布局
      // 左边滑块显示在最左边，右边滑块显示在最右边
      return [adjustedMinBinId, adjustedMaxBinId]
    }
    return rangeSliderValue
  }, [isMinMaxEqual, rangeSliderValue, adjustedMinBinId, adjustedMaxBinId])

  const displayMinData = useMemo(() => {
    return isReverse !== dlmmPosDetailDirect ? minPriceData : maxPriceData
  }, [minPriceData?.price, minPriceData?.reversePrice, maxPriceData?.price, maxPriceData?.reversePrice, isReverse, dlmmPosDetailDirect])

  const displayMaxData = useMemo(() => {
    return isReverse !== dlmmPosDetailDirect ? maxPriceData : minPriceData
  }, [minPriceData?.price, minPriceData?.reversePrice, maxPriceData?.price, maxPriceData?.reversePrice, isReverse, dlmmPosDetailDirect])

  // console.log('🚀 ~ DlmmPositionSelectRange ~ minPriceData:', {
  //   minPriceData,
  //   maxPriceData,
  //   displayMinData,
  //   displayMaxData,
  //   isReverse,
  //   dlmmPosDetailDirect,
  //   posMinPrice,
  //   posMaxPrice,
  //   posMinPriceBinId,
  //   posMaxPriceBinId,
  //   displayMinBinId,
  //   displayMaxBinId,
  //   isSelectRange,
  //   rangeSliderValue
  // })
  const onPriceChange = (data: RangePriceType, value: string) => {
    if (!tokenA || !tokenB || !binStep) return
    const targetPrice = removeComma(value)
    let _binId = BinUtils.getBinIdFromPrice(targetPrice, binStep!, data?.type === 'lower', tokenA?.decimals, tokenB?.decimals)
    console.log(
      {
        _binId,
        data,
        minPriceData,
        maxPriceData,
        targetPrice,
        dlmmPosDetailDirect,
        isReverse,
        posMaxPriceBinId,
        posMinPriceBinId,
        value
      },
      'onPriceChange'
    )

    if (_binId < posMinPriceBinId || _binId > posMaxPriceBinId) {
      _binId = data?.type === 'lower' ? posMinPriceBinId : posMaxPriceBinId
    }

    if (data?.type === 'lower') {
      data.changeCount = data.changeCount ? data.changeCount + 1 : 1
      const minPriceData = buildPriceData(_binId, true)
      if (minPriceData) {
        minPriceData.changeCount = data.changeCount ? data.changeCount + 1 : 1
        setMinPriceData(minPriceData)
      }
    } else {
      data.changeCount = data.changeCount ? data.changeCount + 1 : 1
      const maxPriceData = buildPriceData(_binId, false)
      if (maxPriceData) {
        maxPriceData.changeCount = data.changeCount ? data.changeCount + 1 : 1
        setMaxPriceData(maxPriceData)
      }
    }
  }

  return (
    <VStack mt="8px" w="100%">
      <VStack w="100%">
        <HStack w="100%" justifyContent="space-between">
          <Text color="primary_gray" fontWeight="500">
            Select Range
          </Text>
          <HStack
            gap="4px"
            onClick={() => {
              setIsSelectRange(!isSelectRange)
            }}
            cursor="pointer"
            _hover={{
              svg: {
                fill: 'text_caption'
              }
            }}
          >
            <CetusTooltip
              maxW="280px"
              tooltip={
                <Text fontSize="12px" lineHeight="20px">
                  Customize your price range within position to optimize liquidity efficiency.
                </Text>
              }
            >
              <Center bg="primary_opacity.10" h="24px" borderRadius="12px" p="4px 6px">
                <Text color="primary">Advanced</Text>
              </Center>
            </CetusTooltip>

            <Icon
              xlinkHref="#icon-icon_descending_nor"
              transform={isSelectRange ? 'rotate(180deg)' : 'rotate(0deg)'}
              transition="transform 0.5s"
              fontSize="20px"
            />
          </HStack>
        </HStack>
        {isSelectRange && rangeSliderValue.length > 0 && posMinPrice && posMaxPrice && (
          <VStack w="100%" gap="8px" mt="12px">
            <RangeSlider
              min={adjustedMinBinId}
              max={adjustedMaxBinId}
              step={1}
              value={adjustedRangeSliderValue as number[]}
              onChange={val => {
                console.log(val, 'RangeSlider')
                if (isMinMaxEqual) {
                  return
                } else {
                  // 正常情况下的处理逻辑
                  if (isReverse) {
                    if (dlmmPosDetailDirect) {
                      handleSlider([val[1] * -1, val[0] * -1])
                    } else {
                      handleSlider(val)
                    }
                  } else {
                    if (dlmmPosDetailDirect) {
                      handleSlider(val)
                    } else {
                      handleSlider([val[1] * -1, val[0] * -1])
                    }
                  }
                }
              }}
              colorScheme="teal"
            >
              <RangeSliderTrack bg="bg_secondary">
                <RangeSliderFilledTrack />
              </RangeSliderTrack>
              <RangeSliderThumb index={0} />
              <RangeSliderThumb index={1} />
            </RangeSlider>

            <HStack w="100%" justifyContent="space-between">
              <Text>{posMinPrice}</Text>
              <Text>{posMaxPrice}</Text>
            </HStack>
          </VStack>
        )}
      </VStack>

      {isSelectRange && displayMinData && displayMaxData && (
        <Stack mt="4px" position="relative" flexDir={{ base: 'column', lg: 'row' }} w="100%" gap={{ base: '8px', lg: '16px' }}>
          <Box opacity={1} w={{ base: '100%', lg: '50%' }}>
            <PriceInput
              verifyAction={false}
              title="Min Price"
              perText={perText}
              data={displayMinData}
              direct={dlmmPosDetailDirect !== isReverse}
              loading={false}
              minPrice={posMinPrice}
              maxPrice={posMaxPrice}
              subDisabled={displayMinData?.type === 'lower' ? displayMinData?.binId === posMinPriceBinId : displayMinData?.binId === posMaxPriceBinId}
              addDisabled={displayMinData?.binId === displayMaxData?.binId}
              onPriceChange={onPriceChange}
              handleAddPrice={data => {
                handlePriceAction?.(dlmmPosDetailDirect !== isReverse ? 'Add' : 'Sub', data, true)
              }}
              handleSubPrice={data => {
                handlePriceAction?.(dlmmPosDetailDirect !== isReverse ? 'Sub' : 'Add', data, true)
              }}
            />
          </Box>
          <Box opacity={1} w={{ base: '100%', lg: '50%' }}>
            <PriceInput
              verifyAction={false}
              title="Max Price"
              perText={perText}
              data={displayMaxData}
              direct={dlmmPosDetailDirect !== isReverse}
              loading={false}
              subDisabled={displayMinData.binId === displayMaxData.binId}
              addDisabled={displayMaxData?.type === 'lower' ? displayMaxData?.binId === posMinPriceBinId : displayMaxData?.binId === posMaxPriceBinId}
              minPrice={posMinPrice}
              maxPrice={posMaxPrice}
              onPriceChange={onPriceChange}
              handleAddPrice={data => {
                handlePriceAction?.(dlmmPosDetailDirect !== isReverse ? 'Add' : 'Sub', data, false)
              }}
              handleSubPrice={data => {
                handlePriceAction?.(dlmmPosDetailDirect !== isReverse ? 'Sub' : 'Add', data, false)
              }}
            />
          </Box>
        </Stack>
      )}

      {isShowError && (
        <ErrorTips
          isShowIcon={false}
          tipsFontSize="12px"
          justifyContent="center"
          tips="The max price should be higher than min price."
          p="0 16px"
          h="28px"
          borderRadius="8px"
        />
      )}
    </VStack>
  )
}
