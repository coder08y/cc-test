import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { HStack, VStack } from '@chakra-ui/react'
import { LiquidityInfoPieChart } from '../chart/LiquidityInfoPieChart'
import TokenAmountAndAfter from './TokenAmountAndAfter'

type LiquidityInfoAndAfterProps = {
  displayTokenA: Token
  displayTokenB: Token
  displayTokenAmountA: string
  displayTokenAmountB: string
  isLoading?: boolean
}

export default function LiquidityInfoAndAfter(props: LiquidityInfoAndAfterProps) {
  const { displayTokenA, displayTokenB, displayTokenAmountA, displayTokenAmountB } = props
  const { isApp } = useWindowWidth()

  return (
    <HStack width="100%" justifyContent="space-between">
      <VStack justifyContent="flex-start" alignItems="flex-start" gap="24px">
        <TokenAmountAndAfter isBase={true} token={displayTokenA} amount={displayTokenAmountA} afterAmount={'1'} />
        <TokenAmountAndAfter isBase={false} token={displayTokenB} amount={displayTokenAmountB} afterAmount={'2'} />
      </VStack>
      <LiquidityInfoPieChart percentage={40} size={108} usedColor="#00D8B6" remainingColor="#4A9AEF" gapAngle={6} />
    </HStack>
  )
}
