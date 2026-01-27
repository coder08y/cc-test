import { MaxBinRangeDisplayNum } from '@/config/dlmm'
import useGetPythLastPrice from '@/hooks/vault-v2/pyth-price/useGetPythLastPrice'
import useGetPythTokenPrice from '@/hooks/vault-v2/pyth-price/useGetPythTokenPrice'
import useDlmmLiquidityStore from '@/store/dlmm'
import useDlmmPositionStore from '@/store/dlmm-position'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { ChartBinItem, CurrentBinChartData, MaxBinRangeChartData } from '@/types/dlmm'
import { DLMMPoolApiInfo } from '@/types/pool'
import { formatBinList, formatPriceFromBin, getRelatedDisplayChartPrice } from '@/utils/dlmm'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { Token } from '@cetus/types'
import { bnToAmount, d, removeComma } from '@cetus/utils'
import { fixCoinType, fromDecimalsAmount } from '@cetusprotocol/common-sdk'
import { BinAmount, BinUtils, DlmmPool } from '@cetusprotocol/dlmm-sdk'
import { useDeepCompareEffect } from 'ahooks'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useCreatePriceBin from './useCreatePriceBin'
import useDlmmGetAllBinWithPool from './useDlmmGetAllBinWithPool'

export const getMaxBinRangeData = ({
  activeBin,
  allBins,
  binStep,
  baseToken,
  quoteToken,
  direct = true,
  maxBin,
  minBin
}: {
  activeBin: number
  allBins: Record<string, ChartBinItem>
  binStep: number
  baseToken: Token
  quoteToken: Token
  maxBin: number
  minBin: number
  direct?: boolean
}) => {
  const minBinNum = minBin == maxBin ? minBin - 1 : minBin
  const maxBinNum = minBin == maxBin ? maxBin + 1 : maxBin

  if (Number(maxBinNum) - Number(minBinNum) >= MaxBinRangeDisplayNum) return
  const createBinItem = (binId: number): ChartBinItem => {
    const item = allBins?.[String(binId)]
    const price = removeComma(formatPriceFromBin(binId, binStep, baseToken?.decimals, quoteToken?.decimals))

    if (item === undefined) {
      const qPrice = BinUtils.getQPriceFromId(binId, binStep)
      const price_per_lamport = BinUtils.getPricePerLamportFromQPrice(qPrice)
      return {
        amount_a: '0',
        amount_b: '0',
        bin_id: binId,
        liquidity: '0',
        price: direct ? price : d(1).div(price).toString(),
        price_per_lamport,
        baseSymbol: baseToken?.symbol,
        quoteSymbol: quoteToken?.symbol,
        baseLogo: baseToken?.logo_url,
        quoteLogo: quoteToken?.logo_url,
        baseAmount: '0',
        quoteAmount: '0'
      }
    }

    const liquidity = item?.liquidity && d(item?.liquidity).gt('0') ? d(item?.liquidity).div(Math.pow(10, 10)).toNumber() : 0
    return {
      amount_a: item?.amount_a || '0',
      amount_b: item?.amount_b || '0',
      bin_id: binId,
      liquidity: liquidity as any,
      price: direct ? price : d(1).div(price).toString(),
      price_per_lamport: item?.price_per_lamport || '',
      baseSymbol: baseToken?.symbol,
      quoteSymbol: quoteToken?.symbol,
      baseLogo: baseToken?.logo_url,
      quoteLogo: quoteToken?.logo_url,
      baseAmount: bnToAmount(item?.amount_a, baseToken?.decimals),
      quoteAmount: bnToAmount(item?.amount_b, quoteToken?.decimals)
    }
  }

  let max = 0
  const combinedList: ChartBinItem[] = []
  for (let i = Number(minBinNum); i <= Number(maxBinNum); i++) {
    const binItem = createBinItem(i)
    if (binItem) {
      combinedList.push(binItem)
      max = binItem?.liquidity ? Math.max(max, Number(binItem.liquidity)) : max
    }
  }
  const sortList = combinedList.sort((a, b) => Number(a.price) - Number(b.price))

  return {
    list: sortList,
    max
  }
}

function useDlmmAddLiquidityChart(direct?: boolean) {
  // const dlmmSdk = useSdk('dlmm')
  const { getBinInfosByAutoFill, getBinInfosByBothAmount } = useCreatePriceBin()
  const { addLiquidityInfo, setMinPriceData, setMaxPriceData, minPriceData, maxPriceData, chartRefreshTrigger, preCalcParams, zapAddLiquidityInfo } =
    useAddDlmmLiquidityStore()
  const { dlmmContractPoolInfo, dlmmApiPoolInfo, isAutoFill } = useDlmmLiquidityStore()
  const poolAllBinObj = useRef<Record<string, ChartBinItem>>({})
  const [maxBinRangeData, setMaxBinRangeData] = useState<MaxBinRangeChartData>()
  const [maxBinLoading, setMaxBinLoading] = useState<boolean>(true)
  const [currentLiquidityBins, setCurrentLiquidityBins] = useState<CurrentBinChartData>()
  const { getBinsInfoByPool } = useDlmmGetAllBinWithPool()
  const { dlmmPosBaseListGroupByPool, dlmmPosLiquidityData } = useDlmmPositionStore()
  const [rangeChangeType, setRangeChangeType] = useState<any>()

  const liquidityInfo = useMemo(() => {
    return addLiquidityInfo || zapAddLiquidityInfo
  }, [zapAddLiquidityInfo, addLiquidityInfo])

  const { getTokenPrice } = useTokenPrice()
  const { getTokenPriceByPyth } = useGetPythTokenPrice()
  const { getPythLastPrice } = useGetPythLastPrice()

  const tokenAPriceInfo = getTokenPrice(dlmmApiPoolInfo?.tokenA?.coin_type)
  const tokenBPriceInfo = getTokenPrice(dlmmApiPoolInfo?.tokenB?.coin_type)

  const tokenAPythPrice = useMemo(() => {
    if (tokenAPriceInfo?.market === 'pyth' && fixCoinType(tokenAPriceInfo?.base_symbol) === fixCoinType(dlmmApiPoolInfo?.tokenA?.coin_type)) {
      return tokenAPriceInfo?.price
    }
    return undefined
  }, [tokenAPriceInfo, dlmmApiPoolInfo?.tokenA?.coin_type])

  const tokenBPythPrice = useMemo(() => {
    if (tokenBPriceInfo?.market === 'pyth' && fixCoinType(tokenBPriceInfo?.base_symbol) === fixCoinType(dlmmApiPoolInfo?.tokenB?.coin_type)) {
      return tokenBPriceInfo?.price
    }
    return undefined
  }, [tokenBPriceInfo, dlmmApiPoolInfo?.tokenB?.coin_type])

  // 其他仓位的bin信息
  const [otherPosBinObj, setOtherPosBinObj] = useState<Record<string, BinAmount>>({})

  const toLargeRange = useMemo(() => {
    if (minPriceData?.binId !== undefined && maxPriceData?.binId !== undefined) {
      return d(minPriceData?.binId).minus(maxPriceData?.binId).abs().gte(MaxBinRangeDisplayNum)
    }
    return false
  }, [minPriceData?.binId, maxPriceData?.binId])

  useDeepCompareEffect(() => {
    if (dlmmApiPoolInfo?.poolId && dlmmPosBaseListGroupByPool && dlmmPosLiquidityData) {
      const otherPosBinList = dlmmPosBaseListGroupByPool[dlmmApiPoolInfo.poolId]
      const newOtherPosBinObj: Record<string, BinAmount> = {}
      otherPosBinList?.list?.forEach(item => {
        const liquidityData = dlmmPosLiquidityData[item.id]
        if (liquidityData) {
          liquidityData.binInfos.bins.forEach(bin => {
            const binInfo = newOtherPosBinObj[bin.bin_id.toString()]
            const amountA = fromDecimalsAmount(bin.amount_a, dlmmApiPoolInfo!.tokenA!.decimals)
            const amountB = fromDecimalsAmount(bin.amount_b, dlmmApiPoolInfo!.tokenB!.decimals)
            if (binInfo) {
              binInfo.amount_a = d(binInfo.amount_a).add(amountA).toString()
              binInfo.amount_b = d(binInfo.amount_b).add(amountB).toString()
            } else {
              newOtherPosBinObj[bin.bin_id.toString()] = {
                amount_a: amountA.toString(),
                amount_b: amountB.toString(),
                bin_id: bin.bin_id,
                price_per_lamport: bin.price_per_lamport,
                liquidity: bin.liquidity
              }
            }
          })
        }
      })

      setOtherPosBinObj({ ...newOtherPosBinObj })
    }
  }, [dlmmPosBaseListGroupByPool, dlmmApiPoolInfo?.pool_id, dlmmPosLiquidityData])

  useDeepCompareEffect(() => {
    if (toLargeRange || (liquidityInfo?.bins?.length && liquidityInfo?.bins?.length > MaxBinRangeDisplayNum)) {
      setCurrentLiquidityBins({
        ...currentLiquidityBins,
        toLarge: true
      } as any)
      return
    }

    if (liquidityInfo && liquidityInfo?.bins?.length > 0 && dlmmApiPoolInfo?.tokenA && dlmmApiPoolInfo?.tokenB) {
      const res = formatBinList(
        liquidityInfo.bins,

        dlmmApiPoolInfo?.tokenA,
        dlmmApiPoolInfo?.tokenB,
        direct,
        dlmmContractPoolInfo?.activeId,
        dlmmContractPoolInfo?.bin_step
      )
      setCurrentLiquidityBins(res)
    } else {
      setCurrentLiquidityBins(undefined)
    }
  }, [liquidityInfo, dlmmApiPoolInfo?.poolId, direct, dlmmContractPoolInfo?.activeId, toLargeRange])

  const fetchPoolAllBinObj = (dlmmContractPoolInfo: DlmmPool, dlmmApiPoolInfo: DLMMPoolApiInfo) => {
    if (dlmmContractPoolInfo?.bin_manager?.bin_manager_handle && dlmmContractPoolInfo?.id && dlmmContractPoolInfo?.id === dlmmApiPoolInfo?.poolId) {
      setMaxBinLoading(true)
      getBinsInfoByPool(
        {
          pool_id: dlmmContractPoolInfo!.id,
          coin_type_a: dlmmContractPoolInfo!.coin_type_a,
          coin_type_b: dlmmContractPoolInfo!.coin_type_b
        },
        dlmmApiPoolInfo!.tokenA!.decimals,
        dlmmApiPoolInfo!.tokenB!.decimals
      )
        .then(res => {
          poolAllBinObj.current = res.allBinObj
          console.log('🚀 ~ getPoolAllBinObj poolAllBinObj', poolAllBinObj.current)
        })
        .finally(() => {
          setMaxBinLoading(false)
        })
        .catch(error => {
          console.log('🚀 ~ getPoolAllBinObj ~ error:', error)
        })
    }
  }

  const getPoolAllBinObj = useCallback(() => {
    if (
      dlmmApiPoolInfo &&
      dlmmContractPoolInfo?.bin_manager?.bin_manager_handle &&
      dlmmContractPoolInfo?.id &&
      dlmmContractPoolInfo?.id === dlmmApiPoolInfo?.poolId
    ) {
      fetchPoolAllBinObj(dlmmContractPoolInfo, dlmmApiPoolInfo)
    }
  }, [dlmmContractPoolInfo?.id, dlmmApiPoolInfo?.poolId])

  useEffect(() => {
    if (dlmmContractPoolInfo?.bin_manager?.bin_manager_handle && dlmmContractPoolInfo?.id && dlmmContractPoolInfo?.id === dlmmApiPoolInfo?.poolId) {
      getPoolAllBinObj()
    }
  }, [dlmmContractPoolInfo?.activeId, dlmmApiPoolInfo?.poolId])

  useEffect(() => {
    // if (maxPriceData?.binId !== undefined && minPriceData?.binId !== undefined && !isEmptyObj(poolAllBinObj.current)) {
    if (maxPriceData?.binId !== undefined && minPriceData?.binId !== undefined) {
      if (maxPriceData?.triggerFrom === 'init' || minPriceData?.triggerFrom === 'init') {
        toSetMaxBinRangeData(minPriceData?.binId, maxPriceData?.binId)
      }

      if (maxPriceData?.triggerFrom === 'input' || minPriceData?.triggerFrom === 'input') {
        const minIndex = maxBinRangeData?.list?.findIndex(item => item.bin_id === minPriceData?.binId)
        const maxIndex = maxBinRangeData?.list?.findIndex(item => item.bin_id === maxPriceData?.binId)
        // if (!maxBinRangeData?.list?.length || (minIndex !== undefined && minIndex < 0) || (maxIndex !== undefined && maxIndex < 0)) {
        //   toSetMaxBinRangeData(minPriceData?.binId, maxPriceData?.binId)
        // }
        if (minPriceData?.binId == maxPriceData?.binId) {
          toSetMaxBinRangeData(minPriceData?.binId - 1, maxPriceData?.binId + 1)
        } else if (maxPriceData?.binId - minPriceData?.binId == 1) {
          toSetMaxBinRangeData(minPriceData?.binId - 1, maxPriceData?.binId)
        } else {
          toSetMaxBinRangeData(minPriceData?.binId, maxPriceData?.binId)
        }
      }
    }
  }, [maxPriceData?.binId, minPriceData?.binId, poolAllBinObj.current])

  useEffect(() => {
    if (
      chartRefreshTrigger > 0 &&
      dlmmApiPoolInfo &&
      dlmmContractPoolInfo?.bin_manager?.bin_manager_handle &&
      dlmmContractPoolInfo?.id &&
      dlmmContractPoolInfo?.id === dlmmApiPoolInfo?.poolId
    ) {
      fetchPoolAllBinObj(dlmmContractPoolInfo, dlmmApiPoolInfo)
    }
  }, [chartRefreshTrigger])

  const toSetMaxBinRangeData = useCallback(
    (minBin: number, maxBin: number) => {
      if (
        dlmmApiPoolInfo?.tokenA &&
        dlmmApiPoolInfo?.tokenB &&
        dlmmContractPoolInfo?.active_id !== undefined &&
        dlmmContractPoolInfo?.id &&
        dlmmContractPoolInfo?.id === dlmmApiPoolInfo?.id
        // !isEmptyObj(poolAllBinObj.current)
      ) {
        const list = getMaxBinRangeData({
          activeBin: dlmmContractPoolInfo?.active_id,
          allBins: poolAllBinObj.current,
          binStep: dlmmContractPoolInfo?.bin_step,
          baseToken: dlmmApiPoolInfo?.tokenA,
          quoteToken: dlmmApiPoolInfo?.tokenB,
          direct,
          maxBin,
          minBin
        })

        setMaxBinRangeData(list)
      }
    },
    [dlmmContractPoolInfo?.id, dlmmApiPoolInfo?.id, dlmmContractPoolInfo?.active_id, poolAllBinObj.current, direct]
  )

  useEffect(() => {
    if (maxPriceData?.binId !== undefined && minPriceData?.binId !== undefined) {
      const minIndex = maxBinRangeData?.list?.findIndex(item => item.bin_id === minPriceData?.binId)
      const maxIndex = maxBinRangeData?.list?.findIndex(item => item.bin_id === maxPriceData?.binId)

      if ((minIndex !== undefined && minIndex < 0) || (maxIndex !== undefined && maxIndex < 0)) {
        toSetMaxBinRangeData(minPriceData?.binId, maxPriceData?.binId)
      } else {
        const min = Math.min(maxBinRangeData?.list?.[0]?.bin_id, maxBinRangeData?.list?.[maxBinRangeData?.list?.length - 1]?.bin_id)
        const max = Math.max(maxBinRangeData?.list?.[0]?.bin_id, maxBinRangeData?.list?.[maxBinRangeData?.list?.length - 1]?.bin_id)
        toSetMaxBinRangeData(min, max)
      }
    }
  }, [toSetMaxBinRangeData])

  const handleRangeChange = (minBin: number, maxBin: number, isfromCurrentLiquidityChart?: boolean) => {
    if (isfromCurrentLiquidityChart) {
      setRangeChangeType('currentLiquidityChart')
    } else {
      setRangeChangeType('rangeChart')
    }

    const binStep = dlmmContractPoolInfo?.bin_step
    const baseDecimal = dlmmApiPoolInfo?.tokenA?.decimals
    const quoteDecimal = dlmmApiPoolInfo?.tokenB?.decimals
    if (
      binStep !== undefined &&
      baseDecimal !== undefined &&
      quoteDecimal !== undefined &&
      minBin !== undefined &&
      maxBin !== undefined &&
      dlmmApiPoolInfo?.tokenA &&
      dlmmApiPoolInfo?.tokenB
    ) {
      const minPrice = BinUtils.getPriceFromBinId(minBin, binStep, baseDecimal, quoteDecimal)
      const [displayMinPrice, reverseMinPrice, displayReverseMinPrice] = getRelatedDisplayChartPrice(minPrice)
      const maxPrice = BinUtils.getPriceFromBinId(maxBin, binStep, baseDecimal, quoteDecimal)
      const [displayMaxPrice, reverseMaxPrice, displayReverseMaxPrice] = getRelatedDisplayChartPrice(maxPrice)

      const _minPriceData = {
        binId: minBin,
        price: minPrice,
        displayPrice: displayMinPrice,
        reversePrice: reverseMinPrice,
        displayReversePrice: displayReverseMinPrice,
        tokenA: dlmmApiPoolInfo!.tokenA,
        tokenB: dlmmApiPoolInfo!.tokenB,
        type: 'lower' as const,
        triggerFrom: isfromCurrentLiquidityChart ? 'currentLiquidityChart' : 'rangeChart',
        actionSource: 'user'
      }

      const _maxPriceData = {
        binId: maxBin,
        price: maxPrice,
        displayPrice: displayMaxPrice,
        reversePrice: reverseMaxPrice,
        displayReversePrice: displayReverseMaxPrice,
        tokenA: dlmmApiPoolInfo!.tokenA,
        tokenB: dlmmApiPoolInfo!.tokenB,
        type: 'upper' as const,
        triggerFrom: isfromCurrentLiquidityChart ? 'currentLiquidityChart' : 'rangeChart',
        actionSource: 'user'
      }

      setMinPriceData(_minPriceData)

      setMaxPriceData(_maxPriceData)

      if (isfromCurrentLiquidityChart) {
        if (maxBinRangeData?.list && maxBinRangeData?.list?.length > 0) {
          const maxBinRangeDataLen = maxBinRangeData?.list?.length || 0
          const beforeListMinBin = direct ? maxBinRangeData?.list[0]?.bin_id : maxBinRangeData?.list[maxBinRangeDataLen - 1]?.bin_id
          const beforeListMaxBin = direct ? maxBinRangeData?.list[maxBinRangeDataLen - 1]?.bin_id : maxBinRangeData?.list[0]?.bin_id
          if (minBin < beforeListMinBin || maxBin > beforeListMaxBin) {
            toSetMaxBinRangeData(minBin, maxBin)
          }
        } else {
          toSetMaxBinRangeData(minBin, maxBin)
        }
      }
    }
  }

  const calcChartBinsData = useCallback(
    async (lower: number, upper: number) => {
      try {
        let binInfos: any = null
        if (zapAddLiquidityInfo && preCalcParams.zapIn) {
          const { options, modeOptions } = preCalcParams.zapIn
          binInfos = await getBinInfosByAutoFill({
            lower_bin_id: lower,
            upper_bin_id: upper,
            input_amount: modeOptions.fix_amount_a ? zapAddLiquidityInfo.amount_a : zapAddLiquidityInfo.amount_b,
            fix_amount_a: modeOptions.fix_amount_a,
            amount_in_active_bin: options?.active_bin_of_pool,
            bin_step: options.bin_step,
            active_id: options.active_id,
            strategy_type: options.strategy_type,
            pool_id: options.pool_id
          })
        } else {
          if (preCalcParams) {
            if (preCalcParams.autoFill && isAutoFill) {
              binInfos = await getBinInfosByAutoFill({
                ...preCalcParams.autoFill,
                lower_bin_id: lower,
                upper_bin_id: upper
              })
            }

            if (preCalcParams.notAutoFill && !isAutoFill) {
              binInfos = await getBinInfosByBothAmount({
                ...preCalcParams.notAutoFill,
                lower_bin_id: lower,
                upper_bin_id: upper
              })
            }
          }
        }

        if (binInfos?.bins?.length) {
          const res = formatBinList(
            binInfos.bins,
            dlmmApiPoolInfo?.tokenA,
            dlmmApiPoolInfo?.tokenB,
            direct,
            dlmmContractPoolInfo?.activeId,
            dlmmContractPoolInfo?.bin_step
          )
          return res
        }
      } catch (error) {
        console.log('🚀 ~ useDlmmAddLiquidityChart ~ error:', error)
        return null
      }
    },
    [preCalcParams, zapAddLiquidityInfo?.amount_a, zapAddLiquidityInfo?.amount_b]
  )

  return {
    currentLiquidityBins,
    activeId: dlmmContractPoolInfo?.activeId,
    maxBinRangeData,
    handleRangeChange,
    minPriceData,
    maxPriceData,
    otherPosBinObj,
    maxBinLoading,
    tokenAPrice: tokenAPriceInfo?.price,
    tokenBPrice: tokenBPriceInfo?.price,
    tokenAPythPrice,
    tokenBPythPrice,
    calcChartBinsData
  }
}

export default useDlmmAddLiquidityChart
