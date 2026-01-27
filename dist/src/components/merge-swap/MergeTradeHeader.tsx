import { HStack } from '@chakra-ui/react'
import Slippage from '../common/Slippage'
import AggregatorMode from '../swap/AggregatorMode'
import FreshProgressV2 from '../swap/FreshProgressV2'

interface MergeTradeHeaderProps {
  progressRef: any
  callbackInterval: number
  handleRefresh: () => void
}

export function MergeTradeHeader(props: MergeTradeHeaderProps) {
  const { progressRef, handleRefresh, callbackInterval } = props
  return (
    <HStack>
      <AggregatorMode showRfqSwitch={false} />
      {/* 滑点 */}
      <Slippage slippageType="merge_swap" showFastMode={false} />
      {/* 进度条 */}
      <FreshProgressV2 callbackInterval={callbackInterval} ref={progressRef} min={0} max={10} onClick={handleRefresh} />
    </HStack>
  )
}
