import ChartLoading from '@/components/chart/ChartLoading'
import TradingViewBvChart from '@/components/tradingViewBvChart'
import H5TradingViewBvChart from '@/components/tradingViewBvChart/h5Index'
// import useProStore from '@/store/pro'
import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { isOKXAndroidApp } from '@cetus/utils'
import { VStack } from '@chakra-ui/react'
import CoinHeader from '../common/proModeAndChart/CoinHeader'

export default function ProChart({
  whiteTokenList,
  onCoinSelect,
  token,
  tokenPriceUnit,
  handleToggleDirect
}: {
  token: Token | undefined
  whiteTokenList?: any
  tokenPriceUnit: string
  onCoinSelect: (item: any) => void
  handleToggleDirect: () => void
}) {
  // const { setCoinBvPrice } = useProStore()
  const handleBvPriceChange = (data: { coinType: string; price: string }) => {
    // if (data?.coinType && data?.price) {
    //   setCoinBvPrice({
    //     coinType: data?.coinType,
    //     // price: formatSmallPrice(data?.price, 16)
    //     price: data?.price
    //   })
    // }
  }
  const { isApp } = useWindowWidth()
  const isOKXInAndroid = isApp && isOKXAndroidApp()
  return (
    <VStack w="100%">
      {isApp && <CoinHeader whiteTokenList={whiteTokenList} onCoinSelect={onCoinSelect} handleToggleDirect={handleToggleDirect} />}
      <Block p="0" overflow="hidden" position="relative" borderRadius="16px" w="100%" h={{ base: '422px', lg: '475px' }}>
        {(!token || tokenPriceUnit === undefined) && <ChartLoading />}
        {token && tokenPriceUnit !== undefined && !isOKXInAndroid && (
          <TradingViewBvChart token={token} tokenPriceUnit={tokenPriceUnit} onChangePrice={handleBvPriceChange} />
        )}
        {token && tokenPriceUnit !== undefined && isOKXInAndroid && (
          <H5TradingViewBvChart token={token} tokenPriceUnit={tokenPriceUnit} onChangePrice={handleBvPriceChange} />
        )}
      </Block>
    </VStack>
  )
}
