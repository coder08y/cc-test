import { CrossSwapPlatform } from '@cetusprotocol/cross-swap-sdk'
import { HStack } from '@chakra-ui/react'
import Slippage from '../common/Slippage'
import FreshProgressV2 from '../swap/FreshProgressV2'
import CrossSwapHistory from './CrossSwapHistory'

interface CrossTradeHeaderProps {
  fromChainAddress?: string
  platform: CrossSwapPlatform
  setIsOpenHistoryModal: (isOpen: boolean) => void
  progressRef: any
  handleRefresh: () => void
}

export function CrossTradeHeader(props: CrossTradeHeaderProps) {
  const { fromChainAddress, setIsOpenHistoryModal, progressRef, handleRefresh, platform } = props
  return (
    <HStack>
      {/* 历史记录 */}
      {fromChainAddress && <CrossSwapHistory onClick={() => setIsOpenHistoryModal(true)} />}
      {/* 滑点 */}
      <Slippage slippageType="cross" maxSlippage={platform === CrossSwapPlatform.MAYAN ? 50 : 50} />
      {/* 进度条 */}
      <FreshProgressV2 callbackInterval={30} ref={progressRef} min={0} max={30} onClick={handleRefresh} />
    </HStack>
  )
}
