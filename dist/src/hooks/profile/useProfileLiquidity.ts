import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types/position'
import { useSdk } from '@cetus/sdk-factory'
import { d, extractStructTagFromType } from '@cetusprotocol/common-sdk'
import { Transaction } from '@mysten/sui/transactions'
import { normalizeSuiAddress } from '@mysten/sui/utils'
import BN from 'bn.js'
import useGetFarmsPosRewards from '../position/useGetFarmsPosRewards'
import useGetPosApiPoolData from '../position/useGetPosApiPoolData'
import useGetPosLiquiditys from '../position/useGetPosLiquiditys'
import useGetPosPools from '../position/useGetPosPools'
import useGetPosRewards from '../position/useGetPosRewards'
import useGetPosfees from '../position/useGetPosfees'
import { useRefreshCoinPriceInfo } from './useProfileHelper'
export function useProfileLiquidity() {
  const farmsSdk = useSdk('farms')
  const clmmSdk = useSdk('clmm')
  const { getPosApiPoolData } = useGetPosApiPoolData()
  const { getPosPoolsOriginalObj, getPosPoolsRelatedData } = useGetPosPools()
  const { getPosLiquidityData } = useGetPosLiquiditys()
  const {
    setPosLiquidityData,
    setFarmsPosRewardsData,
    setFarmsPosRewardsDataLoading,
    setPosRewardsData,
    setPosRewardsDataLoading,
    setPosFeeData,
    setPosFeeDataLoading,
    setPosBaseListLoading
  } = usePositionStore()

  const { formatFarmsRewardsData } = useGetFarmsPosRewards()
  const { formatPosRewardsData } = useGetPosRewards()
  const { formatPosFeeData } = useGetPosfees()
  const { refreshCoinPriceInfo } = useRefreshCoinPriceInfo()

  const fetchPosRelatedData = async (posBaseList: PosBaseInfo[]) => {
    const farmsPosList = posBaseList.filter((item: PosBaseInfo) => item.posType === 'farms' && item.farmsPool)

    // 获取池子信息
    const posPoolsOriginalData = await getPosPoolsOriginalObj(posBaseList)
    getPosPoolsRelatedData(posBaseList, posPoolsOriginalData)

    if (Object.keys(posPoolsOriginalData)?.length === 0) {
      setPosLiquidityData({})
      setPosBaseListLoading(false)
      throw new Error('No pool data found')
      return
    }

    getPosApiPoolData(posBaseList)
    // 处理流动性
    getPosLiquidityData(posBaseList, posPoolsOriginalData)
    const tx = new Transaction()
    // farms 奖励
    if (farmsPosList.length > 0) {
      farmsPosList.forEach((item: PosBaseInfo) => {
        farmsSdk!.Farms.buildCalculateFarmingReward(
          {
            pool_id: item.farmsPool!,
            position_nft_id: item.id
          },
          tx
        )
      })
    }

    // fee
    posBaseList.forEach((item: PosBaseInfo) => {
      clmmSdk!.Position.buildFetchPosFee(
        {
          pool_id: item.clmmPool,
          position_id: item.posId,
          coin_type_a: item.coinTypeA,
          coin_type_b: item.coinTypeB
        },
        tx
      )
    })

    // clmm 奖励
    posBaseList
      .filter((item: PosBaseInfo) => item.posType !== 'farms')
      .forEach((item: PosBaseInfo) => {
        const poolInfo = posPoolsOriginalData[item.clmmPool]
        clmmSdk!.Rewarder.buildFetchPosReward(
          {
            pool_id: item.clmmPool,
            position_id: item.posId,
            coin_type_a: item.coinTypeA,
            coin_type_b: item.coinTypeB,
            rewarder_types: poolInfo.rewarder_infos?.map(item => item.coinAddress)
          },
          tx
        )
      })

    try {
      setFarmsPosRewardsDataLoading(true)
      setPosRewardsDataLoading(true)
      setPosFeeDataLoading(true)
      // 执行模拟交易
      const simulateRes = await clmmSdk!.FullClient.devInspectTransactionBlock({
        transactionBlock: tx,
        sender: normalizeSuiAddress('0x0')
      })
      // 处理数据
      const farmsRewardData = farmsSdk!.Farms.parsedPosRewardData(simulateRes)
      const clmmRewardData = clmmSdk!.Rewarder.parsedPosRewardData(simulateRes)
      const clmmFeeData = clmmSdk!.Position.parsedPosFeeData(simulateRes)

      console.log('🚀 ~ fetchPosRelatedData ~ parsedPosRewardData:', {
        farmsRewardData,
        clmmRewardData,
        clmmFeeData
      })

      // farms 奖励
      const posFarmsRewardsObj = await formatFarmsRewardsData(farmsRewardData)
      setFarmsPosRewardsData(posFarmsRewardsObj)

      // clmm 奖励
      const posRewardsData = await formatPosRewardsData(
        Object.values(clmmRewardData).map(item => {
          const poolInfo = posPoolsOriginalData[posBaseList.find(pos => pos.posId === item.position_id)!.clmmPool]
          return {
            poolAddress: poolInfo.pool_address,
            positionId: item.position_id,
            rewarderAmountOwed: item.rewarder_amount.map((amount: string, index: number) => {
              return {
                coin_address: poolInfo.rewarder_infos[index].coinAddress,
                amount_owed: new BN(amount)
              }
            })
          }
        })
      )
      setPosRewardsData(posRewardsData)

      //clmm fee
      const posFeeData = await formatPosFeeData(
        Object.values(clmmFeeData).map(item => {
          return {
            position_id: item.position_id,
            fee_owned_a: item.fee_owned_a,
            fee_owned_b: item.fee_owned_b
          }
        }),
        posBaseList
      )
      setPosFeeData(posFeeData)

      console.log('🚀 ~ fetchPosRelatedData ~ posFeeData:', {
        posFeeData,
        posRewardsData,
        posFarmsRewardsObj
      })

      // 刷新token价格
      fetchTokenPrice(posBaseList, posRewardsData, posFarmsRewardsObj)
    } catch (error) {
      console.error('🚀 ~ fetchPosRelatedData ~ error:', error)
    } finally {
      setFarmsPosRewardsDataLoading(false)
      setPosRewardsDataLoading(false)
      setPosFeeDataLoading(false)
    }
  }

  const fetchTokenPrice = async (posBaseList: any, posRewardsData: any, farmsPosRewardsData: any) => {
    console.log('🚀 ~ fetchTokenPrice ~ posRewardsData:', posBaseList, posRewardsData)
    const list: any = []
    if (posBaseList.length > 0) {
      posBaseList.map(item => {
        list.push(extractStructTagFromType(item?.coinTypeA).full_address)
        list.push(extractStructTagFromType(item?.coinTypeB).full_address)
        const currentPosData = posRewardsData[item?.posId] || []
        const currentPosFarmsData = farmsPosRewardsData[item?.id] || []
        const rewardsArr = currentPosData.concat(currentPosFarmsData)
        rewardsArr?.map((reward: any) => {
          if (d(reward?.display_amount_owed).gt(0)) {
            // list.push(reward?.coin_address)
            list.push(extractStructTagFromType(reward?.token?.coin_type).full_address)
          }
        })
      })
      console.log('🚀 ~ fetchTokenPrice ~  Array.from(new Set(list)):', Array.from(new Set(list)))
      const tokenArr: any = Array.from(new Set(list))
      console.log('🚀 ~ refreshTokenPrice ~ list:', tokenArr)

      refreshCoinPriceInfo(tokenArr)
    }
  }

  const resetUserData = () => {
    setPosLiquidityData({})
    setFarmsPosRewardsData({})
    setPosRewardsData({})
    setPosFeeData({})
  }

  return {
    fetchPosRelatedData,
    resetUserData
  }
}
