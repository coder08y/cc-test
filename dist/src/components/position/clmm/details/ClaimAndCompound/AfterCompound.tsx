import usePositionStore from '@/store/position'
import usePositionCompoundStore from '@/store/position/compound'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { Icon } from '@cetus/ui-kit'
import { d, fixDown, formatCurrency, formatPercentage } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import DailyYield from '../DailyYield'

function AfterCompound() {
  const { currentPosBaseInfo, posLiquidityData } = usePositionStore()
  const { compoundValue } = usePositionCompoundStore()
  const { getTokenAmountValue } = useTokenPrice()

  const currentPosData = posLiquidityData[currentPosBaseInfo?.posId]

  // 基础持仓价值
  const amountValueA = getTokenAmountValue(currentPosBaseInfo?.displayTokenA?.coin_type, currentPosData?.displayCoinAmountA, '--')
  const amountValueB = getTokenAmountValue(currentPosBaseInfo?.displayTokenB?.coin_type, currentPosData?.displayCoinAmountB, '--')

  // 当前持仓价值（美元）
  const amountValue = useMemo(() => {
    if (amountValueA !== '--' && amountValueB !== '--') {
      return d(amountValueA).plus(amountValueB).toString()
    } else {
      return '--'
    }
  }, [amountValueA, amountValueB])

  const [ratio, setRatio] = useState('')

  // 计算 afterPositionValue（复投后持仓价值）
  const afterPositionValue = useMemo(() => {
    if (amountValueA === '--' || amountValueB === '--') return '--'

    const beforeValue = fixDown(d(amountValueA).plus(amountValueB).toString(), 2)

    if (!compoundValue) {
      return '--'
    }

    const afterValue = d(beforeValue).plus(compoundValue).toString()

    return afterValue
  }, [amountValueA, amountValueB, compoundValue])

  // 单独计算 ratio（收益比例），放在 useEffect 中
  useEffect(() => {
    if (amountValue === '--' || afterPositionValue === '--') {
      setRatio('0')
      return
    }
    const ratioValue = d(afterPositionValue).div(amountValue).sub(1).mul(100).toString()
    setRatio(ratioValue)
  }, [amountValue, afterPositionValue])

  return (
    <VStack gap="16px" w="100%" align="flex-start" bg="rgba(180,216,240,0.06)" borderRadius="12px" p={{ base: '16px 12px', lg: '20px 16px' }}>
      <Text color="text_caption" fontSize="16px">
        After Compound
      </Text>
      <VStack w="100%" align="flex-start">
        <Text fontSize="12px">Position Value</Text>
        <HStack gap="4px">
          <Text fontSize="16px" color="text_caption">
            {formatCurrency(amountValue, 2)}
          </Text>
          <Icon xlinkHref="#icon-detail" fontSize="12px" opacity="0.6" svgHover="text_paragraph" />
          <Icon xlinkHref="#icon-detail" fontSize="12px" svgHover="text_paragraph" ml="-11px" />
          <Text fontSize="16px" color="text_caption">
            {formatCurrency(afterPositionValue, 2)}
          </Text>
          <Text fontSize="12px" color="primary_green">
            (+{formatPercentage(ratio, 2)})
          </Text>
        </HStack>
      </VStack>
      <DailyYield totalYield={afterPositionValue} afterRatio={ratio} />
    </VStack>
  )
}

export default AfterCompound
