import { useCurrentValue, useDebounceFunction } from '@cetus/hooks'
import { ChainId, CrossSwapPlatform, CrossSwapToken } from '@cetusprotocol/cross-swap-sdk'
import { useEffect, useState } from 'react'
import { useCrossToken } from './useCrossToken'

export default function useSelectChainCoin(platform: CrossSwapPlatform, chainId?: ChainId) {
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [coinList, setCoinList] = useState<CrossSwapToken[]>([])
  const [originalCoinList, setOriginalCoinList] = useState<CrossSwapToken[]>([])
  const { fetchChainTokenList } = useCrossToken()

  const chainIdRef = useCurrentValue(chainId)

  useEffect(() => {
    if (chainId !== undefined && platform) {
      queryChainTokenList(platform, chainId)
    } else {
      setOriginalCoinList([])
      setCoinList([])
      setIsLoading(false)
    }
  }, [chainId])

  const queryChainTokenList = (platform: CrossSwapPlatform, chainId: ChainId) => {
    setIsLoading(true)
    setOriginalCoinList([])
    setCoinList([])
    fetchChainTokenList(platform, [chainId])
      .then(res => {
        const cacheKey = `${platform}_${chainId}`
        const _coinList = res[cacheKey] || []

        if (chainId === chainIdRef.current) {
          setOriginalCoinList([..._coinList])
          setCoinList([..._coinList])
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  const searchChainToken = (keyword: string) => {
    return originalCoinList.filter(ele => {
      return (
        ele.name.toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) > -1 ||
        ele.symbol.toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) > -1 ||
        ele.address.toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) > -1
      )
    })
  }
  const debouncedFilter = useDebounceFunction(async (value: string) => {
    console.log('🚀🚀🚀 ~ useSelectChain.ts:229 ~ debouncedFilter ~ value:', value)
    const result = searchChainToken(value)
    console.log('🚀 ~ debouncedFilter ~ result:', result)
    setCoinList(result)
    setIsLoading(false)
  }, 500)

  const handleInputChange = (value: string) => {
    const regValue = value.replace(/[^[a-zA-Z0-9\s]+$/g, '')
    console.log('🚀🚀🚀 ~ useSelectChain.ts:233 ~ handleInputChange ~ regValue:', regValue)
    setInputValue(regValue)
    if (regValue) {
      debouncedFilter(regValue)
    } else {
      setCoinList(originalCoinList)
    }
  }
  return { handleInputChange, coinList, isLoading, inputValue, originalCoinList }
}
