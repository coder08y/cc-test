import useXCetusStore from '@/store/xcetus/useXCetus'
import { XCetusRewardInfo } from '@/types/xcetus'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import envConfigs, { xcetusConfig } from '@cetus/types/src/config/envConfigs'
import { d } from '@cetus/utils'
import { buildNFT, extractStructTagFromType, fixCoinType, fromDecimalsAmount, getMoveObjectType } from '@cetusprotocol/common-sdk'
import { CetusXcetusSDK, DividendManager, DividendReward, LockCetus, PhaseDividendInfo, VeNFT, XCetusUtil } from '@cetusprotocol/xcetus-sdk'
import { useDebounceEffect } from 'ahooks'
import { useCallback, useEffect, useRef, useState } from 'react'

/**
 *  获取我的xcetus 订单
 * @returns
 */
export function useGetOwnerLockCetusList() {
  const xCetusSdk = useSdk('xcetus')
  const { currentAccount } = useAccountStore()

  const addressRef = useRef(currentAccount?.address)

  useEffect(() => {
    addressRef.current = currentAccount?.address
  }, [currentAccount?.address])

  const { setLockCetusListLoading, clearData, setLockCetusList, setAvailableXCetusAmount, veNFT, setAvailableXCetusAmountLoading } = useXCetusStore()

  const fetchOwnerLockCetusList = async (veNFT: VeNFT, address = currentAccount?.address) => {
    if (!address) {
      setLockCetusListLoading(false)
      clearData()
      return
    }
    setAvailableXCetusAmountLoading(true)

    try {
      const lockList = await xCetusSdk!.XCetusModule.getOwnerRedeemLockList(address)
      console.log('🚀 ~ fetchOwnerLockCetusList ~ lockList:', {
        lockList,
        veNFT,
        availableXCetusAmount: XCetusUtil.getAvailableXCetus(veNFT, lockList)
      })
      if (address === addressRef.current) {
        lockList.sort((a, b) => a.locked_until_time - b.locked_until_time)
        setLockCetusList(lockList)
        if (veNFT) {
          setAvailableXCetusAmount(XCetusUtil.getAvailableXCetus(veNFT, lockList))
        }
      }
    } catch (error) {
      console.log('🚀 ~ fetchOwnerLockCetusList ~ error:', error)
    } finally {
      setLockCetusListLoading(false)
      setAvailableXCetusAmountLoading(false)
    }
  }

  return {
    fetchOwnerLockCetusList
  }
}

/**
 *  获取用户的分红信息
 */
export function useGetVeNFTDividendInfo() {
  const xCetusSdk = useSdk('xcetus')

  const { setDividendRewardList } = useXCetusStore()

  const fetchVeNFTDividendInfo = async (veNftId: string) => {
    try {
      const dividendInfo = await xCetusSdk!.XCetusModule.getVeNFTDividendInfo(veNftId)
      console.log('🚀 ~ file: useXCetusHelper.ts:62 ~ fetchVeNFTDividendInfo ~ dividendInfo:', dividendInfo)

      if (dividendInfo) {
        setDividendRewardList(dividendInfo.rewards)
      }
    } catch (error) {
      console.log('🚀 ~ fetchVeNFTDividendInfo ~ error:', error, veNftId)
    }
  }

  return { fetchVeNFTDividendInfo }
}

export function useGetOwnerVeNFT() {
  const xCetusSdk = useSdk('xcetus')
  const { currentAccount } = useAccountStore()
  const { fetchOwnerLockCetusList } = useGetOwnerLockCetusList()

  const { setVeNFTLoading, clearData, setVeNFT, setAvailableXCetusAmountLoading } = useXCetusStore()

  const fetchOwnerVeNFT = async (address = currentAccount?.address, forceRefresh?: boolean) => {
    if (!address) {
      setVeNFTLoading(false)
      clearData()
      return
    }

    setVeNFTLoading(true)

    try {
      const veNFT = await xCetusSdk!.XCetusModule.getOwnerVeNFT(address, forceRefresh)
      console.log('🚀 ~ fetchOwnerVeNFT ~ veNFT:', veNFT)
      if (veNFT) {
        setVeNFT(veNFT, address)
        fetchOwnerLockCetusList(veNFT, address)
        return veNFT
      }
    } catch (error) {
      console.log('🚀 ~ fetchOwnerVeNFT ~ error:', error)
    } finally {
      setVeNFTLoading(false)
      setAvailableXCetusAmountLoading(false)
    }
  }

  return { fetchOwnerVeNFT }
}

/**
 * 获取当前期数和下一期开始时间
 */
export function useGetCurrPeriod() {
  const { dividendManager } = useXCetusStore()
  const [currentPeriod, setCurrentPeriod] = useState<number | undefined>()
  const [nextStartTime, setNextStartTime] = useState<number | undefined>()

  const calculateCurrPeriod = (dividendManager: DividendManager) => {
    const currentTime = Date.now() / 1000
    const { start_time, interval_day } = dividendManager

    const nextStartTime = Number(XCetusUtil.getNextStartTime(dividendManager).toString())

    const currentPeriod =
      envConfigs.env == 'testnet'
        ? Math.ceil((currentTime - start_time) / (interval_day * 60))
        : Math.ceil((currentTime - start_time) / (interval_day * 24 * 3600))

    setCurrentPeriod(currentPeriod)
    setNextStartTime(nextStartTime)
  }

  useEffect(() => {
    if (dividendManager) {
      calculateCurrPeriod(dividendManager)
    }
  }, [dividendManager])

  return {
    currentPeriod,
    nextStartTime,
    calculateCurrPeriod
  }
}

/**
 * 计算APR
 */
export function useGetXCetusApr(phaseDividendInfo?: PhaseDividendInfo, treasury?: string) {
  const { fetchTokenInfo } = useGetToken()
  const { getTokenAmountValue } = useTokenPrice()
  const { coinPriceObj } = useTokenPriceStore()
  const [cetusApr, setCetusApr] = useState<string>('0')
  const calculateAPR = useCallback(async () => {
    if (!phaseDividendInfo || !treasury) return

    try {
      const bonusList = phaseDividendInfo.bonus
      const coinTypeList = bonusList.map(bonus => fixCoinType(bonus.name, false))
      const tokenMap = await fetchTokenInfo<string[]>(coinTypeList)
      // 并行获取所有代币信息和金额价值
      const totalBonusAmountValue = bonusList
        .map(bonus => {
          const coinType = fixCoinType(bonus.name, false)
          const coinInfo = tokenMap?.get(coinType)
          if (coinInfo) {
            const amount = fromDecimalsAmount(bonus.value, coinInfo.decimals).toString()
            const value = getTokenAmountValue(coinType, amount)
            // console.log('🚀 ---------------------------------------------------------------🚀')
            // console.log('🚀 ~ file: useXCetusHelper.ts:158 ~ calculateAPR ~ value:', value, coinType)
            // console.log('🚀 ---------------------------------------------------------------🚀')
            return value
          }
          return '0'
        })
        .reduce((acc, value) => acc.add(value), d(0)) // 汇总价值
      // 获取 Cetus 的总价值
      const cetusValue = getTokenAmountValue(envConfigs.cetus_coin.coin_type, fromDecimalsAmount(treasury, 9).toString())

      // 计算 APR
      const apr = d(cetusValue).gt(0) ? totalBonusAmountValue.div(7).mul(365).div(cetusValue).mul(100).toFixed(2) : '0'

      setCetusApr(Number(apr) > 0 && Number(apr) < 0.01 ? '0.01' : apr.toString())
    } catch (error) {
      console.error('Error calculating APR:', error)
      setCetusApr('0.01') // 处理错误时设置默认值
    }
  }, [phaseDividendInfo?.bonus, treasury, coinPriceObj])

  useDebounceEffect(() => {
    calculateAPR()
  }, [phaseDividendInfo?.bonus, treasury, coinPriceObj])

  return { cetusApr }
}

/**
 * 获取用户的奖励信息
 */
export function useGetUserRewards(currentPeriod?: number) {
  const { dividendRewardList } = useXCetusStore()
  const { fetchTokenInfo } = useGetToken()
  const { getTokenAmountValue } = useTokenPrice()
  const [summaryRewardList, setSummaryRewardList] = useState<XCetusRewardInfo[]>([])
  const [rewardList, setRewardList] = useState<DividendReward[]>([])
  const [totalRewardValue, setTotalRewardValue] = useState<string>('0')

  const calculateRewards = useCallback(async () => {
    let totalValue = d(0)

    // 过滤掉奖励全为0的 和  当期的奖励
    const filteredList = dividendRewardList.filter(item => {
      if (item.period === currentPeriod) {
        return false
      }
      if (item.rewards.find(reward => d(reward.amount).eq(0))) {
        return false
      }
      return true
    })

    console.log('🚀 ~ file: useXCetusHelper.ts:107 ~ calculateRewards ~ filteredList:', {
      filteredList,
      dividendRewardList,
      currentPeriod
    })

    setRewardList(filteredList)

    const rewardMap: Record<string, XCetusRewardInfo> = {}
    const coinTypeList = filteredList.flatMap(item => item.rewards.map(reward => fixCoinType(reward.coin_type, false)))
    const tokenMap = await fetchTokenInfo<string[]>(coinTypeList)

    filteredList.forEach(item => {
      for (const reward of item.rewards) {
        const coinType = fixCoinType(reward.coin_type, false)
        const coinInfo = tokenMap?.get(coinType)
        if (coinInfo) {
          const amount = fromDecimalsAmount(reward.amount, coinInfo.decimals).toString()

          const amountValue = getTokenAmountValue(coinType, amount)
          // console.log('🚀 -------------------------------------------------------------------------------🚀')
          // console.log('🚀 ~ file: useXCetusHelper.ts:213 ~ calculateRewards ~ amountValue:', amountValue, coinType)
          // console.log('🚀 -------------------------------------------------------------------------------🚀')

          totalValue = totalValue.add(amountValue)

          // 更新 rewardMap
          rewardMap[coinType] = rewardMap[coinType]
            ? {
                ...rewardMap[coinType],
                amount: d(rewardMap[coinType].amount).add(amount).toString(),
                value: d(rewardMap[coinType].value).add(amountValue).toString()
              }
            : {
                amount,
                coin_type: coinType,
                value: amountValue
              }
        }
      }
    })
    setSummaryRewardList(
      Object.values(rewardMap)
        .filter(item => d(item.amount).gt(0))
        .sort((a, b) => d(b.value).sub(a.value).toNumber())
    )

    setTotalRewardValue(totalValue.toString())
  }, [dividendRewardList, getTokenAmountValue, currentPeriod])

  useEffect(() => {
    if (currentPeriod) {
      calculateRewards()
    }
  }, [dividendRewardList, currentPeriod])

  return {
    summaryRewardList,
    rewardList,
    totalRewardValue
  }
}

export const XCetusVeNFTType = `${xcetusConfig.xcetus.package_id}::xcetus::VeNFT`
export const XCetusLockCetusType = `${xcetusConfig.xcetus.package_id}::lock_coin::LockedCoin<${envConfigs.cetus_coin.coin_type}>`

export function buildVeNFT(dataList: any[]) {
  let veNFT: VeNFT | undefined
  dataList.forEach(item => {
    if (item) {
      const type = extractStructTagFromType(getMoveObjectType(item) as string).source_address
      if (type === XCetusVeNFTType && item.data && item.data.content) {
        const { fields } = item.data.content

        veNFT = {
          ...buildNFT(item),
          id: fields.id.id,
          index: fields.index,
          type,
          xcetus_balance: fields.xcetus_balance
        }
        return veNFT
      }
    }
  })
  return veNFT
}

export async function buildLockCetus(dataList: any[], xCetusSdk: CetusXcetusSDK) {
  const lockCetusList: LockCetus[] = []
  for (let i = 0; i < dataList.length; i++) {
    const item = dataList[i]
    if (item) {
      const type = extractStructTagFromType(getMoveObjectType(item) as string).source_address
      if (type === XCetusLockCetusType && item.data) {
        const lockCetus = XCetusUtil.buildLockCetus(item.data.content)
        lockCetus.xcetus_amount = await xCetusSdk.XCetusModule.getXCetusAmount(lockCetus.id)
        lockCetusList.push(lockCetus)
      }
    }
  }
  return lockCetusList
}
