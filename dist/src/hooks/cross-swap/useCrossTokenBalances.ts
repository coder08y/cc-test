import useCrossSwapWalletStore from '@/store/cross-swap/useCrossSwapWallet'
import { useSdk } from '@cetus/sdk-factory'
import { d } from '@cetusprotocol/common-sdk'
import { Chain, CrossSwapPlatform, CrossSwapToken, isEqualTokenAddress } from '@cetusprotocol/cross-swap-sdk'
import { ChainType } from '@lifi/sdk'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

const defaultRefetchInterval = 32_000

export const useCrossTokenBalances = (
  platform: CrossSwapPlatform,
  tokens: CrossSwapToken[],
  selectedChain?: Chain,
  walletAddress?: string,
  enabled: boolean = true
) => {
  const crossSwapSdk = useSdk('crossSwap')
  const { setTokenBalances } = useCrossSwapWalletStore()

  const isBalanceLoadingEnabled = Boolean(walletAddress) && Boolean(tokens?.length) && Boolean(selectedChain?.id) && crossSwapSdk !== null && enabled

  const {
    data: tokensWithBalance,
    isLoading: isBalanceLoading,
    refetch
  } = useQuery({
    queryKey: ['token-balances', walletAddress, selectedChain?.id, tokens?.length],
    queryFn: async ({ queryKey: [, accountAddress, chain_id] }) => {
      if (chain_id === undefined) {
        throw new Error('Missing required parameters: chain_id')
      }

      console.log('useTokenBalances queryFn  :', accountAddress, tokens, selectedChain?.id)

      const tokensWithBalance = await crossSwapSdk!.getOwnerTokenBalances(platform, walletAddress as string, tokens!)

      console.log('useTokenBalances tokensWithBalance  :', {
        tokensWithBalance,
        accountAddress,
        id: selectedChain?.id
      })

      setTokenBalances(tokensWithBalance, walletAddress as string)

      return tokensWithBalance
    },
    enabled: isBalanceLoadingEnabled,
    refetchInterval: defaultRefetchInterval,
    staleTime: defaultRefetchInterval
  })

  const balanceCoinList = useMemo(() => {
    const list: CrossSwapToken[] = []
    if (!tokensWithBalance) return list

    tokensWithBalance.forEach(item => {
      const token = tokens.find(t => isEqualTokenAddress(t.address, item.address, t.type === ChainType.MVM))
      if (token && d(item.balance).gt(0)) {
        list.push(token)
      }
    })
    return list
  }, [tokensWithBalance, tokens])

  return {
    balanceCoinList,
    tokensWithBalance,
    isBalanceLoading: isBalanceLoading && isBalanceLoadingEnabled,
    refetch
  }
}
