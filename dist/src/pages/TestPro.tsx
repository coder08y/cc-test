import useGetApiData from '@/hooks/pro/useGetApiData'
import useProData from '@/hooks/pro/useProData'
import useProStore from '@/store/pro/index'
import { Button, VStack } from '@chakra-ui/react'
import { useEffect } from 'react'

export default function TestDca() {
  const {
    getCoinDexPools,
    getCoinTransactionBlocks,
    getCoinMarketData,
    getCoinDetail,
    getTopHolders,
    getCoinTrades,
    getCoinBvPrice,
    getProTokenListInModal
  } = useGetApiData()
  const { getCoinRelatedData } = useProData()
  const { coinDetail, coinMarketData, topHolders, coinDexPools, coinTransactionBlocks, coinTrades, coinBvPrice, proTokenList } = useProStore()
  const coinType = '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI'

  useEffect(() => {
    console.log('🚀 ~ TestDca useEffect ~ coinDetail:', coinDetail)
    console.log('🚀 ~ TestDca useEffect ~ coinMarketData:', coinMarketData)
    console.log('🚀 ~ TestDca useEffect ~ topHolders:', topHolders)
  }, [coinDetail, coinMarketData, topHolders])

  useEffect(() => {
    console.log('🚀 ~ TestDca useEffect ~ coinDexPools:', coinDexPools)
  }, [coinDexPools])

  useEffect(() => {
    console.log('🚀 ~ TestDca useEffect ~ coinTransactionBlocks:', coinTransactionBlocks)
  }, [coinTransactionBlocks])

  useEffect(() => {
    console.log('🚀 ~ TestDca useEffect ~ coinTrades:', coinTrades)
  }, [coinTrades])

  useEffect(() => {
    console.log('🚀 ~ TestDca useEffect ~ coinBvPrice:', coinBvPrice)
  }, [coinBvPrice])

  useEffect(() => {
    console.log('🚀 ~ TestDca useEffect ~ proTokenList:', proTokenList)
  }, [proTokenList])

  return (
    <VStack>
      <Button onClick={() => getCoinDexPools({ coinType, hideSmallPools: true })}>getDexPools</Button>
      <Button onClick={() => getCoinTransactionBlocks(coinType)}>getCoinTransactionBlocks</Button>
      <Button onClick={() => getCoinMarketData(coinType)}>getCoinMarketData</Button>
      <Button onClick={() => getCoinDetail(coinType)}>getCoinDetail</Button>
      <Button onClick={() => getTopHolders(coinType)}>getTopHolders</Button>
      <Button onClick={() => getCoinTrades({ coinType })}>getCoinTrades</Button>
      <Button onClick={() => getCoinRelatedData(coinType)}>getCoinRelatedData</Button>
      <Button onClick={() => getCoinBvPrice(coinType)}>getCoinBvPrice</Button>
      <Button onClick={() => getProTokenListInModal('change_percentage')}>getProTokenListInModal</Button>
    </VStack>
  )
}
