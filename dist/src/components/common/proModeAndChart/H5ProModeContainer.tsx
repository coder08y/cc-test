import ProChart from '@/components/chart/ProChart'
import ProModeCoinInfo from '@/components/common/proModeAndChart/ProModeCoinInfo'
import { ProModeTradeTab } from '@/components/common/proModeAndChart/ProModeTradeTab'
import { Token } from '@cetus/types'
import { VStack } from '@chakra-ui/react'
import { ReactNode } from 'react'

interface H5ProModeLayoutProps {
  // 图表相关
  onCoinSelect: (item: any) => void
  handleToggleDirect: () => void
  showTokenInfo?: Token
  coinBvPriceUnit: string

  // Coin Info 相关
  whiteTokenList?: any[]

  // 交易区域内容
  children: ReactNode
}

export function H5ProModeContainer({
  onCoinSelect,
  handleToggleDirect,
  showTokenInfo,
  coinBvPriceUnit,
  whiteTokenList = [],
  children
}: H5ProModeLayoutProps) {
  return (
    <VStack w="100%" gap="0px" align="stretch">
      {/* 上方：图表区域 */}
      <ProChart onCoinSelect={onCoinSelect} handleToggleDirect={handleToggleDirect} token={showTokenInfo} tokenPriceUnit={coinBvPriceUnit} />

      {/* 中间：交易区域 */}
      {children}

      {/* 下方：Coin Info 区域 */}
      <VStack w="100%" py="8px" gap="16px">
        <ProModeCoinInfo handleToggleDirect={handleToggleDirect} onCoinSelect={onCoinSelect} whiteTokenList={whiteTokenList} />
      </VStack>

      {/* 最下方：交易相关信息 */}
      <VStack w="100%" py="8px" gap="16px">
        <ProModeTradeTab />
      </VStack>
    </VStack>
  )
}
