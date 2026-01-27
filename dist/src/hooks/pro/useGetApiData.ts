import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenStore from '@cetus/stores/src/token'
import { d, toLongCoinType } from '@cetus/utils'
import useWrapProData from './useWrapProData'

import { ProCoinList, ProCoins } from '@/apis/path'
import { trendingCarouselParams } from '@/components/pro/CarouselBlock'
import useProStore from '@/store/pro'
import useProListStore from '@/store/pro/list'
import { ProCoinListFetchParams, ProTokenListItem } from '@/types/pro'
import { useFetch } from '@cetus/hooks'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { isEqual } from 'lodash-es'
import { useRef } from 'react'

// const bvHost = 'https://sui-mainnet.blockvision.org'
const bvHost = 'https://api-sui-cf.cetus.zone/proxy'

export async function bvFetch(url: string) {
  try {
    const response: any = await fetch(`${bvHost}${url}`, {
      method: 'GET',

      headers: {
        accept: 'application/json'
        // 'x-api-key': '2uZYBhmZMcACCbGxbFLbf5R6QCb'
      }
    })
    console.log('🚀 ~ bvFetch ~ response:', response)
    const result = await response.json()
    console.log('🚀 ~ bvFetch ~ result:', result)
    if (result?.code === 200 && result?.message === 'OK') {
      return result?.result
    }
    return null
  } catch (error) {
    console.log('🚀 ~ bvFetch ~ error:', error)
    return null
  }
}

type GetCoinTradeParams = {
  coinType: string
  sender?: string
  type?: string
  cursor?: string
  limit?: number
}

export default function useGetApiData() {
  const { fetchByApi } = useFetch()
  const {
    wrapCoinDexPoolsData,
    wrapCoinDetailData,
    wrapCoinTransactionBlocksData,
    wrapCoinMarketData,
    wrapTopHolders,
    wrapCoinTrades,
    wrapBvTokenList,
    wrapProCoinList,
    wrapProCoinListInModal,
    wrapProCoinWithNoData
  } = useWrapProData()
  const {
    setCoinDetail,
    setCoinDexPools,
    setCoinTransactionBlocks,
    setCoinMarketData,
    setTopHolders,
    setCoinTrades,
    setCoinBvPrice,
    setProTokenMap,
    setCoinAuditCheckData,
    setProTokenList,
    setProCoinListcontroller,
    proCoinListcontroller,
    proSearchListcontroller,
    setProSearchListcontroller,
    setCoinDetailLoading,
    setCoinMarketDataLoading,
    setCoinBvPriceLoading,
    setCoinDexPoolsLoading,
    setCoinTrasactionLoading,
    setTopHoldersLoading,
    setCoinTradesLoading,
    setCoinAuditCheckLoading
  } = useProStore()
  const { proCarouseTrendingInfo, setProCarouseTrendingInfo, proCarouseWatchInfo, setProCarouseWatchInfo } = useProListStore()
  const proCarouseTrendingInfoRef = useRef(proCarouseTrendingInfo)
  const proCarouseWatchInfoRef = useRef(proCarouseWatchInfo)
  const { getTokenListInfo, getTokenInfo } = useGetToken()
  const { verifiedTokenMap } = useTokenStore()

  const getTokenInfos = async (coinTypes: `0x${string}`[]) => {
    try {
      const res: any = await getTokenListInfo(coinTypes)
      console.log('🚀 ~ getTokenInfos ~ res:', res)
      if (res) {
        setProTokenMap(res)
        return res
      }
      return new Map()
    } catch (error) {
      console.log('🚀 ~ getTokenInfos ~ error:', error)
    }
  }

  const getCoinDexPools = async ({
    coinType,
    pageIndex,
    pageSize,
    hideSmallPools
  }: {
    coinType: string
    pageIndex?: number
    pageSize?: number
    hideSmallPools?: boolean
  }) => {
    try {
      setCoinDexPoolsLoading(true)
      const res = await bvFetch(`/api/v1/dex/pools?coinType=${toLongCoinType(coinType)}&pageIndex=${pageIndex || 1}&pageSize=${pageSize || 10}`)
      console.log('🚀 ~ getCoinDexPools ~ res:', res)

      const list = wrapCoinDexPoolsData(hideSmallPools ? res?.filter((item: any) => d(item.tvl).gt(100)) : res)
      console.log('🚀 ~ useGetApiData ~ list:', list)
      setCoinDexPools(list || [])
    } catch (error) {
      console.log('🚀 ~ getCoinDexPools ~ error:', error)
      setCoinDexPools([])
    }
  }

  /**
   * limit: 默认20， 最大50
   * cursor: 时间戳
   * */
  const getCoinTransactionBlocks = async (coinType: string, cursor?: string, limit?: number) => {
    setCoinTrasactionLoading(true)
    try {
      let params = `coinType=${toLongCoinType(coinType)}`
      if (cursor) {
        params += `&cursor=${cursor}`
      }
      params += `&limit=${limit || 10}`
      const res = await bvFetch(`/api/v1/coin/transaction/blocks?${params}`)
      console.log('🚀 ~ getCoinTransactionBlocks ~ res:', res)
      const list = wrapCoinTransactionBlocksData(res?.data)
      console.log('🚀 ~ getCoinTransactionBlocks ~ list:', list)
      setCoinTransactionBlocks({ list, nextPageCursor: res?.nextPageCursor, isFirstPage: !cursor })
    } catch (error) {
      console.log('🚀 ~ getCoinTransactionBlocks ~ error:', error)
      setCoinTransactionBlocks({ list: [], nextPageCursor: '', isFirstPage: true })
    }
  }

  const getCoinDetail = async (coinType: string) => {
    setCoinDetailLoading(true)
    try {
      const res = await bvFetch(`/api/v1/coin/detail?coinType=${toLongCoinType(coinType)}`)
      console.log('🚀 ~ getCoinDetail ~ res:', res)
      const data = wrapCoinDetailData(res)
      setCoinDetail(data)
    } catch (error) {
      setCoinDetail(undefined)
    }
  }

  const getCoinMarketData = async (coinType: string) => {
    setCoinMarketDataLoading(true)
    try {
      const res = await bvFetch(`/api/v1/coin/market?coinType=${toLongCoinType(coinType)}`)
      console.log('🚀 ~ getCoinMarketData ~ res:', res)
      const data = wrapCoinMarketData(res)
      console.log('🚀 ~ getCoinMarketData ~ data:', data)
      setCoinMarketData(data)
    } catch (error) {
      console.log('🚀 ~ getCoinMarketData ~ error:', error)
      setCoinMarketData(undefined)
    }
  }

  const getTopHolders = async (coinType: string, pageIndex?: number, pageSize?: number) => {
    setTopHoldersLoading(true)
    try {
      const res = await bvFetch(`/api/v1/coin/holders?coinType=${toLongCoinType(coinType)}&pageIndex=${pageIndex || 1}&pageSize=${pageSize || 10}`)
      console.log('🚀 ~ getTopHolders ~ res:', res)
      const list = wrapTopHolders(res?.data)

      setTopHolders(list, res?.total)
    } catch (error) {
      console.log('🚀 ~ getTopHolders ~ error:', error)
      setTopHolders([])
    }
  }

  // const getCoinTrades = async (params: GetCoinTradeParams) => {
  //   setCoinTradesLoading(true)
  //   try {
  //     const { coinType, sender, type, cursor = 0, limit = 10 } = params
  //     let paramsString = `?coinType=${toLongCoinType(coinType)}`
  //     if (sender) paramsString += `&sender=${sender}`
  //     if (type) paramsString += `&type=${type}`
  //     if (cursor) paramsString += `&cursor=${cursor}`
  //     if (limit) paramsString += `&limit=${limit}`
  //     const res = await bvFetch(`/api/v1/coin/trades${paramsString}`)
  //     console.log('🚀 ~ getCoinTrades ~ res:', res)

  //     const list = wrapCoinTrades(res?.data)
  //     const coinTypesObj: any = {}
  //     res?.data?.forEach((item: any) => {
  //       item?.coinChanges?.forEach((coin: any) => {
  //         coinTypesObj[coin.coinType] = true
  //       })
  //     })
  //     const coinTypes: any = Object.keys(coinTypesObj)
  //     console.log('🚀 ~ getCoinTrades ~ coinTypes1111:', coinTypes)
  //     getTokenInfos(coinTypes)
  //     setCoinTrades({ list, nextPageCursor: res?.nextPageCursor, isFirstPage: !cursor })
  //     // setCoinTrades(list || [])
  //   } catch (error) {
  //     console.log('🚀 ~ getCoinTrades ~ error:', error)
  //     // setCoinTrades([])
  //     setCoinTrades({ list: [], nextPageCursor: '', isFirstPage: true })
  //   }
  // }

  // 增加ws版本
  // toDo: 增加ws后会增加新hooks，不需要存储数据到store，相关变量后续测试没问题后可以删除
  const getCoinTrades = async (params: GetCoinTradeParams) => {
    // setCoinTradesLoading(true)
    try {
      const { coinType, sender, type, cursor = 0, limit = 10 } = params
      let paramsString = `?coinType=${toLongCoinType(coinType)}`
      if (sender) paramsString += `&sender=${sender}`
      if (type) paramsString += `&type=${type}`
      if (cursor) paramsString += `&cursor=${cursor}`
      if (limit) paramsString += `&limit=${limit}`
      const res = await bvFetch(`/api/v1/coin/trades${paramsString}`)
      console.log('🚀 ~ getCoinTrades ~ res:', res)

      const list = wrapCoinTrades(res?.data)

      return { list, nextPageCursor: res?.nextPageCursor, isFirstPage: !cursor }
      // const coinTypesObj: any = {}
      // res?.data?.forEach((item: any) => {
      //   item?.coinChanges?.forEach((coin: any) => {
      //     coinTypesObj[coin.coinType] = true
      //   })
      // })
      // const coinTypes: any = Object.keys(coinTypesObj)
      // console.log('🚀 ~ getCoinTrades ~ coinTypes1111:', coinTypes)
      // getTokenInfos(coinTypes)
      // setCoinTrades({ list, nextPageCursor: res?.nextPageCursor, isFirstPage: !cursor })
      // setCoinTrades(list || [])
    } catch (error) {
      console.log('🚀 ~ getCoinTrades ~ error:', error)
      // setCoinTrades([])
      // setCoinTrades({ list: [], nextPageCursor: '', isFirstPage: true })
      return []
    }
  }

  const getCoinBvPrice = async (coinType: string) => {
    setCoinBvPriceLoading(true)
    const res = await bvFetch(`/api/v1/coin/price/list?tokenIds=${toLongCoinType(coinType)}`)
    console.log('🚀 ~ getCoinBvPrice ~ res:', res)
    if (res?.prices) {
      const keys = Object.keys(res?.prices)
      const values = Object.values(res?.prices)
      if (keys?.[0] && values?.[0])
        setCoinBvPrice({
          price: values[0] as string,
          coinType: keys[0]
        })
    }
  }

  const getCoinAuditCheck = async (coinType: string) => {
    setCoinAuditCheckLoading(true)
    const res = await bvFetch(`/api/v1/coin/audit/check?coinType=${toLongCoinType(coinType)}`)
    if (res) {
      setCoinAuditCheckData({
        coinType: res?.coinType,
        isHoneypot: res?.isHoneypot,
        mintAuthority: res?.mintAuthority,
        top10Holder: d(res?.top10Holder).mul(100).toString()
      })
    } else {
      setCoinAuditCheckData(undefined)
    }
  }

  // swap页面pro部分的token选择下拉处用
  const getProTokenListInModal = async (orderBy: 'vol_24' | 'change_percentage') => {
    const date_type = 'hour24'
    const fetchParams = {
      sorted_by: orderBy === 'vol_24' ? 'volume' : 'change',
      desc: true,
      date_type,
      tag: 'trending'
    }

    const res = await fetchByApi(ProCoinList, 'GET', fetchParams)
    console.log('🚀 ~ getProTokenListInModal ~ res:', res)
    const data = wrapProCoinListInModal(res?.coin_list, fetchParams.date_type)
    console.log('🚀 ~ getProTokenListInModal ~ data:', data)

    setProTokenList(data)
  }

  // 对接bv数据时候的搜索处理
  // const searchProToken = async (value: string): Promise<ProTokenListItem[]> => {
  //   console.log('🚀 ~ searchProToken ~ value:', value)
  //   try {
  //     const lowercaseKeyword = value?.toLocaleLowerCase()
  //     const filterFromPro = getProTokenFromStats(value)
  //     console.log('🚀 ~ searchProToken ~ filterFromPro:', filterFromPro)
  //     if (filterFromPro?.length > 0) return filterFromPro

  //     const verifiedTokens = Array.from(verifiedTokenMap?.values())
  //     const filterFromVerify = verifiedTokens.filter((tokenItem: any) => {
  //       return (
  //         tokenItem.symbol.toLowerCase().indexOf(lowercaseKeyword) !== -1 ||
  //         tokenItem.coin_type.toLowerCase().indexOf(lowercaseKeyword?.trim()) !== -1 ||
  //         tokenItem.name.toLowerCase().indexOf(lowercaseKeyword) !== -1 ||
  //         (tokenItem?.coin_type && tokenItem?.coin_type?.toLowerCase().indexOf(lowercaseKeyword) !== -1)
  //       )
  //     })
  //     console.log('🚀 ~ filterFromVerify ~ filterFromVerify:', filterFromVerify)

  //     if (filterFromVerify?.length > 0) {
  //       const filterFromVerifyFormat = filterFromVerify?.map((item: any) => {
  //         return {
  //           coinType: (item?.coin_type || item?.coinType)?.trim(),
  //           priceChange: '--',
  //           vol: '--',
  //           price: '--',
  //           ...item
  //         }
  //       })
  //       console.log('🚀 ~ filterFromVerifyFormat ~ filterFromVerifyFormat:', filterFromVerifyFormat)
  //       return filterFromVerifyFormat
  //     }

  //     const tokenInfo: any = await getTokenInfo(value as `0x${string}`)
  //     if (tokenInfo) {
  //       return [
  //         {
  //           coinType: (tokenInfo?.coin_type || tokenInfo?.coinType).trim(),
  //           priceChange: '--',
  //           vol: '--',
  //           price: '--',
  //           ...tokenInfo,
  //           coin_type: (tokenInfo?.coin_type || tokenInfo?.coinType).trim()
  //         }
  //       ]
  //     }

  //     return []
  //   } catch (error) {
  //     console.log('🚀 ~ searchProToken ~ error:', error)
  //     return []
  //   }
  // }

  const searchProToken = async (value: string): Promise<ProTokenListItem[]> => {
    console.log('🚀 ~ searchProToken ~ value:', value)
    try {
      const date_type = 'hour24'
      const fetchParams = {
        text: value,
        tag: 'trending'
      }
      if (proSearchListcontroller) {
        console.log('🚀 ~ searchProToken ~ proSearchListcontroller:', proSearchListcontroller)
        await proSearchListcontroller.abort()
      }
      const getProSearchcontroller = new AbortController()
      setProSearchListcontroller(getProSearchcontroller)
      const res = await fetchByApi(ProCoinList, 'GET', fetchParams, undefined, getProSearchcontroller)
      console.log('🚀 ~ getProTokenListInModal ~ res:', res)
      let data = wrapProCoinListInModal(res?.coin_list, date_type)
      console.log('🚀 ~ getProTokenListInModal ~ data:', data)

      if (data?.length === 0 && value?.startsWith('0x')) {
        const tokenInfo: any = await getTokenInfo(value as `0x${string}`)
        if (tokenInfo) {
          data = [{ ...tokenInfo, isNotBv: true }]
        }
      }

      return data
    } catch (error) {
      console.log('🚀 ~ searchProToken ~ error:', error)
      return []
    }
  }

  // pro list页面用
  const getProCoinList = async (params: ProCoinListFetchParams, isAuto = true) => {
    // 接口文档更新 sorted_by === 'age'的时候也需要传date_type
    // const p = JSON.parse(JSON.stringify(params))
    // delete p.date_type
    // params?.sorted_by === 'age' ? p :
    const fetchParams = params
    if (proCoinListcontroller) {
      await proCoinListcontroller.abort()
    }
    const getProCoinListcontroller = new AbortController()
    setProCoinListcontroller(getProCoinListcontroller)

    // 如果上一次trending请求距离当前小于1分钟 那么用上一次的结果
    let data: any
    const nowTime = new Date().getTime()
    console.log('🚀 ~ getProCoinList ~ proCarouseTrendingInfoRef.current:', proCarouseTrendingInfoRef.current)
    if (
      isEqual(trendingCarouselParams, params) &&
      proCarouseTrendingInfoRef.current?.lastUpdateTime &&
      d(nowTime).minus(proCarouseTrendingInfoRef.current?.lastUpdateTime).lte(60000) &&
      isAuto
    ) {
      data = wrapProCoinList(proCarouseTrendingInfoRef.current?.dataList, fetchParams.date_type)
    } else {
      const res = await fetchByApi(ProCoinList, 'GET', fetchParams, undefined, getProCoinListcontroller)
      data = wrapProCoinList(res?.coin_list, fetchParams.date_type)
      if (isEqual(trendingCarouselParams, params)) {
        proCarouseTrendingInfoRef.current = {
          dataList: res?.coin_list,
          lastUpdateTime: new Date().getTime()
        }
        setProCarouseTrendingInfo(res?.coin_list)
      }
    }

    console.log('🚀 ~ getProCoinList ~ data:', data)
    console.log('🚀 ~ getProCoinList ~ params:', params)

    // if (params?.offset === 0 && params?.sorted_by === 'change' && params?.desc) {
    //   const data = wrapProCoinListInModal(res?.coin_list, 'hour24')
    //   setProTokenList(data)
    // }

    // 搜索时后端返回数据为空 去链上查token数据
    if (params?.text && data?.length == 0) {
      const coin = await wrapProCoinWithNoData(fixCoinType(params?.text))
      data = coin ? [{ ...coin }] : []
    }
    return {
      list: data
      // nextId: res?.nextId,
      // total: res?.total || 100
    }
  }

  const getProCoinListWithCoins = async (coins: string[], date_type: string, text?: string, isAuto = true) => {
    if (coins?.length == 0) return []

    // 1分钟时效
    let res: any
    const nowTime = new Date().getTime()
    console.log('🚀 ~ getProCoinListWithCoins ~ proCarouseWatchInfoRef.current:', proCarouseWatchInfoRef.current)
    if (
      date_type == 'hour24' &&
      isEqual(coins, proCarouseWatchInfoRef.current?.dataCoinTypeList) &&
      proCarouseWatchInfoRef.current?.lastUpdateTime &&
      d(nowTime).minus(proCarouseWatchInfoRef.current?.lastUpdateTime).lte(60000) &&
      isAuto
    ) {
      res = { data: { coin_list: proCarouseWatchInfoRef.current?.dataList } }
    } else {
      res = await fetchByApi(ProCoins, 'POST', {
        coin_types: coins
      })
    }

    const coinList = res?.data?.coin_list || []
    const list = text ? coinList.filter((item: any) => fixCoinType(item?.coinType) === fixCoinType(text)) : coinList
    const data = wrapProCoinList(list, date_type)

    console.log('🚀 ~ getProCoinListWithCoins ~ data:', list, data)

    if (coins?.length === data?.length) {
      if (date_type == 'hour24') {
        proCarouseWatchInfoRef.current = {
          dataList: list,
          dataCoinTypeList: coins,
          lastUpdateTime: new Date().getTime()
        }
        setProCarouseWatchInfo(list, coins)
      }
      return data
    } else {
      const dataObj = Object.fromEntries(data?.map((item: any) => [toLongCoinType(item?.coin_type), item]))
      const originObj = Object.fromEntries(list?.map((item: any) => [toLongCoinType(item?.coinType), item]))
      const result = []
      const originArr: any = []

      for (let i = 0; i < coins?.length; i++) {
        const coinType = coins[i]
        const info = dataObj[toLongCoinType(coinType)] || (await wrapProCoinWithNoData(coinType))
        const originInfo = originObj[toLongCoinType(coinType)] || (await wrapProCoinWithNoData(coinType))

        if (info) result.push(info)
        if (originInfo) originArr.push(originInfo)
      }

      if (date_type == 'hour24') {
        proCarouseWatchInfoRef.current = {
          dataList: originArr,
          dataCoinTypeList: coins,
          lastUpdateTime: new Date().getTime()
        }
        setProCarouseWatchInfo(originArr, coins)
      }
      return result
    }
  }

  return {
    getCoinDexPools,
    getCoinTransactionBlocks,
    getCoinDetail,
    getCoinMarketData,
    getTopHolders,
    getCoinTrades,
    getCoinBvPrice,
    getTokenInfos,
    getCoinAuditCheck,
    getProTokenListInModal,
    searchProToken,
    getProCoinList,
    getProCoinListWithCoins
  }
}
