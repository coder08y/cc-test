import useGlobalStore from '@/store/common/global'
import useCompensationStore from '@/store/compensation'
import { MsafeTransactionSubType } from '@/types'
import { useAccountBalance } from '@cetus/hooks'
import { useAccountStore } from '@cetus/stores'
import { d } from '@cetusprotocol/common-sdk'
import { Transaction } from '@mysten/sui/transactions'
import { useMemo, useState } from 'react'
import useTransaction from '../common/useTransaction'
import useCurrentPos from '../position/useCurrentPos'
import useBurnPosRedeem from './useBurnRedeem'
import useClmmVestRedeem from './useClmmRedeem'
import useCompensationPositionPage from './useCompensationPositionPage'
import useCompensationVaultPage from './useCompensationVaultPage'
import useFarmRedeem from './useFarmRedeem'
import useGetVaultVestInfo from './useGetVaultVestInfo'
import useGetVaultVestList from './useGetVaultVestList'
import useVaultRedeem from './useVaultRedeem'

export default function useRedeem(currentTab: string) {
  const isVault = useMemo(() => currentTab === 'vault', [currentTab])

  const { signAndExecuteTransaction } = useTransaction()
  const { mevProtect, maxCapForGas, transactionMode, customGasPrice } = useGlobalStore()
  const { currentAccount } = useAccountStore()
  const { fetchAccountBalance } = useAccountBalance()

  const [redeemLoading, setRedeemLoading] = useState(false)
  const { getClmmVestRedeemPayload } = useClmmVestRedeem()
  const { getVaultRedeemPayload } = useVaultRedeem()
  const {
    posBaseList,
    vaultPositionList,
    setPosBaseList,
    setPosBaseListGroupByPool,
    setPosTotalAvailableClaim,
    setPosTotalCetusCompensation,
    setVaultPositionList,
    setVaultPosGroupByPool,
    setVltTotalAvailableClaim,
    setVltTotalCetusCompensation,
    setRedeemAllLoading,
    clmmVestInfo,
    redeemAllLoading
  } = useCompensationStore()
  const { getCurrentPosByPosId } = useCurrentPos()
  const { buildCompensationList, groupPositionsByPool, handleGetPositionList } = useCompensationPositionPage()
  const { groupVaultPositionsByPool, handleGetVaultList, processVaultVestList } = useCompensationVaultPage()
  const { getVaultsVestInfoList } = useGetVaultVestInfo()
  const { getCurrentVaultVest } = useGetVaultVestList()
  const { getBurnPosRedeemPayload } = useBurnPosRedeem()
  const { getFarmVestRedeemPayload } = useFarmRedeem()

  const buildFarmRedeemParams = (list: any[]) => {
    const result = []

    for (const pos of list) {
      const periods = pos.vestData?.periodDetails?.filter(p => p.canClaim).map(ele => ele.period) || []

      result[pos.id] = {
        clmmPoolId: pos.clmmPool,
        clmmPositionId: pos.posId,
        period: periods,
        coinTypeA: pos.coinTypeA,
        coinTypeB: pos.coinTypeB,
        farmPositionId: pos.id,
        farmingPoolId: pos.farmsPool,
        liquidity: pos?.liquidity || '0'
      }
    }

    console.log('🚀🚀🚀 ~ useRedeem.ts:71 ~ buildFarmRedeemParams ~ result:', result)
    return Object.values(result) || []
  }

  const buildRedeemParams = (list: any[]) => {
    console.log('🚀🚀🚀 ~ useRedeem.ts:53 ~ buildRedeemParams ~ list:', list)
    return list.flatMap(
      item =>
        item.vestData?.periodDetails
          ?.filter(p => p.canClaim)
          .map(detail => {
            return isVault
              ? {
                  vaultId: item.vaultId,
                  vestingNftId: item.id,
                  period: detail.period,
                  coinTypeA: item.tokenA.coinType,
                  coinTypeB: item.tokenB.coinType
                }
              : {
                  clmmPoolId: item.clmmPool,
                  clmmPositionId: item.posId,
                  period: detail.period,
                  coinTypeA: item.coinTypeA,
                  coinTypeB: item.coinTypeB,
                  posId: item.id
                }
          }) ?? []
    )
  }

  const getRedeemPayload = async (id?: string) => {
    const list = id
      ? (isVault ? vaultPositionList : posBaseList).filter(item => (isVault ? item.id : item.posId) === id)
      : isVault
        ? vaultPositionList
        : posBaseList
    console.log('🚀🚀🚀 ~ useRedeem.ts:79 ~ getRedeemPayload ~ list:', list)
    let tx = new Transaction()
    let msafeParams
    if (isVault) {
      const cetusList = list.filter(ele => ele.category == 'cetus')
      const haedalList = list.filter(ele => ele.category == 'haedal')
      const params = buildRedeemParams(cetusList)
      const haedalParams = buildRedeemParams(haedalList)
      console.log('🚀🚀🚀 ~ useRedeem.ts:91 ~ getRedeemPayload ~ params:', params)
      msafeParams = await getVaultRedeemPayload(params, haedalParams, tx)
    } else {
      const clmmPositionList = list.filter(pos => pos.posType == 'clmm')
      const burnPositionList = list.filter(pos => pos.posType == 'burn')
      const farmPositionList = list.filter(pos => pos.posType == 'farms')
      console.log('🚀🚀🚀 ~ useRedeem.ts:119 ~ getRedeemPayload ~ list:', list)
      const burnParams = buildRedeemParams(burnPositionList)
      const clmmParams = buildRedeemParams(clmmPositionList)
      const farmParams = buildFarmRedeemParams(farmPositionList)

      console.log('useRedeem getRedeemPayload burnParams: ', burnParams)
      console.log('useRedeem getRedeemPayload clmmParams: ', clmmParams)
      console.log('useRedeem getRedeemPayload farmParams: ', farmParams)

      if (burnParams.length > 0) {
        msafeParams = getBurnPosRedeemPayload(burnParams, tx)
      }
      if (farmParams.length > 0) {
        console.log('🚀🚀🚀 ~ useRedeem.ts:130 ~ getRedeemPayload ~ farmParams:', farmParams)
        for (let i = 0; i < farmParams.length; i++) {
          msafeParams = await getFarmVestRedeemPayload(farmParams[i], tx)
        }
      }
      if (clmmParams.length > 0) {
        msafeParams = getClmmVestRedeemPayload(clmmParams, tx)
      }
    }

    console.log('🚀 ~ getRedeemPayload ~ msafeParams:', msafeParams)
    console.log('🚀🚀🚀 ~ useRedeem.ts:104 ~ getRedeemPayload ~ tx:', tx)
    return {
      tx,
      msafeParams: {
        action: MsafeTransactionSubType.PosVestingRedeem,
        txbParams: {
          ...msafeParams
        }
      }
    }
  }

  const updateAfterRedeem = async (id?: string) => {
    if (!currentAccount?.address) return

    if (!isVault) {
      if (id) {
        const pos = await getCurrentPosByPosId(currentAccount.address, id)
        const result = await buildCompensationList([pos], clmmVestInfo)
        const updatedList = posBaseList.map(item => (item.posId === id ? result[0] : item))
        const sorted = [...updatedList].sort((a, b) => b.vestData.cetusAmount - a.vestData.cetusAmount)
        const group = groupPositionsByPool(sorted)
        const totalAvailableClaim = sorted.reduce((acc, cur) => acc.add(cur.vestData.availableAmount), d(0))
        const totalCetusComp = sorted.reduce((acc, cur) => acc.add(cur.vestData.cetusAmount), d(0))

        setPosBaseList(sorted)
        setPosBaseListGroupByPool(group)
        setPosTotalAvailableClaim(totalAvailableClaim.toString())
        setPosTotalCetusCompensation(totalCetusComp.toString())
      } else {
        handleGetPositionList(currentAccount.address)
      }
    } else {
      if (id) {
        console.log('🚀🚀🚀 ~ useRedeem.ts:138 ~ updateAfterRedeem ~ vaultPositionList:', vaultPositionList)
        const vaultItem = vaultPositionList.find(item => item.id === id)
        if (!vaultItem) return
        const updated = await getCurrentVaultVest(currentAccount.address, id, { [vaultItem.vaultId]: vaultItem }, vaultItem.category)
        console.log('🚀🚀🚀 ~ useRedeem.ts:142 ~ updateAfterRedeem ~ updated:', updated)
        const updatedList = vaultPositionList.map(item => (item.id === id ? updated[0] : item))
        console.log('🚀🚀🚀 ~ useRedeem.ts:142 ~ updateAfterRedeem ~ updatedList:', updatedList)
        const vaultIdList: string[] = []
        const haedalVaultIdList: string[] = []
        for (let i = 0; i < updatedList.length; i++) {
          const item = updatedList[i]
          if (item.category == 'cetus' && !vaultIdList.includes(item.vaultId)) {
            vaultIdList.push(item.vaultId)
          }
          if (item.category == 'haedal' && !haedalVaultIdList.includes(item.vaultId)) {
            haedalVaultIdList.push(item.vaultId)
          }
        }
        const vestInfo = await getVaultsVestInfoList(vaultIdList, haedalVaultIdList)
        console.log('🚀🚀🚀 ~ useRedeem.ts:149 ~ updateAfterRedeem ~ vestInfo:', vestInfo)
        const { processedList, totalAvailableClaim, totalCetusCompensation } = await processVaultVestList(updatedList, vestInfo)

        setVaultPositionList(processedList)
        setVaultPosGroupByPool(groupVaultPositionsByPool(processedList))
        setVltTotalAvailableClaim(totalAvailableClaim.toString())
        setVltTotalCetusCompensation(totalCetusCompensation.toString())
      } else {
        handleGetVaultList(currentAccount.address)
      }
    }

    setRedeemLoading(false)
    setRedeemAllLoading(false)
  }

  const handleRedeem = async (id?: string) => {
    setRedeemLoading(true)
    setRedeemAllLoading(true)

    try {
      const { tx, msafeParams } = await getRedeemPayload(id)
      const res = await signAndExecuteTransaction(
        tx,
        {},
        {
          maxCapForGas,
          customGasPrice,
          msafeParams
        }
      )

      if (res) {
        fetchAccountBalance()
        setTimeout(() => updateAfterRedeem(id), 2000)
      } else {
        setRedeemLoading(false)
        setRedeemAllLoading(false)
      }
    } catch (err) {
      console.error('🧨 handleRedeem error:', err)
      setRedeemLoading(false)
      setRedeemAllLoading(false)
    }
  }

  return { handleRedeem, getRedeemPayload, redeemLoading, redeemAllLoading }
}
