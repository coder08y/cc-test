import useTransaction from '@/hooks/common/useTransaction'
import { PosBaseInfo } from '@/types'
import { useAccountBalance } from '@cetus/hooks'
import { CommonTypeInfo } from '@cetus/types'
import { useState } from 'react'
import useFarms from './useFarms'

export default function useFarmsActions() {
  const { getBatchHarvestFarmsTxPayload, getStakeTxPayload, getUnstakeTxPayload, getHarvestFarmsTxPayload } = useFarms()
  const { signAndExecuteTransaction } = useTransaction()
  const [claimLoading, setClaimLoading] = useState(false)
  const [unstakeLoading, setUnstakeLoading] = useState(false)
  const { fetchAccountBalance } = useAccountBalance()

  const toClaimAllPos = async (list: PosBaseInfo[], refreshFun: () => void) => {
    setClaimLoading(true)
    try {
      const params: any = []
      list.forEach((position: any) => {
        if (position?.farmsPool) {
          params.push({
            pool_id: position.farmsPool,
            position_nft_id: position.id
          })
        }
      })
      console.log('🚀 ~ list.forEach  toClaimAllPos ~ params:', params)
      const { tx, msafeParams } = await getBatchHarvestFarmsTxPayload(params)
      console.log('🚀 ~ toClaimAllPos ~ tx:', tx)
      const res = await signAndExecuteTransaction(
        tx,
        {
          getShowInfo: () => {
            const info: CommonTypeInfo = {
              modalDescriptionText: ` Claim rewards`,
              toastTitleText: ' Claim'
            }
            return info
          }
        },
        { msafeParams }
      )
      console.log('🚀 ~ toClaimAllPos ~ res:', res)
      if (res) {
        // 重新拿数据
        setTimeout(async () => {
          fetchAccountBalance()
          refreshFun()
        }, 2000)
      }
      setClaimLoading(false)
    } catch (error) {
      setClaimLoading(false)
      console.log('🚀 ~ toClaimAllPos ~ error:', error)
    }
  }

  const toStakePos = async (posInfo: any, farmsPool: string, tokenName: string, refreshFun: (events: any) => void) => {
    console.log('🚀 ~ toStakePos ~ posInfo:', posInfo)

    const { posId, clmmPool, coinTypeA, coinTypeB } = posInfo
    setUnstakeLoading(true)
    try {
      const { tx, msafeParams } = await getStakeTxPayload(posId, farmsPool, clmmPool, coinTypeA, coinTypeB)
      console.log('🚀 ~ toStakePos ~ tx:', tx)
      const res = await signAndExecuteTransaction(
        tx,
        {
          getShowInfo: () => {
            const info: CommonTypeInfo = {
              modalDescriptionText: `Stake ${tokenName}`,
              toastTitleText: 'Stake'
            }
            return info
          }
        },
        { msafeParams }
      )

      if (res) {
        console.log('🚀 ~ toStakePos ~ res:', res)
        refreshFun(res.events)
      }
      setUnstakeLoading(false)
    } catch (error) {
      console.log('🚀 ~ toStakePos ~ error:', error)
      setUnstakeLoading(false)
    }
  }

  const toUnStakePos = async (posId: string, farmsPool: string, tokenName: string, refreshFun: () => void) => {
    setUnstakeLoading(true)
    try {
      const { tx, msafeParams } = await getUnstakeTxPayload(farmsPool, posId)
      console.log('🚀 ~ toUnstack ~ tx:', tx)
      const res = await signAndExecuteTransaction(
        tx,
        {
          getShowInfo: () => {
            const info: CommonTypeInfo = {
              modalDescriptionText: `Unstake ${tokenName}`,
              toastTitleText: 'Unstake'
            }
            return info
          }
        },
        { msafeParams }
      )
      console.log('🚀 ~ toUnStakePos ~ res:', res)

      if (res) {
        // 重新拿数据
        fetchAccountBalance()
        refreshFun()
      }
      setUnstakeLoading(false)
    } catch (error) {
      console.log('🚀 ~ toUnStakePos ~ error:', error)
      setUnstakeLoading(false)
    }
  }

  const toClaimPos = async (posId: string, farmsPool: string, refreshFun: () => void) => {
    setClaimLoading(true)
    try {
      const { tx, msafeParams } = await getHarvestFarmsTxPayload(farmsPool, posId)
      console.log('🚀 ~ toClaimPos ~ tx:', tx)
      const res = await signAndExecuteTransaction(
        tx,
        {
          getShowInfo: () => {
            const info: CommonTypeInfo = {
              modalDescriptionText: ` Claim rewards`,
              toastTitleText: ' Claim'
            }
            return info
          }
        },
        { msafeParams }
      )
      console.log('🚀 ~ toClaimPos ~ res:', res)
      if (res) {
        // 重新拿数据
        fetchAccountBalance()
        refreshFun()
      }
      setClaimLoading(false)
    } catch (error) {
      setClaimLoading(false)
      console.log('🚀 ~ toClaimPos ~ error:', error)
    }
  }
  return {
    toStakePos,
    toUnStakePos,
    toClaimPos,
    toClaimAllPos,
    claimLoading,
    unstakeLoading
  }
}
