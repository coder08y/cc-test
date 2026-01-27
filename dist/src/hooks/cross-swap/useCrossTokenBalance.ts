import useCrossSwapWalletStore from '@/store/cross-swap/useCrossSwapWallet'
import { useSdk } from '@cetus/sdk-factory'
import { Chain, CrossSwapPlatform, CrossSwapToken } from '@cetusprotocol/cross-swap-sdk'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

const defaultRefetchInterval = 30_000

export const useTokenBalance = (platform: CrossSwapPlatform, selectedChain?: Chain, token?: CrossSwapToken, accountAddress?: string) => {
  const crossSwapSdk = useSdk('crossSwap')
  const { setTokenBalances, getTokenBalance, clearTokenBalances, balanceCache } = useCrossSwapWalletStore()

  const tokenBalanceQueryKey = useMemo(
    () => ['token-balance', accountAddress, token?.chain_id, token?.address] as const,
    [token?.address, selectedChain?.id, accountAddress]
  )

  const { data, isLoading, refetch } = useQuery({
    queryKey: tokenBalanceQueryKey,
    queryFn: async ({ queryKey: [, accountAddress, tokenChainId, tokenAddress] }) => {
      if (tokenChainId === undefined || !accountAddress || tokenAddress === undefined) {
        throw new Error('Missing required parameters: tokenChainId or accountAddress')
      }

      const tokensWithBalance = await crossSwapSdk!.getOwnerTokenBalances(platform, accountAddress!, [token!])

      if (tokensWithBalance.length > 0) {
        setTokenBalances(tokensWithBalance, accountAddress!)
      } else {
        clearTokenBalances(tokenAddress, accountAddress!, tokenChainId)
      }

      const tokenBalance = tokensWithBalance.find(
        tokenBalance => tokenBalance.chain_id === token?.chain_id && tokenBalance.address === token?.address
      )

      console.log('useTokenBalance tokensWithBalance  :', {
        tokensWithBalance,
        tokenChainId,
        accountAddress,
        tokenAddress,
        tokenBalance
      })

      return tokenBalance || null
    },

    enabled: Boolean(accountAddress && token && crossSwapSdk !== null),
    refetchInterval: defaultRefetchInterval,
    staleTime: defaultRefetchInterval
  })

  const tokenBalance = useMemo(() => {
    if (!token || !accountAddress) return undefined
    return getTokenBalance(token, accountAddress)
  }, [token?.address, token?.chain_id, accountAddress, balanceCache])

  return {
    isLoading,
    refetch,
    tokenBalance
  }
}
