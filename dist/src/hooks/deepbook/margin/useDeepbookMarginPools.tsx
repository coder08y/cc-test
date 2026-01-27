import { DeepBookMarginPoolsHistoryPath, DeepBookMarginPoolsPath, DeepBookMarginSupplyCap } from '@/apis/path'
import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { useFetch } from '@cetus/hooks'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
import { CoinType } from '@cetus/types'
import { fixDown, formatCurrency, formatNumber, formatPercentage, timeFormatUTC } from '@cetus/utils'
import { d } from '@cetusprotocol/deepbook-utils'

export default function useDeepBookMarginPools() {
  const { fetchByApi } = useFetch()
  const { deepBookSDK } = usePeripherySDKStore()

  const { getTokenInfo } = useGetToken()
  const { fetchTokenPrices, getTokenAmountValue } = useTokenPrice()

  const fetchToken = async (coinType: string) => {
    if (!coinType) return
    try {
      const coinInfo = await getTokenInfo(coinType as CoinType)
      return coinInfo
    } catch (error) {
      console.error('Error fetching token info:', error)
    }
  }

  const marginPoolCap = useDeepBookMarginPoolStore(state => state.marginPoolCap)
  const selectCoinList = useDeepBookMarginPoolStore(state => state.selectCoinList)
  const isYourSupply = useDeepBookMarginPoolStore(state => state.isYourSupply)
  const setDeepBookMarginPools = useDeepBookMarginPoolStore(state => state.setDeepBookMarginPools)
  const setIsMarginPoolsLoading = useDeepBookMarginPoolStore(state => state.setIsMarginPoolsLoading)
  const setMarginPoolsTotalData = useDeepBookMarginPoolStore(state => state.setMarginPoolsTotalData)
  const setMarginPoolCap = useDeepBookMarginPoolStore(state => state.setMarginPoolCap)
  const setUserInfo = useDeepBookMarginPoolStore(state => state.setUserInfo)
  const setHistoryList = useDeepBookMarginPoolStore(state => state.setHistoryList)
  const setIsHistoryLoading = useDeepBookMarginPoolStore(state => state.setIsHistoryLoading)
  const poolsSort = useDeepBookMarginPoolStore(state => state.poolsSort)

  const fetchMarginCap = async (address?: string) => {
    console.log('🚀 ~ fetchMarginCap ~ address:', deepBookSDK, address)
    if (!address) {
      setMarginPoolCap(undefined)
      return
    }
    try {
      const res = await fetchByApi(DeepBookMarginSupplyCap, 'POST', { address })
      console.log('🚀 ~ fetchMarginCap ~ res:', res)
      if (!res?.data || !res?.data?.supply_cap?.length) throw new Error('empty api data')

      setMarginPoolCap(res?.data?.supply_cap[0])
      return res
    } catch (apiError) {
      try {
        const res = await deepBookSDK.MarginUtils.querySupplierCap()
        console.log('🚀 ~ fetchMarginCap ~ res:', deepBookSDK, address, apiError, res)
        setMarginPoolCap(res)
        return res
      } catch (sdkError) {
        console.log('🚀 ~ fetchMarginCap ~ sdkError:', deepBookSDK, address, sdkError)
        setMarginPoolCap(undefined)
        return undefined
      }
    }
  }

  /* ---------------- main ---------------- */
  const getDeepBookMarginPools = async (address?: string, isLoading?: boolean) => {
    console.log('🚀 ~ getDeepBookMarginPools ~ address:', poolsSort, address, marginPoolCap)
    const coinAddress = selectCoinList?.length > 0 ? selectCoinList[0]?.coin_type : ''
    if (isLoading) setIsMarginPoolsLoading(true)

    if (!marginPoolCap) {
      fetchMarginCap(address)
    }

    try {
      const res = await fetchByApi(DeepBookMarginPoolsPath, 'POST', {
        address,
        coin_type: coinAddress
      })
      console.log('🚀 ~ getDeepBookMarginPools ~ res:', res)

      if (!res?.data) throw new Error('empty api data')

      setMarginPoolsTotalData({
        totalSupply: res.data.total_value,
        totalBorrow: res.data.total_borrowed
      })

      let list = await Promise.all(res.data.list.map((item: any) => wrapMarginPoolsData(item, address, false)))

      list = await afterProcessList(list, address)

      list = sortMarginPools(list)

      setDeepBookMarginPools(list)
      fetchTokenPrices(list.map((item: any) => item?.coin_type || item?.coinType))
    } catch (apiError) {
      console.warn('API failed, fallback SDK:', apiError)
      // 降级 SDK
      try {
        setMarginPoolsTotalData({
          totalSupply: '--',
          totalBorrow: '--'
        })

        const res = await deepBookSDK.MarginUtils.getDeepBookMarginPool()

        let list = await Promise.all(res.map((item: any) => wrapMarginPoolsData(item, address, false)))

        list = await afterProcessList(list, address)
        list = sortMarginPools(list)

        setDeepBookMarginPools(list)
        fetchTokenPrices(list.map((item: any) => item?.coin_type))
      } catch (sdkError) {
        console.error('SDK failed:', sdkError)
        setDeepBookMarginPools([])
      }
    } finally {
      setIsMarginPoolsLoading(false)
    }
  }

  //排序
  const sortMarginPools = (list: any[]) => {
    console.log('🚀 ~ sortMarginPools ~ poolsSort:', list, poolsSort)
    if (!poolsSort) return list

    const { sortRule, sortBy } = poolsSort
    const factor = sortRule === 'asc' ? 1 : -1

    const key = sortBy?.value
    return [...list].sort((a, b) => {
      const getValue = (item: any) => {
        switch (key) {
          case 'supply':
            return Number(item.totalValue ?? 0)
          case 'apy':
            return Number(item.apy ?? 0)
          case 'holdings':
            return Number(item.userSuppliedValue ?? 0)
          default:
            return 0
        }
      }

      return (getValue(a) - getValue(b)) * factor
    })
  }

  /* ---------------- 后处理统一入口 ---------------- */

  const afterProcessList = async (list: any[], address?: string) => {
    // 条件不足直接清空
    console.log('🚀 ~ afterProcessList ~ marginPoolCap:', list, address, marginPoolCap)

    const results = await Promise.all(
      list.map(async item => {
        try {
          const res = await getUserSupply(item, address)
          console.log('🚀 ~ afterProcessList ~ value:', res)

          const hasSupply = res && res?.userSupplied && d(res?.userSupplied).gt(0)

          // 只在 isYourSupply = true 时参与过滤
          if (isYourSupply && !hasSupply) {
            return null
          }

          return { ...item, ...res }
        } catch (err) {
          console.error('getUserSupply error:', item.objectId, err)
          return null
        }
      })
    )

    // 过滤无效项
    return results.filter(Boolean)
  }

  /* ---------------- wrap ---------------- */
  const wrapMarginPoolsData = async (item: any, address: string | undefined, isSdk: boolean) => {
    let tokenInfo = item?.coin_meta

    if (isSdk) {
      tokenInfo = await fetchToken(item.deposit_coin_type)
    }

    const objectId = item?.object_id || item?.id
    const coinType = item?.coin_type || item?.deposit_coin_type
    const totalSupply = isSdk ? d(item?.total_supply).div(Math.pow(10, tokenInfo?.decimals)).toString() : item?.total_supply
    const availableSupply = isSdk ? d(item?.available_supply).div(Math.pow(10, tokenInfo?.decimals)).toString() : item?.remain
    const supplyCap = d(item?.supply_cap).div(Math.pow(10, tokenInfo?.decimals)).toString()
    const supplyProgress = d(totalSupply).div(supplyCap).mul(100).toNumber()

    const base = {
      apy: item?.apy,
      displayApy: item?.apy ? formatPercentage(item?.apy * 100, 2) : '-',
      objectId: objectId,
      coinType: coinType,
      tokenInfo: {
        logo_url: tokenInfo?.iconUrl,
        coinType: tokenInfo?.coin_type || tokenInfo?.coinType,
        coin_type: tokenInfo?.coinType || tokenInfo?.coin_type,
        ...tokenInfo
      },
      totalSupply: totalSupply,
      totalValue: item?.total_value,
      displayTotalSupply: formatNumber(totalSupply, 2),
      displaySupplyValue: formatCurrency(item?.total_value, 2),
      availableSupply: availableSupply,
      displayAvailableSupply: formatNumber(availableSupply, 2),
      remain: availableSupply,
      displayRemain: formatNumber(availableSupply, 2),
      remainValue: item?.remain_value,
      remainToBorrow: item?.remain_to_borrow || item?.remainToBorrow,
      displayRemainToBorrow: item?.remain_to_borrow || item?.remainToBorrow ? formatNumber(item?.remain_to_borrow || item?.remainToBorrow, 2) : '-',
      borrowApr: item?.borrow_apr,
      supplyApr: item?.supply_apr,
      maintainerFees: item?.maintainer_fees,
      maxUtilizationRate: item?.max_utilization_rate,
      minBorrow: item?.min_borrow,
      protocolFees: item?.protocol_fees,
      supplyCap,
      supplyProgress
    }

    if (!address) {
      return {
        ...base,
        userSupply: '0',
        userSupplyValue: '0',
        unsettledEarning: '0',
        unsettledValue: '0',
        displayUserSupply: '-',
        displayUnsettledEarning: '-',
        displayUserSupplyValue: '',
        displayUnsettledValue: ''
      }
    }

    return {
      ...base,
      userSupply: item?.user_supply,
      userSupplyValue: item?.user_supply_value,
      unsettledEarning: item?.unsettled_earning,
      unsettledValue: item?.unsettled_value,
      displayUserSupply: formatNumber(item?.user_supply, 2),
      displayUnsettledEarning: formatNumber(item?.unsettled_earning, 2),
      displayUserSupplyValue: formatCurrency(item?.user_supply_value, 2),
      displayUnsettledValue: formatCurrency(item?.unsettled_value, 2)
    }
  }

  const getUserSupply = async (marginPool: any, address: string | undefined) => {
    try {
      console.log('🚀 ~ wrapMarginPoolsData ~ address:', marginPoolCap, address)
      if (marginPoolCap && address) {
        const params = {
          marginPool: marginPool?.objectId,
          supplyCoin: { ...marginPool?.tokenInfo, scalar: Math.pow(10, marginPool?.tokenInfo?.decimals) },
          supplierCapId: marginPoolCap
        }
        console.log('🚀 ~ getUserSupply ~ params:', params)

        const userSupplied = await deepBookSDK.MarginUtils.getUserSupplyAmount(params)
        console.log('🚀 ~ getUserSupply ~ userSupplied:', userSupplied)

        if (userSupplied) {
          const userSuppliedValue = getTokenAmountValue(marginPool?.tokenInfo?.coin_type, userSupplied)
          const result = {
            userSupplied,
            displayUserSupplied: formatNumber(userSupplied, marginPool?.tokenInfo?.decimals),
            userSuppliedValue,
            displayUserSuppliedValue: formatCurrency(userSuppliedValue, 2)
          }
          setUserInfo(marginPool?.objectId, result)
          return result
        }
        return undefined
      } else {
        setUserInfo('', undefined, true)
        return undefined
      }
    } catch (error) {
      return undefined
      console.log('🚀 ~ getUserSupply ~ error:', error)
    }
  }

  const getDeepBookMarginPoolsHistory = async (address: string, marginPoolId: string, action: ActionType, isLoading?: boolean, limit = 500) => {
    if (!address) {
      setHistoryList([])
      return
    }

    if (isLoading) setIsHistoryLoading(true)

    try {
      const res = await fetchByApi(DeepBookMarginPoolsHistoryPath, 'POST', {
        address,
        margin_pool_id: marginPoolId == 'All' ? '' : marginPoolId,
        action: ACTION_MAP[action], // ✅ 页面 → 接口
        limit
      })

      if (!res?.data?.list) throw new Error('empty api data')

      const list = res.data.list.map((item: any) => ({
        amount: item?.amount,
        amountValue: item?.amount_value,
        amountDisplay: formatNumber(item?.amount, item?.coin_meta?.decimals),
        amountValueDisplay: formatCurrency(item?.amount_value, 2),
        timestamp: item?.timestamp ? timeFormatUTC(Number(fixDown(d(item?.timestamp).div(1000).toNumber(), 0)) * 1000) : '',
        tx: item?.tx,
        tokenInfo: item?.coin_meta,
        action: API_ACTION_MAP[item.action as ActionValue] ?? 'All' // ✅ 接口 → 页面
      }))
      console.log('🚀 ~ getDeepBookMarginPoolsHistory ~ list:', res, list)

      setHistoryList(list)
    } catch (apiError) {
      setHistoryList([])
      console.log('🚀 ~ getDeepBookMarginPoolsHistory ~ apiError:', apiError)
    } finally {
      setIsHistoryLoading(false)
    }
  }

  return { fetchMarginCap, getDeepBookMarginPools, getUserSupply, getDeepBookMarginPoolsHistory }
}

const API_ACTION_MAP: Record<ActionValue, ActionType> = {
  0: 'All',
  1: 'Deposit',
  2: 'Withdraw'
}

const ACTION_MAP = {
  All: 0,
  Deposit: 1,
  Withdraw: 2
} as const

type ActionType = keyof typeof ACTION_MAP
type ActionValue = (typeof ACTION_MAP)[ActionType]
