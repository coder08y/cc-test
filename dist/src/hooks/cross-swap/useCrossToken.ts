import useCrossSwapStore from '@/store/cross-swap/useCrossSwap'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useSdk } from '@cetus/sdk-factory'
import { sleepTime } from '@cetus/utils'
import { CrossTokensTable } from '@cetus/utils/src/cross-swap-tokens-table'
import { ChainId, CrossSwapPlatform, CrossSwapToken } from '@cetusprotocol/cross-swap-sdk'
import { useCallback } from 'react'
import { parseFromMayanWithSui } from './useCrossHelper'

export function useCrossToken() {
  const crossSwapSdk = useSdk('crossSwap')
  const { setChainTokenObj, chainTokenObj } = useCrossSwapStore()
  const { getTokenInfo } = useGetToken()

  const fetchChainTokenList = async (platform: CrossSwapPlatform, chainIds: ChainId[]) => {
    // 优先从缓存获取
    const cachedTokenMap: Record<string, CrossSwapToken[]> = {}
    const missingChainIds: ChainId[] = []
    // 检查缓存中是否有所有需要的 chainId
    for (const chainId of chainIds) {
      const cacheKey = `${platform}_${chainId}`
      let cachedTokens: CrossSwapToken[] | undefined = chainTokenObj[cacheKey]
      if (!cachedTokens || cachedTokens.length === 0) {
        // 等待100ms，避免列表闪烁
        await sleepTime(200)
        cachedTokens = (await CrossTokensTable.getAllTokenList(platform, chainId)) || []
        console.log('🚀🚀🚀 ~ fetchChainTokenList ~ chainId:', chainId, cachedTokens)
      }
      if (cachedTokens && cachedTokens.length > 0) {
        cachedTokenMap[cacheKey] = cachedTokens
        setChainTokenObj(cachedTokenMap)
      } else {
        missingChainIds.push(chainId)
      }
    }

    // 如果缓存中有所有数据，直接返回
    if (missingChainIds.length === 0) {
      return cachedTokenMap
    }

    // 缓存中没有的数据，调用 API 获取
    if (missingChainIds.length > 0) {
      try {
        const apiTokens = await crossSwapSdk!.getSupportedTokens(platform, missingChainIds)

        // 更新缓存
        for (const chainId of missingChainIds) {
          const list = apiTokens[chainId]

          const cacheKey = `${platform}_${chainId}`
          if (list) {
            for (const item of list) {
              if (chainId === ChainId.SUI_LI_FI || chainId === ChainId.SUI_MAYAN) {
                const token = await getTokenInfo(item.address)
                parseFromMayanWithSui(item, token || undefined)
              }
            }
            cachedTokenMap[cacheKey] = list
          }
        }
        console.log('🚀🚀🚀 ~ fetchChainTokenList ~ cachedTokens:', {
          cachedTokenMap,
          chainIds
        })

        setChainTokenObj(cachedTokenMap)

        // 更新缓存
        for (const chainId of missingChainIds) {
          const list = apiTokens[chainId]
          if (list && list.length > 0) {
            await CrossTokensTable.setTokenList(platform, chainId, list)
          }
        }
      } catch (error) {
        console.error('Failed to fetch chain tokens:', error)
      }
    }

    return cachedTokenMap
  }

  const fetchChainToken = async (platform: CrossSwapPlatform, chainId: ChainId, tokenAddress: string) => {
    try {
      const token = await crossSwapSdk!.getCrossSwapToken(platform, chainId, tokenAddress)
      if (token && (chainId === ChainId.SUI_LI_FI || chainId === ChainId.SUI_MAYAN)) {
        const data = await getTokenInfo(token.address)
        parseFromMayanWithSui(token, data || undefined)
      }
      return token
    } catch (error) {
      console.error('Failed to fetch chain tokens:', error)
    }
    return undefined
  }

  const getCrossTokenFromCache = useCallback(async (platform: CrossSwapPlatform, chainId: ChainId, tokenAddress: string) => {
    const chainToken = await CrossTokensTable.getTokenByAddress(platform, chainId, tokenAddress)
    return chainToken
  }, [])

  const getCrossToken = async (platform: CrossSwapPlatform, chainId: ChainId, tokenAddress: string) => {
    const cachedToken = await getCrossTokenFromCache(platform, chainId, tokenAddress)
    if (cachedToken) {
      return cachedToken
    }

    if (platform === CrossSwapPlatform.MAYAN) {
      const tokenMap = await fetchChainTokenList(platform, [chainId])
      const cacheKey = `${platform}_${chainId}`
      const tokenList = tokenMap[cacheKey]
      const token = tokenList?.find(token => token.address === tokenAddress)
      return token
    }

    const token = await fetchChainToken(platform, chainId, tokenAddress)
    return token
  }

  return { fetchChainTokenList, getCrossTokenFromCache, getCrossToken }
}
