import useTransaction from '@/hooks/common/useTransaction'
import useZapSubmit from '@/hooks/zap/useZapSubmit'
import useGlobalStore from '@/store/common/global'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import useZapStore from '@/store/zap'
import { PosBaseInfo, PosReward } from '@/types'
import { formatDescription } from '@/utils'
import { useAccountBalance, useDebounceFunction } from '@cetus/hooks'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useAccountStore } from '@cetus/stores'
import { BalanceChanges, CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { Decimal, amountToBN, bnToAmount, d, formatNumberWithDown, getBalanceChanges, isAvailableObject, textEllipses } from '@cetus/utils'
import { useEffect, useMemo, useRef, useState } from 'react'
import { v4 } from 'uuid'
import useInsufficientBalanceToast from '../common/useInsufficientBalanceToast'
import useGetContractPoolInfo from '../pool/useGetContractPoolInfo'
import useCurrentPos from './useCurrentPos'
import usePosAdd from './usePosAdd'
import usePosHelper from './usePosHelper'

export default function usePosAddPage() {
  const { currentPosBaseInfo, posPoolsOriginalData, posPoolsRelatedData, posRewardsData, posLiquidityData } = usePositionStore()
  const currentPosRewardsData = posRewardsData[currentPosBaseInfo?.posId]
  const { getTokenAmountValue } = useTokenPrice()
  const { transactionConfirmation } = useTransactionModal()
  const { preAdd, getAddTsPayload, getClmmCreateAddData, getFarmsCreateAddData } = usePosAdd()
  const { getTokenALock, getTokenBLock } = usePosHelper()
  const { getCurrentPosBaseInfo, getCurrentPosHistory } = useCurrentPos()
  const {
    setTokenAmountAfterA,
    setTokenAmountAfterB,
    currentPoolSqrtPrice,
    isFixedDisplayTokenA,
    setIsFixedDisplayTokenA,
    curPosContractPoolInfo,
    currentPosDetailTab,
    isPosDetailRefresh,
    useZapIn,
    isAutoClaim
  } = usePositionDetailStore()

  const { getZapDepositToastInfo, getZapDepositTx, reCalculateZapData } = useZapSubmit()
  const { preDepositeData, setZapAmount, setPreDepositeData, zapAmountRate } = useZapStore()

  const [preAddLoading, setPreAddLoading] = useState(false)
  const [tokenMaxA, setTokenMaxA] = useState('')
  const [tokenMaxB, setTokenMaxB] = useState('')
  const [tokenAmountA, setTokenAmountA] = useState('')
  const [tokenAmountB, setTokenAmountB] = useState('')

  const currentPosLiquidityData = useMemo(() => {
    return posLiquidityData[currentPosBaseInfo?.posId as string]
  }, [posLiquidityData, currentPosBaseInfo?.posId])

  // 左侧after展示
  const tokenABalance = formatNumberWithDown(currentPosLiquidityData?.displayCoinAmountA, undefined, true)
  const tokenBBalance = formatNumberWithDown(currentPosLiquidityData?.displayCoinAmountB, undefined, true)
  useEffect(() => {
    if (+tokenAmountA || +tokenAmountB) {
      const amountA = +tokenAmountA
      const amountB = +tokenAmountB
      setTokenAmountAfterA(d(amountA).plus(tokenABalance).toString())
      setTokenAmountAfterB(d(amountB).plus(tokenBBalance).toString())
    } else {
      setTokenAmountAfterA('')
      setTokenAmountAfterB('')
    }
  }, [tokenAmountA, tokenAmountB])

  useEffect(() => {
    return () => {
      setTokenAmountAfterA('')
      setTokenAmountAfterB('')
    }
  }, [])

  const displayTokenA = currentPosBaseInfo?.displayTokenA
  const displayTokenB = currentPosBaseInfo?.displayTokenB

  const { mevProtect, maxCapForGas, transactionMode, customGasPrice, slippage, liquiditySlippage } = useGlobalStore()
  // 余额
  const { balanceInfo: tokenABalanceInfo } = useGetTokenBalance(displayTokenA)
  const { balanceInfo: tokenBBalanceInfo } = useGetTokenBalance(displayTokenB)

  // 价值
  const tokenAmountValueA = getTokenAmountValue(displayTokenA?.coin_type, tokenAmountA)
  const tokenAmountValueB = getTokenAmountValue(displayTokenB?.coin_type, tokenAmountB)

  const [uuid, setUuid] = useState<string>('')
  const uuidRef = useRef<string>('')

  useEffect(() => {
    console.log('🚀 ~ usePosAddPage ~ uuid:', uuid)
    uuidRef.current = uuid
  }, [uuid])

  const resetInputAmount = () => {
    setTokenAmountA('')
    setTokenAmountB('')
    setPreAddLoading(false)
    setUuid('')
  }

  const showTokenALock = useMemo(() => {
    return getTokenALock(currentPosBaseInfo as PosBaseInfo, curPosContractPoolInfo?.current_sqrt_price)
  }, [curPosContractPoolInfo?.current_tick_index, currentPosBaseInfo])

  const showTokenBLock = useMemo(() => {
    return getTokenBLock(currentPosBaseInfo as PosBaseInfo, curPosContractPoolInfo?.current_sqrt_price)
  }, [curPosContractPoolInfo?.current_tick_index, currentPosBaseInfo])

  const showDisplayTokenALock = !currentPosBaseInfo?.isReverse ? showTokenALock : showTokenBLock
  const showDisplayTokenBLock = !currentPosBaseInfo?.isReverse ? showTokenBLock : showTokenALock

  useEffect(() => {
    resetInputAmount()
  }, [showDisplayTokenALock, showDisplayTokenBLock])

  // 预计算防抖
  const debouncedPreAdd = useDebounceFunction((amount, is_fixed_displaytokenA, uuid) => {
    if (currentPosDetailTab !== 'increase') {
      return
    }
    const decimals = is_fixed_displaytokenA ? currentPosBaseInfo?.displayTokenA?.decimals : currentPosBaseInfo?.displayTokenB?.decimals
    const amountBN = amountToBN(amount, decimals)
    const tokenA = currentPosBaseInfo?.tokenA
    const tokenB = currentPosBaseInfo?.tokenB
    const lowerTick = currentPosBaseInfo?.lowerTick
    const upperTick = currentPosBaseInfo?.upperTick
    const isReverse = currentPosBaseInfo?.isReverse
    // const curSqrtPrice = currentPosPoolsOriginalData.current_sqrt_price
    const params = {
      amount: amountBN,
      tokenA,
      tokenB,
      isTokenA: isReverse ? !is_fixed_displaytokenA : is_fixed_displaytokenA,
      lowerTick,
      upperTick,
      curSqrtPrice: currentPoolSqrtPrice,
      isReverse,
      roundUp: true
    }
    console.log('🚀 ~ debouncedPreAdd ~ params:', params)
    const { displayCoinAmountA, displayCoinAmountB, tokenMaxA, tokenMaxB } = preAdd(params)
    // console.log('🚀 ~ debouncedPreAdd:', coinAmountA, coinAmountB, params, is_fixed_displaytokenA, uuid)

    if (uuidRef.current === uuid) {
      setTokenMaxA(tokenMaxA)
      setTokenMaxB(tokenMaxB)
      if (is_fixed_displaytokenA) {
        setTokenAmountB(displayCoinAmountB || '')
      } else {
        setTokenAmountA(displayCoinAmountA || '')
      }
    } else {
      resetInputAmount()
    }
    setPreAddLoading(false)
  }, 500)

  // 重新计算 (刷新按钮价格更新时 交易失败时)
  const reCalculateResult = () => {
    if ((tokenAmountA || tokenAmountB) && isAvailableObject(currentPosBaseInfo)) {
      console.log('🚀 ~ reCalculateResult ~ currentPosBaseInfo:', currentPosBaseInfo)
      const amount = isFixedDisplayTokenA ? tokenAmountA : tokenAmountB
      if (+amount) {
        const uuid = v4()
        setUuid(uuid)
        debouncedPreAdd(amount, isFixedDisplayTokenA, uuid)
      }
    }
  }

  useEffect(() => {
    if (currentPosDetailTab == 'increase' && isPosDetailRefresh) {
      reCalculateResult()
    }
  }, [isPosDetailRefresh])

  /**
   * 输入数量监听
   * @param amount
   */
  const handleAmountChange = (amount: string, is_fixed_displaytokenA: boolean) => {
    console.log('🚀 ~ handleAmountChange ~ amount:', !amount, +amount, amount)
    if (!amount) {
      resetInputAmount()
      return
    }
    setIsFixedDisplayTokenA(is_fixed_displaytokenA)
    if (is_fixed_displaytokenA) {
      setTokenAmountA(amount)
    } else {
      setTokenAmountB(amount)
    }

    if (+amount) {
      setPreAddLoading(true)
      const uuid = v4()
      setUuid(uuid)

      console.log('🚀 ~ handleAmountChange ~ params:', amount)
      debouncedPreAdd(amount, is_fixed_displaytokenA, uuid)
    } else {
      if (is_fixed_displaytokenA) {
        setTokenAmountB('')
      } else {
        setTokenAmountA('')
      }
    }
  }

  const { currentAccount } = useAccountStore()
  const btnStatusText = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Add More Liquidity',
      disabled: false
    }
    if (!currentAccount?.address) {
      btnInfo.text = 'Connect Wallet'
      btnInfo.disabled = false
      return btnInfo
    }

    // 判断输入
    if (!+tokenAmountA && !+tokenAmountB) {
      btnInfo.text = 'Enter an amount'
      btnInfo.disabled = true
      return btnInfo
    }
    //判断余额
    if (!showDisplayTokenALock && tokenAmountA && d(tokenAmountA).gt(tokenABalanceInfo?.balanceFormat || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient ${textEllipses(displayTokenA?.symbol, 10)} Balance`
      return btnInfo
    }
    //判断余额
    if (!showDisplayTokenBLock && tokenAmountB && d(tokenAmountB).gt(tokenBBalanceInfo?.balanceFormat || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Insufficient ${textEllipses(displayTokenB?.symbol, 10)} Balance`
      return btnInfo
    }
    if (!showTokenALock && !showTokenBLock && (!+tokenAmountA || !+tokenAmountB)) {
      btnInfo.disabled = true
      return btnInfo
    }

    if (currentPosBaseInfo?.posType == 'burn') {
      btnInfo.disabled = true
      return btnInfo
    }

    return btnInfo
  }, [tokenAmountA, tokenAmountB, tokenABalanceInfo, tokenBBalanceInfo, currentAccount?.address])

  const { signAndExecuteTransaction } = useTransaction()
  const { getContractPoolInfo } = useGetContractPoolInfo()
  const [isAddLoading, setIsAddLoading] = useState(false)
  const { fetchAccountBalance } = useAccountBalance()
  const { showInsufficientBalanceToast } = useInsufficientBalanceToast()
  const toAdd = async () => {
    setIsAddLoading(true)

    let amount_a
    let amount_b
    try {
      let tx
      let msafeParams
      let toastInfo

      const rewarderCoinTypes = (currentPosRewardsData || [])?.reduce((arr: string[], item: PosReward) => {
        if (d(item?.amount_owed).gt(0)) {
          arr.push(item.coin_address)
        }
        return arr
      }, [])
      if (!useZapIn) {
        const inputAmount = isFixedDisplayTokenA ? tokenAmountA : tokenAmountB
        const tokenDecimals = isFixedDisplayTokenA ? displayTokenA!.decimals : displayTokenB!.decimals
        const amount = d(inputAmount).mul(Decimal.pow(10, tokenDecimals)).toString()

        const fixAmountA = currentPosBaseInfo?.isReverse ? !isFixedDisplayTokenA : isFixedDisplayTokenA

        const lowerTick = currentPosBaseInfo?.lowerTick
        const upperTick = currentPosBaseInfo?.upperTick
        const currentTickIndex = curPosContractPoolInfo?.current_tick_index
        if (currentTickIndex !== undefined && lowerTick !== undefined && upperTick !== undefined) {
          if (currentTickIndex >= lowerTick && currentTickIndex <= upperTick) {
            amount_a = fixAmountA ? amount : tokenMaxA
            amount_b = fixAmountA ? tokenMaxB : amount
          } else if (currentTickIndex > upperTick) {
            amount_a = 0
            amount_b = amount
          } else if (currentTickIndex < lowerTick) {
            amount_a = amount
            amount_b = 0
          }
        }

        console.log('🚀 ~ toAdd ~ lowerTick:', lowerTick, upperTick, currentTickIndex)

        console.log('🚀 ~ toAdd ~ amount_a:', currentPosBaseInfo, amount_a, amount_b)

        console.log('🚀 ~ toAdd ~ rewarderCoinTypes:', currentPosRewardsData, rewarderCoinTypes)

        const params: any = {
          poolAddress: currentPosBaseInfo?.clmmPool,
          coinTypeA: currentPosBaseInfo?.coinTypeA,
          coinTypeB: currentPosBaseInfo?.coinTypeB,
          amountA: amount_a,
          amountB: amount_b,
          fixAmountA,
          lowerTick: currentPosBaseInfo?.lowerTick,
          upperTick: currentPosBaseInfo?.upperTick,
          // currentSqrtPrice: currentPosPoolsRelatedData?.curSqrtPrice,
          currentSqrtPrice: currentPoolSqrtPrice,
          posType: currentPosBaseInfo?.posType,
          rewarderCoinTypes,
          posIndex: currentPosBaseInfo?.index,
          posId: currentPosBaseInfo?.posType == 'farms' ? currentPosBaseInfo?.id : currentPosBaseInfo?.posId,
          isAutoClaim
        }
        if (currentPosBaseInfo?.posType == 'farms') {
          params['farmsPoolId'] = currentPosBaseInfo?.farmsPool
        }

        toastInfo = {
          getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
            const description =
              'Add ' +
              [formatDescription(tokenAmountA, displayTokenA?.symbol), formatDescription(tokenAmountB, displayTokenB?.symbol)]
                .filter(Boolean)
                .join(' and ')

            const info: CommonTypeInfo = {
              modalDescriptionText: description,
              toastTitleText: description
            }

            if (status === 'success') {
              let amountAF = tokenAmountA
              let amountBF = tokenAmountB

              if (balanceChanges) {
                amountAF = getBalanceChanges(balanceChanges, displayTokenA) || tokenAmountA
                amountBF = getBalanceChanges(balanceChanges, displayTokenB) || tokenAmountB
              }
              const description =
                'Add ' +
                [formatDescription(amountAF, displayTokenA?.symbol), formatDescription(amountBF, displayTokenB?.symbol)].filter(Boolean).join(' and ')

              info.toastDescriptionContent = description
              info.modalDescriptionText = description
              info.toastTitleText = 'Supplied Successful'
            }

            return info
          }
        }

        transactionConfirmation(toastInfo)

        console.log('🚀 ~ toAdd ~ params:', params)
        const addPayload = await getAddTsPayload(params)
        tx = addPayload?.tx
        msafeParams = addPayload?.msafeParams
      } else {
        toastInfo = getZapDepositToastInfo()
        transactionConfirmation(toastInfo)
        tx = await getZapDepositTx(currentPosBaseInfo?.lowerTick, currentPosBaseInfo?.upperTick, currentPosBaseInfo?.posType == 'farms', {
          pos_id: currentPosBaseInfo?.posType == 'farms' ? currentPosBaseInfo?.id : currentPosBaseInfo?.posId,
          collect_fee: isAutoClaim,
          collect_rewarder_types: isAutoClaim ? rewarderCoinTypes : []
        })
      }

      const trackData = {
        pool: currentPosBaseInfo?.clmmPool,
        lower: currentPosBaseInfo?.lowerTick,
        upper: currentPosBaseInfo?.upperTick,
        coinTypeA: currentPosBaseInfo?.coinTypeA,
        coinTypeB: currentPosBaseInfo?.coinTypeB,
        amountA: amount_a,
        amountB: amount_b,
        currentSqrtPrice: currentPoolSqrtPrice,
        slippage,
        liquiditySlippage,
        farmsPoolId: currentPosBaseInfo?.posType == 'farms' ? currentPosBaseInfo?.farmsPool : undefined,
        txAction: useZapIn ? 'increaseLiquidity-zap' : 'increaseLiquidity'
      }

      const res = await signAndExecuteTransaction(tx, toastInfo, {
        useMev: mevProtect,
        useFastMode: transactionMode === 'Fast Mode',
        maxCapForGas,
        customGasPrice,
        msafeParams,
        trackData
      })
      console.log('🚀 ~ toClaim ~ res:', res)

      if (res) {
        // 重新拿数据
        fetchAccountBalance()
        resetInputAmount()
        setZapAmount('')
        getCurrentPosBaseInfo(currentAccount?.address as string, currentPosBaseInfo?.id as string, true)
        // getCurrentPosHistory(currentPosBaseInfo?.id as string, currentPosBaseInfo?.posId as string)
      } else {
        if (currentPosBaseInfo) {
          // 如果失败，大概率都是池子价格变化了，需要重新计算
          getContractPoolInfo(currentPosBaseInfo?.clmmPool).then(res => {
            console.log('🚀 ~ toClaim ~ res:', res)
            if (useZapIn) {
              reCalculateZapData()
            } else {
              reCalculateResult()
            }
          })
        }
      }
      setIsAddLoading(false)
    } catch (error: any) {
      console.log('🚀 ~ toClaim ~ error:', error)
      if (useZapIn) {
        reCalculateZapData()
      } else {
        reCalculateResult()
      }
      showInsufficientBalanceToast(String(error))
      setIsAddLoading(false)
    }
  }

  // zapIn时候根据计算结果设置amountA,B,  主要为了左侧after相关展示
  useEffect(() => {
    if (currentPosDetailTab !== 'increase') return
    if (useZapIn) {
      if (preDepositeData?.amount_a || preDepositeData?.amount_b) {
        const tokenA = currentPosBaseInfo?.tokenA
        const tokenB = currentPosBaseInfo?.tokenB
        const amountA = bnToAmount(preDepositeData?.amount_a, tokenA?.decimals)
        const amountB = bnToAmount(preDepositeData?.amount_b, tokenB?.decimals)
        setTokenAmountA(!currentPosBaseInfo?.isReverse ? amountA : amountB)
        setTokenAmountB(!currentPosBaseInfo?.isReverse ? amountB : amountA)
        return
      }
      setTokenAmountA('')
      setTokenAmountB('')
    }
  }, [useZapIn, preDepositeData, currentPosBaseInfo?.isReverse])

  useEffect(() => {
    setTokenAmountA('')
    setTokenAmountB('')
    return () => {
      setPreDepositeData(undefined)
    }
  }, [])

  return {
    tokenAmountA,
    tokenAmountB,
    reCalculateResult,
    preAddLoading,
    preAdd,
    getAddTsPayload,
    displayTokenA,
    displayTokenB,
    tokenABalanceInfo,
    tokenBBalanceInfo,
    tokenAmountValueA,
    tokenAmountValueB,
    handleAmountChange,
    resetInputAmount,
    btnStatusText,
    toAdd,
    isAddLoading,
    showTokenALock,
    showTokenBLock,
    showDisplayTokenALock,
    showDisplayTokenBLock,
    getClmmCreateAddData,
    getFarmsCreateAddData,
    currentPoolSqrtPrice
  }
}
