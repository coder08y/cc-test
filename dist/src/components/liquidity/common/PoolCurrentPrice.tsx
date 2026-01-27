import { PoolApiInfo } from '@/types'
import { DLMMPoolApiInfo } from '@/types/pool'
import { Icon } from '@cetus/ui-kit'
import { formatNumberWithDown } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'

type PoolType = 'clmm' | 'dlmm'

interface PoolCurrentPriceProps {
  poolType?: PoolType
  // CLMM props
  clmmPoolInfo?: PoolApiInfo | null
  clmmPriceData?: {
    currentPrice?: string | number
    reverseCurrentPrice?: string | number
  }
  // DLMM props
  dlmmPoolInfo?: DLMMPoolApiInfo | null
  dlmmCurrentPrice?: string | number
  dlmmReverseCurrentPrice?: string | number
  // Common props
  priceDirect: boolean
  onPriceDirectChange: (value: boolean) => void
}

export default function PoolCurrentPrice({
  poolType = 'clmm',
  clmmPoolInfo,
  clmmPriceData,
  dlmmPoolInfo,
  dlmmCurrentPrice,
  dlmmReverseCurrentPrice,
  priceDirect,
  onPriceDirectChange
}: PoolCurrentPriceProps) {
  // 获取当前池子信息
  const poolInfo = poolType === 'clmm' ? clmmPoolInfo : dlmmPoolInfo
  if (!poolInfo) {
    return null
  }

  // 截断Token名称，超过8个字符显示省略号
  const truncateTokenSymbol = (symbol?: string) => {
    if (!symbol) return ''
    return symbol.length > 8 ? `${symbol.slice(0, 8)}...` : symbol
  }

  // 计算价格
  let price: string | number | undefined
  let priceLabel: string

  if (poolType === 'clmm') {
    price = priceDirect
      ? poolInfo?.isReverse
        ? clmmPriceData?.reverseCurrentPrice
        : clmmPriceData?.currentPrice
      : poolInfo?.isReverse
        ? clmmPriceData?.currentPrice
        : clmmPriceData?.reverseCurrentPrice

    priceLabel = priceDirect
      ? `${truncateTokenSymbol(poolInfo?.displayTokenB?.symbol)} per ${truncateTokenSymbol(poolInfo?.displayTokenA?.symbol)}`
      : `${truncateTokenSymbol(poolInfo?.displayTokenA?.symbol)} per ${truncateTokenSymbol(poolInfo?.displayTokenB?.symbol)}`
  } else {
    // DLMM
    price = poolInfo?.isReverse
      ? priceDirect
        ? dlmmReverseCurrentPrice
        : dlmmCurrentPrice
      : priceDirect
        ? dlmmCurrentPrice
        : dlmmReverseCurrentPrice

    priceLabel = priceDirect
      ? `${truncateTokenSymbol(poolInfo?.displayTokenB?.symbol)} per ${truncateTokenSymbol(poolInfo?.displayTokenA?.symbol)}`
      : `${truncateTokenSymbol(poolInfo?.displayTokenA?.symbol)} per ${truncateTokenSymbol(poolInfo?.displayTokenB?.symbol)}`
  }

  // 格式化价格
  const formattedPrice = formatNumberWithDown(price, 6, true).toString()

  return (
    <VStack flex="1" align="flex-end" gap="2px">
      <Text fontSize="14px" color="text_caption">
        {formattedPrice}
      </Text>
      <HStack gap="4px" mr="-4px">
        <Text fontSize="12px">{priceLabel}</Text>
        <Icon xlinkHref="#icon-icon_swap1" svgW="16px" svgH="16px" onClick={() => onPriceDirectChange(!priceDirect)} />
      </HStack>
    </VStack>
  )
}
