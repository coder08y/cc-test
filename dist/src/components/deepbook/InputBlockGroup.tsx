import useGetOrderBestPrice from '@/hooks/deepbook/useGetOrderBestPrice'
import useGlobalStore from '@/store/common/global'
import useDeepBookStore from '@/store/deepbook'
import { d, formatNumber, formatNumberWithDown } from '@cetus/utils'
import { CoinAssist } from '@cetusprotocol/deepbook-utils'
import { Box, Slider, SliderFilledTrack, SliderMark, SliderThumb, SliderTrack, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import InputBlock from './InputBlock'

export type InputBlockProps = {
  title: string
  symbol: string
  value: string
  onChange: (value: string) => void
  isMarket?: boolean
  decimals?: number
  onUserInput?: () => void // 用户手动输入时的回调
}

type InputBlockGroupProps = {
  from: InputBlockProps
  to: InputBlockProps
  isShowOrderVolumeError?: boolean
  minSize?: string
  isMarket?: boolean
  maxAvailable?: string
  tradeType?: 'Buy' | 'Sell'
  price?: string
  maxFee?: string
  tradeAssetCoinType?: string
}

export const ErrorMessage = ({ text }: { text: string }) => {
  return (
    <VStack
      w="100%"
      p="4px 8px"
      lineHeight={'20px'}
      borderRadius="6px"
      bg="primary_yellow_opacity.10"
      justifyContent="flex-end"
      alignItems={'flex-start'}
    >
      <Text lineHeight="20px" fontSize="12px" color="primary_yellow">
        {text}
      </Text>
    </VStack>
  )
}

export const OrderVolumeError = ({
  minSize,
  baseSymbol,
  insufficientBalance
}: {
  minSize: string
  baseSymbol: string
  insufficientBalance?: boolean
}) => {
  return (
    <ErrorMessage
      text={insufficientBalance ? 'Insufficient DEEP to cover the fee' : `Order volume must be greater than ${formatNumber(minSize)} ${baseSymbol}`}
    />
  )
}

export const LotSizeError = ({
  lotSize,
  inputAmount,
  baseSymbol
}: {
  lotSize: string
  inputAmount: string
  baseSymbol: string
}) => {
  return (
    <ErrorMessage
      text={`Amount must be a multiple of ${lotSize}, for example ${d(formatNumberWithDown(d(inputAmount).div(d(lotSize)).toString(), 0, true))
        .mul(lotSize)
        .toString()} ${baseSymbol}`}
    />
  )
}

export default function InputBlockGroup(props: InputBlockGroupProps) {
  const { from, to, isMarket, maxAvailable = '0', tradeType = 'Buy', price = '0', maxFee = '0', tradeAssetCoinType } = props

  const { getOrderBestPrice } = useGetOrderBestPrice()
  const { deepBookSlippage } = useGlobalStore()
  const { deepbookPrice, orderType } = useDeepBookStore()

  const [slideValue, setSlideValue] = useState<number>(0) // 0-100 百分比
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const prevMaxAmountRef = useRef<number>(0) // 用于跟踪 maxAmountInBaseToken 的变化

  // 当交易类型切换或交易对切换时，重置滑块值和输入值
  useEffect(() => {
    setSlideValue(0)
    to.onChange('')
  }, [tradeType, from.symbol, to.symbol])

  // 判断交易资产是否是 SUI
  const isSuiCoin = useMemo(() => {
    return tradeAssetCoinType ? CoinAssist.isSuiCoin(tradeAssetCoinType) : false
  }, [tradeAssetCoinType])

  // 计算真实的最大可输入数量（Amount in base token）
  const maxAmountInBaseToken = useMemo(() => {
    const amountDecimals = to.decimals || 0
    if (tradeType === 'Buy') {
      // Buy: 需要将 quote available 转换为可购买的 base 数量
      // 如果 quote 资产是 SUI，需要额外预留 gas
      const gasReserve = isSuiCoin ? 0.05 : 0
      let availableAfterFee = d(maxAvailable)
        .sub(d(maxFee || '0'))
        .sub(gasReserve)

      const priceNum =
        orderType === 'Market' ? d(Number(getOrderBestPrice('bid')) || deepbookPrice?.price || '0').mul(d(1).plus(deepBookSlippage)) : d(price)

      if (priceNum.gt(0) && availableAfterFee.gt(0)) {
        const rawAmount = availableAfterFee.div(priceNum).toString()
        // 按精度向下舍入
        const formattedAmount = formatNumberWithDown(rawAmount, amountDecimals, true)
        return d(formattedAmount).toNumber()
      }
      return 0
    } else {
      // Sell: available 本身就是 base token 数量
      let availableAfterFee = d(maxAvailable).sub(d(maxFee || '0'))

      // 如果是 SUI，需要额外预留 0.05 作为 gas
      const gasReserve = isSuiCoin ? 0.05 : 0
      availableAfterFee = availableAfterFee.sub(gasReserve)

      if (availableAfterFee.lte(0)) {
        return 0
      }

      // 从总余额中精确减去费用和 gas 后按精度向下舍入
      const preciseAmount = d(maxAvailable)
        .sub(d(maxFee || '0'))
        .sub(gasReserve)
        .toString()
      const formattedAmount = formatNumberWithDown(preciseAmount, amountDecimals, true)
      return d(formattedAmount).toNumber()
    }
  }, [maxAvailable, tradeType, deepbookPrice?.price, price, orderType, maxFee, to.decimals, isSuiCoin])

  // 当手动输入 amount 时，同步更新 slider 位置
  useEffect(() => {
    // 拖拽过程中不更新（避免循环）
    if (isDragging) return

    const inputValue = d(to.value || '0').toNumber()

    if (maxAmountInBaseToken <= 0) {
      // 未连接钱包时，保持滑竿位置不变，不根据输入值重置
      // 这样用户拖动滑竿后，即使没有可用资产，滑竿也能停留在拖动位置
      return
    }

    // 计算百分比
    const percentage = (inputValue / maxAmountInBaseToken) * 100

    // 如果输入值超过最大值，显示 100%
    if (percentage >= 100) {
      setSlideValue(100)
    } else {
      setSlideValue(percentage)
    }
  }, [to.value, maxAmountInBaseToken, isDragging])

  // 当 maxAmountInBaseToken 从 0 变为大于 0 时（钱包连接后），重置滑竿
  useEffect(() => {
    // 拖拽过程中不重置
    if (isDragging) return
    // 检测从无可用资产变为有可用资产的情况（钱包连接后）
    if (prevMaxAmountRef.current === 0 && maxAmountInBaseToken > 0) {
      setSlideValue(0)
      to.onChange('')
    }
    // 更新 ref
    prevMaxAmountRef.current = maxAmountInBaseToken
  }, [maxAmountInBaseToken, isDragging, to])

  const marks = useMemo(() => {
    return [0, 25, 50, 75, 100] // 百分比标记点
  }, [])

  const handleSliderChange = useCallback((value: number) => {
    setSlideValue(value)
  }, [])

  const handleSliderChangeEnd = useCallback(() => {
    setIsDragging(false)
    // 如果没有可用资产，不更新输入框，但保持滑竿位置
    if (maxAmountInBaseToken <= 0) {
      return
    }
    // 根据百分比计算实际金额
    const actualAmount = (slideValue / 100) * maxAmountInBaseToken
    // 按精度向下舍入后回填
    const formattedValue = formatNumberWithDown(actualAmount.toString(), to.decimals || 0, true)
    to.onChange(formattedValue)
  }, [slideValue, to, maxAmountInBaseToken])

  const handleSliderChangeStart = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMarkClick = useCallback(
    (percentage: number) => {
      setSlideValue(percentage)
      // 如果没有可用资产，不更新输入框
      if (maxAmountInBaseToken <= 0) {
        return
      }
      // 根据百分比计算实际金额
      const actualAmount = (percentage / 100) * maxAmountInBaseToken
      // 按精度向下舍入后回填
      const formattedValue = formatNumberWithDown(actualAmount.toString(), to.decimals || 0, true)
      to.onChange(formattedValue)
    },
    [to, maxAmountInBaseToken]
  )

  return (
    <VStack w="100%" borderRadius="8px" bg={{ base: 'transparent', lg: 'bg_secondary' }} position="relative" zIndex="5" gap="12px">
      <InputBlock {...from} isMarket={isMarket} />
      <InputBlock {...to} />
      <Box p="0 8px 0 4px" w="100%" h={'14px'}>
        <Slider
          aria-label="assets-info-slider"
          min={0}
          max={100}
          step={0.1}
          focusThumbOnChange={false}
          value={slideValue}
          onChange={handleSliderChange}
          onChangeStart={handleSliderChangeStart}
          onChangeEnd={handleSliderChangeEnd}
        >
          {marks.map((percentage, index) => (
            <SliderMark
              key={`mark-${index}`}
              value={percentage}
              ml="-1.5px"
              mt="-4px"
              w="8px"
              h="8px"
              zIndex="100"
              borderRadius="50%"
              bg={slideValue >= percentage && slideValue > 0 ? 'primary' : '#0F0F0F'}
              border={slideValue >= percentage && slideValue > 0 ? '1px solid primary' : '1px solid #2A3238'}
              cursor="pointer"
              transition="all 0.2s"
              onClick={() => handleMarkClick(percentage)}
            />
          ))}
          <SliderTrack h="2px" bg="#23252C">
            <SliderFilledTrack h="2px" bg={'primary'} />
          </SliderTrack>
          {isDragging && (
            <SliderMark
              value={slideValue}
              textAlign="center"
              bg="#0F0F0F"
              border="1px solid #2A3238"
              p="4px 6px"
              borderRadius="4px"
              fontSize="12px"
              color="primary"
              mt="-32px"
              ml="-18px"
              zIndex="1000001"
            >
              {Math.round(slideValue)}%
            </SliderMark>
          )}
          <SliderThumb
            w="12px"
            h="12px"
            bg="primary"
            border="0"
            ml="2px"
            zIndex="101"
            sx={{ '&:before': { w: '8px', h: '8px', ml: '-4px', mt: '-4px' } }}
          />
        </Slider>
      </Box>
    </VStack>
  )
}
