import { useDebounceFunction } from '@cetus/hooks'
import { useSdk } from '@cetus/sdk-factory'
import { Chain, CrossSwapPlatform } from '@cetusprotocol/cross-swap-sdk'
import { useEffect, useState } from 'react'
import { useGetSupportedChainList } from './useCrossHelper'

export default function useSelectChain(platform: CrossSwapPlatform) {
  const crossSwapSdk = useSdk('crossSwap')

  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [chainList, setChainList] = useState<Chain[]>([])
  const { chainList: originChainList } = useGetSupportedChainList(platform)

  useEffect(() => {
    if (crossSwapSdk) {
      setChainList([...originChainList])
    }
  }, [platform, originChainList])

  const searchChain = (keyword: string) => {
    return originChainList.filter(ele => {
      return ele.chain_name.toLocaleLowerCase().indexOf(keyword.toLocaleLowerCase()) > -1
    })
  }

  const debouncedFilter = useDebounceFunction(async (value: string) => {
    console.log('🚀🚀🚀 ~ useSelectChain.ts:229 ~ debouncedFilter ~ value:', value)
    const result = searchChain(value)
    console.log('🚀 ~ debouncedFilter ~ result:', result)
    setChainList(result)
    setIsLoading(false)
  }, 500)

  const handleInputChange = (value: string) => {
    const regValue = value.replace(/[^A-Za-z]+/, '')
    console.log('🚀🚀🚀 ~ useSelectChain.ts:233 ~ handleInputChange ~ regValue:', regValue)
    setInputValue(regValue)
    if (regValue) {
      setIsLoading(true)
      debouncedFilter(regValue)
    } else {
      setChainList(originChainList)
    }
  }
  return { inputValue, isLoading, handleInputChange, chainList }
}
