import useTransaction from '@/hooks/common/useTransaction'
import useCurrentApiPool from '@/hooks/position/useCurrentApiPool'
import useZapSubmit from '@/hooks/zap/useZapSubmit'
import useGlobalStore from '@/store/common/global'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import useZapStore from '@/store/zap'
import { PosBaseInfo, PosReward } from '@/types'
import { formatDescription } from '@/utils'
import { useAccountBalance, useDebounceFunction } from '@cetus/hooks'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import { useAccountStore } from '@cetus/stores'
import { BalanceChanges, CommonTypeInfo, Token, TransactionStatusType } from '@cetus/types'
import { Decimal, amountToBN, bnToAmount, d, formatNumber, formatNumberWithDown, getBalanceChanges, isAvailableObject } from '@cetus/utils'
import { fromDecimalsAmount, toDecimalsAmount } from '@cetusprotocol/common-sdk'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 } from 'uuid'
import useGetContractPoolInfo from '../pool/useGetContractPoolInfo'
import useCurrentPos from './useCurrentPos'
import useGetPosLiquiditys from './useGetPosLiquiditys'
import usePosAdd from './usePosAdd'
import usePosHelper from './usePosHelper'
import usePosRemove from './usePosRemove'

export default function usePosRemovePage() {
  const { transactionConfirmation } = useTransactionModal()
  const { getTokenAmountValue, getTokenPrice } = useTokenPrice()
  const { getCoinAmountFromLiquidity } = useGetPosLiquiditys()
  const { currentPosBaseInfo, posLiquidityData, posRewardsData, setPosBaseList, posApiPoolData } = usePositionStore()
  const { getCurrentPosBaseInfo, getCurrentPosHistory } = useCurrentPos()
  const { preAdd } = usePosAdd()
  const { getRemoveTsPayload, getCloseTsPayload } = usePosRemove()
  const { getTokenALock, getTokenBLock } = usePosHelper()
  const {
    setTokenAmountAfterA,
    setTokenAmountAfterB,
    currentPosPoolInfo,
    currentPoolSqrtPrice,
    setIsFixedDisplayTokenA,
    slideValue,
    setSlideValue,
    isFixedDisplayTokenA,
    currentPosDetailTab,
    useZapIn,
    curPosContractPoolInfo,
    isAutoClaim,
    setIsAutoClaim
  } = usePositionDetailStore()

  const { getZapWithdrawToastInfo, getZapWithdrawTx, reCalculateZapData } = useZapSubmit('Withdraw')
  const { getContractPoolInfo } = useGetContractPoolInfo()

  const tokenAPrice = getTokenPrice(currentPosBaseInfo?.tokenA?.coin_type)
  const tokenBPrice = getTokenPrice(currentPosBaseInfo?.tokenB?.coin_type)

  const { preDepositeData, currentZapToken, setZapAmount, zapAmount, zapAmountRate } = useZapStore()

  const { currentApiPoolInfo } = useCurrentApiPool(currentPosBaseInfo, posApiPoolData)

  const currentPosRewardsData = posRewardsData[currentPosBaseInfo?.posId as string]

  const { mevProtect, maxCapForGas, transactionMode, customGasPrice, slippage, liquiditySlippage } = useGlobalStore()

  const [tokenAmountA, setTokenAmountA] = useState('')
  const [tokenAmountB, setTokenAmountB] = useState('')
  const [preRemoveLoading, setPreRemoveLoading] = useState(false)
  const [removeLiquidityAmount, setRemoveLiquidityAmount] = useState('')

  const displayTokenA: Token | undefined = currentPosBaseInfo?.displayTokenA
  const displayTokenB: Token | undefined = currentPosBaseInfo?.displayTokenB

  const currentPosLiquidityData = posLiquidityData[currentPosBaseInfo?.posId as string]
  // 余额
  const tokenABalance = formatNumberWithDown(currentPosLiquidityData?.displayCoinAmountA, undefined, true)
  const tokenBBalance = formatNumberWithDown(currentPosLiquidityData?.displayCoinAmountB, undefined, true)

  // 价值
  const tokenAmountValueA = getTokenAmountValue(displayTokenA?.coin_type, tokenAmountA)
  const tokenAmountValueB = getTokenAmountValue(displayTokenB?.coin_type, tokenAmountB)

  const amountValueA = getTokenAmountValue(displayTokenA?.coin_type, tokenAmountA, '--')
  const amountValueB = getTokenAmountValue(displayTokenB?.coin_type, tokenAmountB, '--')
  const totalAmount = amountValueA == '--' || amountValueB == '--' ? '--' : d(tokenAmountValueA).plus(tokenAmountValueB).toString()

  useEffect(() => {
    if (+tokenAmountA || +tokenAmountB) {
      const amountA = +tokenAmountA
      const amountB = +tokenAmountB
      const numA = d(+tokenABalance).sub(amountA)
      const numB = d(tokenBBalance).sub(amountB)
      console.log('🚀 ~ useEffect ~ numA.gt(0):', numA.toString(), numB.toString())
      setTokenAmountAfterA(numA.gt(0) ? numA.toString() : '0')
      setTokenAmountAfterB(numB.gt(0) ? numB.toString() : '0')
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

  const [uuid, setUuid] = useState<string>('')
  const uuidRef = useRef<string>('')

  useEffect(() => {
    console.log('🚀 ~ usePosRemovePage ~ uuid:', uuid)
    uuidRef.current = uuid
  }, [uuid])

  const resetInputAmount = () => {
    setTokenAmountA('')
    setTokenAmountB('')
    setPreRemoveLoading(false)
    setUuid('')
    setSlideValue('--')
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

  const debouncedPreCalculate = useDebounceFunction((amount, is_fixed_displaytokenA, uuid) => {
    console.log('🚀 ~ debouncedPreCalculate ~ params:', amount)
    const decimals = is_fixed_displaytokenA ? currentPosBaseInfo?.displayTokenA?.decimals : currentPosBaseInfo?.displayTokenB?.decimals
    const amountBN = amountToBN(amount, decimals)
    const tokenA = currentPosBaseInfo?.tokenA
    const tokenB = currentPosBaseInfo?.tokenB
    const lowerTick = currentPosBaseInfo?.lowerTick
    const upperTick = currentPosBaseInfo?.upperTick
    const isReverse = currentPosBaseInfo?.isReverse
    // const curSqrtPrice = currentPosPoolsOriginalData.current_sqrt_price
    const curSqrtPrice = currentPoolSqrtPrice

    const params = {
      amount: amountBN,
      tokenA,
      tokenB,
      isTokenA: isReverse ? !is_fixed_displaytokenA : is_fixed_displaytokenA,
      lowerTick,
      upperTick,
      curSqrtPrice,
      isReverse,
      roundUp: false
    }
    console.log('🚀 ~ debouncedPreCalculate ~ params:', params)
    const { displayCoinAmountA, displayCoinAmountB, liquidityAmount } = preAdd(params)
    console.log('🚀 ~ debouncedPreCalculate:', displayCoinAmountA, displayCoinAmountB, params, is_fixed_displaytokenA, uuid)
    if (uuidRef.current === uuid) {
      setRemoveLiquidityAmount(liquidityAmount)
      console.log('🚀 ~ debouncedPreCalculate ~ liquidityAmount:', removeLiquidityAmount, liquidityAmount)

      const slide = formatNumber(d(liquidityAmount).div(currentPosBaseInfo?.liquidity).mul(100).toNumber(), 2, true)
      if (d(slide).gt(100) || d(slide).eq(100)) {
        setSlideValue(100)
        setTokenAmountA(tokenABalance as string)
        setTokenAmountB(tokenBBalance as string)
      } else {
        setSlideValue(slide)
        if (is_fixed_displaytokenA) {
          setTokenAmountB(displayCoinAmountB || '')
        } else {
          setTokenAmountA(displayCoinAmountA || '')
        }
      }
    } else {
      resetInputAmount()
    }
    setPreRemoveLoading(false)
  }, 500)
  const [isUpdateSlider, setIsUpdateSlider] = useState(false)
  // 重新计算 (刷新按钮价格更新时 交易失败时)
  const reCalculateResult = () => {
    if ((tokenAmountA || tokenAmountB) && isAvailableObject(currentPosBaseInfo)) {
      console.log('🚀 ~ reCalculateResult ~ isFixedDisplayTokenA:', isUpdateSlider, slideValue)
      if (slideValue === '--') return
      if (isUpdateSlider || Number(slideValue) == 100) {
        changeSlideFun(Number(slideValue))
      } else {
        console.log('🚀 ~ reCalculateResult ~ currentPosBaseInfo:', currentPosBaseInfo)
        const amount = isFixedDisplayTokenA ? tokenAmountA : tokenAmountB
        if (+amount) {
          const uuid = v4()
          setUuid(uuid)
          debouncedPreCalculate(amount, isFixedDisplayTokenA, uuid)
        }
      }
    }
  }

  useEffect(() => {
    if (currentPosDetailTab == 'remove') {
      console.log('🚀 ~ usePosRemovePage ~ tokenABalance, tokenBBalance:', tokenABalance, tokenBBalance)
      reCalculateResult()
    }
  }, [tokenABalance, tokenBBalance])

  /**
   * 输入数量监听
   * @param amount
   */

  const handleAmountChange = (amount: string, is_fixed_displaytokenA: boolean) => {
    console.log('🚀 ~ h111andleAmountChange ~ amount:', amount)
    setIsUpdateSlider(false)
    setRemoveLiquidityAmount('')
    if (!amount) {
      resetInputAmount()
      return
    }
    setPreRemoveLoading(true)
    setIsFixedDisplayTokenA(is_fixed_displaytokenA)
    if (is_fixed_displaytokenA) {
      setTokenAmountA(amount)
      if (d(amount).eq(tokenABalance)) {
        setTokenAmountB(tokenBBalance as string)
        setSlideValue(100)
        setUuid('')
        setPreRemoveLoading(false)
        return
      }
    } else {
      setTokenAmountB(amount)
      if (d(amount).eq(tokenBBalance)) {
        setTokenAmountA(tokenABalance as string)
        setSlideValue(100)
        setUuid('')
        setPreRemoveLoading(false)
        return
      }
    }

    console.log('🚀 ~ handleAmountChange ~ amount:', amount, +amount)
    if (+amount) {
      const uuid = v4()
      setUuid(uuid)
      console.log('🚀 ~ handleAmountChange ~ params:', amount)
      debouncedPreCalculate(amount, is_fixed_displaytokenA, uuid)
    } else {
      setPreRemoveLoading(false)
      if (is_fixed_displaytokenA) {
        setTokenAmountB('')
      } else {
        setTokenAmountA('')
      }
      setSlideValue('--')
    }
  }

  // //滑杆数值改变时用流动性改变input的值
  const changeSlideFun = (num: number) => {
    setIsUpdateSlider(true)
    console.log('🚀 ~ changeSlideFun ~ changeSlideFun:', tokenABalance, tokenBBalance, num)

    if (!useZapIn) {
      if (num == 100) {
        setTokenAmountA(tokenABalance)
        setTokenAmountB(tokenBBalance)
      } else {
        const tokenA: Token = currentPosBaseInfo?.tokenA
        const tokenB: Token = currentPosBaseInfo?.tokenB
        const liquidity = formatNumberWithDown(d(currentPosBaseInfo?.liquidity).mul(num).div(100).toString() || '0', 0, true)
        console.log('🚀 ~ changeSlideFun ~ liquidity1111111:', currentPosBaseInfo?.liquidity, liquidity)
        const lowerTick = currentPosBaseInfo?.lowerTick
        const upperTick = currentPosBaseInfo?.upperTick
        const isReverse = currentPosBaseInfo?.isReverse
        const params = { tokenA, tokenB, liquidity, currentSqrtPrice: currentPoolSqrtPrice, lowerTick, upperTick, roundUp: false }
        try {
          const { amountA, amountB } = getCoinAmountFromLiquidity(params)
          setRemoveLiquidityAmount(liquidity)
          const displayCoinAmountA = !isReverse ? amountA : amountB
          const displayCoinAmountB = !isReverse ? amountB : amountA
          console.log('🚀 ~ changeSlideFun ~  coinAmountA, coinAmountB:', amountA, amountB)
          setTokenAmountA(d(displayCoinAmountA).gt(0) ? displayCoinAmountA : '')
          setTokenAmountB(d(displayCoinAmountB).gt(0) ? displayCoinAmountB : '')
        } catch (error) {
          console.log('🚀 ~ changeSlideFun ~ error:', error)
          setTokenAmountA('')
          setTokenAmountB('')
        }
      }
    } else {
      const isCoin = currentApiPoolInfo?.tokenA?.coin_type === currentZapToken?.coin_type
      const balance = isCoin ? onlyAmountA : onlyAmountB
      if (num === 100) {
        setZapAmount(balance)
      } else {
        const value = d(balance).mul(d(num).div(100)).toString()
        setZapAmount(value)
      }
    }
  }

  const { currentAccount } = useAccountStore()
  const btnStatusText = useMemo(() => {
    const btnInfo: {
      text?: string
      disabled: boolean
    } = {
      text: 'Remove',
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
    if (!showDisplayTokenALock && tokenAmountA && d(tokenAmountA).gt(tokenABalance || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Invalid Amount`
      return btnInfo
    }
    //判断余额
    if (!showDisplayTokenBLock && tokenAmountB && d(tokenAmountB).gt(tokenBBalance || 0)) {
      btnInfo.disabled = true
      btnInfo.text = `Invalid Amount`
      return btnInfo
    }

    if (currentPosBaseInfo?.posType == 'burn') {
      btnInfo.disabled = true
      return btnInfo
    }
    return btnInfo
  }, [tokenAmountA, tokenAmountB, tokenABalance, tokenBBalance, currentAccount?.address])

  const { signAndExecuteTransaction } = useTransaction()
  const { fetchAccountBalance } = useAccountBalance()
  const [isRemoveLoading, setIsRemoveLoading] = useState(false)
  const navigate = useNavigate()
  const toRemove = async () => {
    setIsRemoveLoading(true)
    const isVestingPos = !!currentPosBaseInfo?.vestData
    console.log('🚀 ~ toRemove ~ isVestingPos:', isVestingPos)
    let isClosed = slideValue == 100 && !isVestingPos
    const isVestingPosAndRemoveAll = isVestingPos && slideValue === 100
    console.log('🚀 ~ toRemove ~ isClosed:', isClosed)
    console.log('🚀 ~ toRemove ~ currentPosRewardsData:', currentPosRewardsData)
    console.log('🚀 ~ toRemove ~ currentPosBaseInfo:', currentPosBaseInfo)
    console.log('🚀 ~ toRemove ~ currentPosPoolInfo?.miningRewardList:', currentPosPoolInfo?.miningRewardList)

    let rewarderCoinTypes: string[] = []
    if (curPosContractPoolInfo) {
      curPosContractPoolInfo.rewarder_infos.map((item: any) => {
        rewarderCoinTypes.push(item.coinAddress)
      })
    }
    console.log('🚀 ~ toRemove ~ rewarderCoinTypes1:', rewarderCoinTypes)
    if (rewarderCoinTypes.length === 0) {
      rewarderCoinTypes = isClosed
        ? !currentPosRewardsData || currentPosRewardsData?.length == 0
          ? (currentPosPoolInfo?.miningRewardList || [])?.reduce((arr: string[], item: any) => {
              arr.push(item.coinType)
              return arr
            }, [])
          : (currentPosRewardsData || [])?.reduce((arr: string[], item: PosReward) => {
              arr.push(item.coin_address)
              return arr
            }, [])
        : (currentPosRewardsData || [])?.reduce((arr: string[], item: PosReward) => {
            if (d(item?.amount_owed).gt(0)) {
              arr.push(item.coin_address)
            }
            return arr
          }, [])
    }

    console.log('🚀 ~ toRemove ~ rewarderCoinTypes2:', rewarderCoinTypes)

    let amountA, amountB
    try {
      let tx
      let msafeParams
      let toastInfo
      if (!useZapIn) {
        amountA = !currentPosBaseInfo?.isReverse
          ? d(tokenAmountA).mul(Decimal.pow(10, displayTokenA!.decimals)).toString()
          : d(tokenAmountB).mul(Decimal.pow(10, displayTokenB!.decimals)).toString()
        amountB = !currentPosBaseInfo?.isReverse
          ? d(tokenAmountB).mul(Decimal.pow(10, displayTokenB!.decimals)).toString()
          : d(tokenAmountA).mul(Decimal.pow(10, displayTokenA!.decimals)).toString()

        console.log('🚀 ~ toAdd ~ rewarderCoinTypes:', currentPosPoolInfo, currentPosRewardsData, rewarderCoinTypes)

        const params: any = {
          posId: currentPosBaseInfo?.posType == 'farms' ? currentPosBaseInfo?.id : currentPosBaseInfo?.posId,
          poolAddress: currentPosBaseInfo?.clmmPool,
          coinTypeA: currentPosBaseInfo?.coinTypeA,
          coinTypeB: currentPosBaseInfo?.coinTypeB,
          amountA,
          amountB,
          liquidity: removeLiquidityAmount,
          lowerTick: currentPosBaseInfo?.lowerTick,
          upperTick: currentPosBaseInfo?.upperTick,
          posType: currentPosBaseInfo?.posType,
          rewarderCoinTypes,
          isAutoClaim
        }
        if (currentPosBaseInfo?.posType == 'farms') {
          params['farmsPoolId'] = currentPosBaseInfo?.farmsPool
          params['farmsPosId'] = currentPosBaseInfo?.id
        }

        if (isVestingPosAndRemoveAll) {
          params['liquidity'] = currentPosBaseInfo.liquidity
        }

        toastInfo = {
          getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
            const description =
              'Remove ' +
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

              info.toastDescriptionContent = ''
              info.modalDescriptionText = ''
              info.toastTitleText = 'Remove Liquidity Successful'
            }

            return info
          }
        }
        transactionConfirmation(toastInfo)

        console.log('🚀 ~ toAdd ~ params:', removeLiquidityAmount, isClosed, slideValue, params)
        const payload = isClosed ? await getCloseTsPayload(params) : await getRemoveTsPayload(params, isVestingPosAndRemoveAll)
        tx = payload.tx
        msafeParams = payload.msafeParams
      } else {
        const posId: any = currentPosBaseInfo?.posType == 'farms' ? currentPosBaseInfo?.id : currentPosBaseInfo?.posId
        toastInfo = getZapWithdrawToastInfo(showDisplayTokenALock, showDisplayTokenBLock)
        transactionConfirmation(toastInfo)
        const zapRes = await getZapWithdrawTx(
          posId,
          currentPosBaseInfo!.liquidity,
          currentPosBaseInfo!.lowerTick,
          currentPosBaseInfo!.upperTick,
          rewarderCoinTypes,
          currentPosBaseInfo?.posType == 'farms',
          isVestingPos,
          isAutoClaim
        )

        tx = zapRes.tx

        if (zapRes.isClose) {
          isClosed = true
        }
      }

      const trackData = {
        posId: currentPosBaseInfo?.posType == 'farms' ? currentPosBaseInfo?.id : currentPosBaseInfo?.posId,
        poolAddress: currentPosBaseInfo?.clmmPool,
        coinTypeA: currentPosBaseInfo?.coinTypeA,
        coinTypeB: currentPosBaseInfo?.coinTypeB,
        amountA,
        amountB,
        liquidity: removeLiquidityAmount,
        lowerTick: currentPosBaseInfo?.lowerTick,
        upperTick: currentPosBaseInfo?.upperTick,
        posType: currentPosBaseInfo?.posType,
        rewarderCoinType1: rewarderCoinTypes?.[0],
        rewarderCoinType2: rewarderCoinTypes?.[1],
        rewarderCoinType3: rewarderCoinTypes?.[2],
        farmsPoolId: currentPosBaseInfo?.posType == 'farms' ? currentPosBaseInfo?.farmsPool : undefined,
        slippage,
        liquiditySlippage,
        txAction: useZapIn ? 'removeLiquidity-zap' : 'removeLiquidity'
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
        fetchAccountBalance()
        resetInputAmount()
        setZapAmount('')
        if (isClosed || isVestingPosAndRemoveAll) {
          setPosBaseList([])
          setTimeout(() => {
            navigate('/pools?tab=positions')
          }, 500)
        } else {
          getCurrentPosBaseInfo(currentAccount!.address, currentPosBaseInfo!.id, true)
          // getCurrentPosHistory(currentPosBaseInfo?.id as string, currentPosBaseInfo?.posId as string)
        }
      } else {
        if (currentPosBaseInfo?.clmmPool) {
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
      setIsRemoveLoading(false)
    } catch (error) {
      reCalculateResult()
      setIsRemoveLoading(false)
      console.log('🚀 ~ toClaim ~ error:', error)
    }
  }

  const amountBalance = useMemo(() => {
    if (currentPosBaseInfo?.posId) {
      const tokenA: Token = currentPosBaseInfo?.tokenA
      const tokenB: Token = currentPosBaseInfo?.tokenB
      const liquidity = currentPosBaseInfo?.liquidity
      const lowerTick = currentPosBaseInfo?.lowerTick
      const upperTick = currentPosBaseInfo?.upperTick

      const params = { tokenA, tokenB, liquidity, currentSqrtPrice: currentPoolSqrtPrice, lowerTick, upperTick, roundUp: false }
      const { amountA, amountB } = getCoinAmountFromLiquidity(params)
    }
  }, [currentPosBaseInfo?.posId, currentPoolSqrtPrice])

  // 为方便zap时候展示某个币总额
  const { onlyAmountA, onlyAmountB } = useMemo(() => {
    if (tokenAPrice && tokenBPrice && currentPosLiquidityData && currentPosBaseInfo) {
      const { coinAmountA, coinAmountB } = currentPosLiquidityData
      const price = d(tokenAPrice.price).div(tokenBPrice.price).toString()

      const coinAmountAFormat = fromDecimalsAmount(coinAmountA, currentPosBaseInfo.tokenA.decimals)
      const coinAmountBFormat = fromDecimalsAmount(coinAmountB, currentPosBaseInfo.tokenB.decimals)

      const transformToAmountB = d(coinAmountAFormat).mul(price)
      const transformToAmountA = d(coinAmountBFormat).div(price)

      return {
        onlyAmountA: d(transformToAmountA).add(coinAmountAFormat).toFixed(currentPosBaseInfo.tokenB.decimals),
        onlyAmountB: d(transformToAmountB).add(coinAmountBFormat).toFixed(currentPosBaseInfo.tokenA.decimals)
      }
    }

    return {
      onlyAmountA: currentPosLiquidityData?.onlyAmountA,
      onlyAmountB: currentPosLiquidityData?.onlyAmountB
    }
  }, [currentPosLiquidityData, tokenAPrice, tokenBPrice, currentPosBaseInfo?.tokenA?.coin_type, currentPosBaseInfo?.tokenB?.coin_type])

  useEffect(() => {
    if (useZapIn) {
      if (zapAmount) {
        const isCoin = currentApiPoolInfo?.tokenA?.coin_type === currentZapToken?.coin_type
        const balance = isCoin ? onlyAmountA : onlyAmountB
        if (balance) {
          const value = formatNumber(d(zapAmount).div(balance).mul(100).toString(), 2, true)
          setSlideValue(value)
        } else {
          setSlideValue('--')
        }
      } else {
        setSlideValue('--')
      }
    } else {
      setSlideValue('--')
    }
  }, [useZapIn, zapAmount])

  // zapIn时候根据计算结果设置amountA,B,  主要为了左侧after相关展示
  useEffect(() => {
    if (currentPosDetailTab === 'increase') return
    if (useZapIn) {
      console.log('🚀 ~ usePosRemovePage111 ~ preDepositeData:', preDepositeData)
      if (preDepositeData?.amount_a || preDepositeData?.amount_b) {
        const tokenA = currentPosBaseInfo?.tokenA
        const tokenB = currentPosBaseInfo?.tokenB
        const amountA = bnToAmount(preDepositeData?.amount_a, tokenA?.decimals)
        const amountB = bnToAmount(preDepositeData?.amount_b, tokenB?.decimals)

        // 100%时候after设置为0
        if (slideValue == 100) {
          setTokenAmountA(String(tokenABalance))
          setTokenAmountB(String(tokenBBalance))
        } else {
          const a = !currentPosBaseInfo?.isReverse ? amountA : amountB
          const b = !currentPosBaseInfo?.isReverse ? amountB : amountA
          setTokenAmountA(d(a).gt(tokenABalance) ? String(tokenABalance) : a)
          setTokenAmountB(d(b).gt(tokenBBalance) ? String(tokenBBalance) : b)
        }

        return
      }

      setTokenAmountA('')
      setTokenAmountB('')
    }
  }, [useZapIn, preDepositeData, slideValue])

  useEffect(() => {
    setTokenAmountA('')
    setTokenAmountB('')
  }, [])

  useEffect(() => {
    if (+slideValue && d(slideValue).eq(100)) {
      setIsAutoClaim(true)
    }
  }, [slideValue])

  return {
    totalAmount,
    tokenAmountA,
    tokenAmountB,
    resetInputAmount,
    showDisplayTokenALock,
    showDisplayTokenBLock,
    currentPosLiquidityData,
    tokenABalance,
    tokenBBalance,
    displayTokenA,
    displayTokenB,
    tokenAmountValueA,
    tokenAmountValueB,
    preRemoveLoading,
    handleAmountChange,
    btnStatusText,
    changeSlideFun,
    toRemove,
    isRemoveLoading,
    onlyAmountA,
    onlyAmountB,
    currentApiPoolInfo,
    currentPoolSqrtPrice
  }
}
