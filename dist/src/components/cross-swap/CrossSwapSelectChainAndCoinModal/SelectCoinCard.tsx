import { useGetChainAddress } from '@/hooks/cross-swap/useCrossHelper'
import useCrossPriceBatch from '@/hooks/cross-swap/useCrossPriceBatch'
import { useCrossTokenBalances } from '@/hooks/cross-swap/useCrossTokenBalances'
import useSelectChainCoin from '@/hooks/cross-swap/useSelactChainCoin'
import useCrossSwapWalletStore from '@/store/cross-swap/useCrossSwapWallet'
import { WarpTokenBalance } from '@/types/cross_swap'
import { SearchInput } from '@cetus/design/src/components/common/tokenSelectModal/SearchInput'
import { d } from '@cetusprotocol/common-sdk'
import { Chain, CrossSwapPlatform, CrossSwapToken } from '@cetusprotocol/cross-swap-sdk'
import { Box, Flex, HStack, Skeleton, SkeletonCircle, VStack } from '@chakra-ui/react'
import { Suspense, useEffect, useMemo } from 'react'
import CoinList from './CoinList'

type SelectChainCard = {
  selectCoin: (token: CrossSwapToken) => void
  crossPlatform: CrossSwapPlatform
  currentChain?: Chain
  currentToken?: CrossSwapToken
  isFrom: boolean
}
export default function SelectCoinCard(props: SelectChainCard) {
  const { selectCoin, currentChain, crossPlatform, currentToken, isFrom } = props
  const { inputValue, handleInputChange, coinList, isLoading, originalCoinList } = useSelectChainCoin(crossPlatform, currentChain?.id)

  const { address: chainAddress } = useGetChainAddress(currentChain, isFrom, true)
  const { isBalanceLoading, balanceCoinList } = useCrossTokenBalances(crossPlatform, coinList, currentChain, chainAddress)
  const { getTokenBalance, balanceCache } = useCrossSwapWalletStore()

  const { getCachedPrice, loading: isPriceLoading } = useCrossPriceBatch(crossPlatform, balanceCoinList, true, true)

  const sortedCoinList = useMemo(() => {
    if (!coinList || coinList.length === 0) return []

    const listToSort: WarpTokenBalance[] = [...coinList]

    listToSort.sort((a, b) => {
      const balanceA = chainAddress ? getTokenBalance(a, chainAddress) : undefined
      const balanceB = chainAddress ? getTokenBalance(b, chainAddress) : undefined

      // 获取balance_usd和balance_formatted
      let balanceUsdA = parseFloat(balanceA?.balance_usd || '0')
      let balanceUsdB = parseFloat(balanceB?.balance_usd || '0')
      if (balanceA && balanceUsdA === 0) {
        const coinAPrice = getCachedPrice(a)
        if (coinAPrice) {
          a.price_usd = coinAPrice.toString()
          balanceA.balance_usd = d(coinAPrice)
            .mul(balanceA.balance_formatted || '0')
            .toString()

          balanceUsdA = parseFloat(balanceA.balance_usd || '0')
        }
      }

      if (balanceB && balanceUsdB === 0) {
        const coinBPrice = getCachedPrice(b)
        if (coinBPrice) {
          b.price_usd = coinBPrice.toString()
          balanceB.balance_usd = d(coinBPrice)
            .mul(balanceB.balance_formatted || '0')
            .toString()
        }
      }

      const balanceFormattedA = parseFloat(balanceA?.balance_formatted || '0')
      const balanceFormattedB = parseFloat(balanceB?.balance_formatted || '0')

      a.balance = balanceA
      b.balance = balanceB

      // 优先按照balance_usd排序
      if (balanceUsdA > 0 || balanceUsdB > 0) {
        if (balanceUsdA === balanceUsdB) {
          return 0
        }
        return balanceUsdB - balanceUsdA
      }

      // 若balance_usd没值，则按照balance_formatted排序
      if (balanceFormattedA > 0 || balanceFormattedB > 0) {
        if (balanceFormattedA === balanceFormattedB) {
          return 0
        }
        return balanceFormattedB - balanceFormattedA
      }

      // 若balance_formatted也没值，则按照原来的balance排序
      const numBalanceA = parseFloat(balanceA?.balance || '0')
      const numBalanceB = parseFloat(balanceB?.balance || '0')

      if (numBalanceA === numBalanceB) {
        return 0
      }

      return numBalanceB - numBalanceA
    })

    if (currentToken) {
      const currentTokenIndex = listToSort.findIndex(token => token.address === currentToken.address)
      if (currentTokenIndex > 0) {
        const [currentTokenItem] = listToSort.splice(currentTokenIndex, 1)
        listToSort.unshift(currentTokenItem)
      }
    }

    return listToSort
  }, [coinList, balanceCache, isBalanceLoading, currentToken, chainAddress, isPriceLoading])

  useEffect(() => {
    handleInputChange('')
  }, [originalCoinList])

  return (
    <VStack w="100%" mt="20px">
      <Box w="100%" p="0 16px">
        <SearchInput
          placeholder="Search by token or address"
          inputValue={inputValue}
          changeInputValue={(value: string) => handleInputChange(value)}
        />
      </Box>
      <Suspense
        fallback={
          <Flex marginTop="16px" flexDirection="column">
            {[...Array(5)].map((_, index) => (
              <HStack gap="0" key={index} height="64px" padding="0">
                <SkeletonCircle size="9" />
                <VStack gap="4px" ml="4px" align="flex-start">
                  <Skeleton height="4" width="100px" />
                </VStack>
              </HStack>
            ))}
          </Flex>
        }
      >
        <CoinList
          crossPlatform={crossPlatform}
          coinList={sortedCoinList}
          selectCoin={selectCoin}
          isLoading={isLoading}
          isBalanceLoading={isBalanceLoading}
        />
      </Suspense>
    </VStack>
  )
}
