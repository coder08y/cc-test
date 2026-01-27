import { CrossSwapHistoryItem } from '@/types/cross_swap'
import { useSdk } from '@cetus/sdk-factory/src/useSdk'
import { ChainId, CrossSwapPlatform, CrossSwapToken } from '@cetusprotocol/cross-swap-sdk'
import { FullStatusData, getTransactionHistory } from '@lifi/sdk'
import { addresses } from '@mayanfinance/swap-sdk'
import { useQuery } from '@tanstack/react-query'
import { buildLifiRouteFromTxHistory, buildMayanRouteFromTxHistory } from './useCrossHelper'
import { useCrossToken } from './useCrossToken'

const defaultRefetchInterval = 32_000

/**
 * 获取跨链交易历史
 * @param platform
 * @param walletAddress
 * @param enabled
 * @returns
 */
export const useCrossTradeHistory = (platform: CrossSwapPlatform, walletAddress?: string, enabled: boolean = true) => {
  const crossSwapSdk = useSdk('crossSwap')
  const { getCrossToken } = useCrossToken()
  const {
    data: historyList,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['transaction-history', walletAddress, platform],
    queryFn: async ({ queryKey: [, accountAddress, platform], signal }) => {
      const list: CrossSwapHistoryItem[] = []
      if (!accountAddress) {
        return list
      }
      if (platform === CrossSwapPlatform.MAYAN) {
        try {
          const res = await fetch(`${addresses.EXPLORER_URL}/swaps/trader?trader=${accountAddress}&limit=50&offset=0`)
          const data = await res.json()
          const foundTokenMap: Record<string, CrossSwapToken | undefined> = {}
          for (const item of data.data) {
            try {
              const info = await buildMayanRouteFromTxHistory(
                item,
                (chainId: number) => {
                  return crossSwapSdk!.getChain(CrossSwapPlatform.MAYAN, Number(chainId) as ChainId)
                },
                async (chainId: ChainId, tokenAddress: string) => {
                  const key = `${chainId}_${tokenAddress}`

                  let token: CrossSwapToken | undefined = foundTokenMap[key]
                  if (foundTokenMap.hasOwnProperty(key)) {
                    return token
                  }

                  token = (await getCrossToken(platform, chainId, tokenAddress)) || undefined
                  foundTokenMap[key] = token
                  return token
                }
              )

              list.push(info)
            } catch (error) {
              console.error('useCrossTradeHistory mayan error', error)
            }
          }
        } catch (error) {
          console.error('useCrossTradeHistory mayan error', error)
        }
      } else {
        const date = new Date()
        date.setFullYear(date.getFullYear() - 10)
        const response = await getTransactionHistory(
          {
            wallet: accountAddress,
            fromTimestamp: Math.floor(date.getTime() / 1000),
            toTimestamp: Math.floor(Date.now() / 1000),
            status: 'ALL'
          },
          { signal }
        )
        response.transfers.forEach(item => {
          try {
            const info = buildLifiRouteFromTxHistory(item as FullStatusData, (chainId: number) => {
              return crossSwapSdk!.getChain(CrossSwapPlatform.LI_FI, Number(chainId) as ChainId)
            })
            list.push(info)
          } catch (error) {
            console.error('useCrossTradeHistory lifi error', error)
          }
        })
      }
      console.log('useCrossTradeHistory historyList', list)

      return list
    },
    enabled: Boolean(walletAddress && enabled),
    refetchInterval: 30_000,
    staleTime: defaultRefetchInterval
  })

  return {
    historyList,
    isLoading,
    refetch
  }
}
