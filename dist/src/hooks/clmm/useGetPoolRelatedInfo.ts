import useLiquidityStore from '@/store/clmm'
import { isTrustedToken } from '@/utils'
import { getFeeTierList } from '@/utils/clmm'
import { clmmDefaultFeeOptions } from '@cetus/design/src/components/common/feeSelect/config'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { useDeepCompareEffect } from 'ahooks'
import { useMemo } from 'react'
import useQuoteWhiteTokenList from '../create-pool/useQuoteWhiteTokenList'
import useGetPriceRange from './useGetPriceRange'
import useGetRelatedPools from './useGetRelatedPools'
function useGetPoolRelatedInfo() {
  const { isApp } = useWindowWidth()
  const { poolAddress } = useQueryParams()
  const { apiPoolInfo, apiPoolInfoLoading } = useLiquidityStore()

  const { quoteWhiteTokenList } = useQuoteWhiteTokenList()

  const { getList, relatedPoolList } = useGetRelatedPools()
  /**
   * 获取token对费率列表
   * Get the token pair rate list
   */
  const feeTierList = useMemo(() => {
    const list = getFeeTierList(relatedPoolList)
    if (list) {
      if (apiPoolInfo?.tokenA && apiPoolInfo?.tokenB) {
        return clmmDefaultFeeOptions?.map(item => {
          const title = list.find(feeTier => feeTier.feeRate === item.feeRate)?.title || item.title
          return {
            ...item,
            title,
            poolAddress: list.find(feeTier => feeTier.feeRate === item.feeRate)?.poolAddress,
            disabled:
              title === 'Not Created' &&
              !isTrustedToken(apiPoolInfo?.tokenA, quoteWhiteTokenList) &&
              !isTrustedToken(apiPoolInfo?.tokenB, quoteWhiteTokenList)
                ? true
                : false
          }
        })
      } else {
        return clmmDefaultFeeOptions?.map(item => {
          const title = list.find(feeTier => feeTier.feeRate === item.feeRate)?.title || item.title
          return {
            ...item,
            title,
            poolAddress: list.find(feeTier => feeTier.feeRate === item.feeRate)?.poolAddress,
            disabled:
              !isTrustedToken(apiPoolInfo?.displayTokenA, quoteWhiteTokenList) && !isTrustedToken(apiPoolInfo?.displayTokenB, quoteWhiteTokenList)
                ? true
                : false
          }
        })
      }
    }
    return []
  }, [
    JSON.stringify(relatedPoolList),
    JSON.stringify(quoteWhiteTokenList),
    apiPoolInfo?.displayTokenA?.coin_type,
    apiPoolInfo?.displayTokenB?.coin_type
  ])
  /**
   * 生成当前池子deposit的token切换tab列表
   * Generate the token switch tab list for the current pool deposit
   */
  const rangeTabList = useMemo(() => {
    if (apiPoolInfo) {
      return [apiPoolInfo?.displayTokenA, apiPoolInfo?.displayTokenB]?.filter(Boolean).map(item => ({
        label: item?.symbol,
        key: item?.coin_type,
        isToken: true,
        imgInfo: isApp
          ? null
          : {
              src: item?.logo_url,
              w: '16px',
              h: '16px',
              coinType: item ? item?.coin_type : '',
              showTagWidth: '8px',
              showTagHeight: '8px'
            }
      }))
    } else {
      return []
    }
  }, [apiPoolInfo?.displayTokenA?.symbol, apiPoolInfo?.displayTokenB?.symbol])

  /**
   * 获取当前池子的费率信息
   * Get the current pool fee rate information
   */
  const currentFeeTier = useMemo(() => {
    const _currentFeeTier = feeTierList?.find(item => item.poolAddress === poolAddress)
    if (_currentFeeTier) {
      return _currentFeeTier
    } else {
      return apiPoolInfo
    }
  }, [JSON.stringify(feeTierList), poolAddress, JSON.stringify(apiPoolInfo)])

  /**
   * 获取合约价格，获取过去24小时、7天、30天的价格范围
   * Get contract price, get price range for past 24 hours, 7 days, 30 days
   * @param address 池子地址 / Pool address
   */
  const { fetchPriceRange } = useGetPriceRange()
  const getPriceRanges = async (address: string) => {
    console.log('🚀 ~ setPriceRangeMap ~ this.addressHistTokens:🚀 ~ getContractPrices ~ address:', address)
    await fetchPriceRange(address, apiPoolInfo?.tokenA, apiPoolInfo?.tokenB)
  }

  useDeepCompareEffect(() => {
    if (poolAddress && poolAddress === apiPoolInfo?.poolAddress && apiPoolInfo?.tokenA && apiPoolInfo?.tokenB) {
      getPriceRanges(poolAddress)
    }
  }, [poolAddress, apiPoolInfo?.tokenA, apiPoolInfo?.tokenB])

  /**
   * 生成警告弹窗代币列表
   * Generate warning modal token list
   */
  const warningTokenList = useMemo(() => {
    const list: Token[] = []
    if (apiPoolInfo?.displayTokenA) {
      list.push(apiPoolInfo?.displayTokenA)
    }
    if (apiPoolInfo?.displayTokenB) {
      list.push(apiPoolInfo?.displayTokenB)
    }
    return list
  }, [JSON.stringify(apiPoolInfo?.displayTokenA), JSON.stringify(apiPoolInfo?.displayTokenB)])

  return {
    getList,
    feeTierList,
    apiPoolInfo,
    rangeTabList,
    currentFeeTier,
    apiPoolInfoLoading,
    quoteWhiteTokenList,
    warningTokenList
  }
}

export default useGetPoolRelatedInfo
