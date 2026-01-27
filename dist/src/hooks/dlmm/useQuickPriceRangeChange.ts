import { adjustReferBinId, useMinMaxBinIdByAmount, useMinMaxPriceData } from '@/hooks/dlmm/useDlmmHelper'
import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore, { RangePriceType } from '@/store/dlmm/addDlmmLiquidity'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d, removeComma } from '@cetus/utils'
import { BinUtils } from '@cetusprotocol/dlmm-sdk'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

type NumBinsTypes = '19' | '49' | '79'

function useQuickPriceRangeChange({ direct = false }: { direct: boolean }) {
  const { dlmmContractPoolInfo, dlmmApiPoolInfo, currentPrice, isAutoFill } = useDlmmLiquidityStore()
  const { setMaxPriceData, setMinPriceData, minPriceData, maxPriceData, fromToken, fromAmount, toAmount, binIdRange, numBins } =
    useAddDlmmLiquidityStore()
  const [showMaxWarning, setShowMaxWarning] = useState(false)
  const [showMinWarning, setShowMinWarning] = useState(false)
  const [editNumBins, setEditNumBins] = useState<string>(numBins.toString())
  const { formatMinMaxBinId } = useMinMaxBinIdByAmount(isAutoFill, fromToken, dlmmApiPoolInfo?.tokenA, fromAmount, toAmount)
  const { formatMinMaxPriceData, buildPriceData } = useMinMaxPriceData(
    dlmmApiPoolInfo?.tokenA,
    dlmmApiPoolInfo?.tokenB,
    dlmmContractPoolInfo?.binStep
  )

  const handlePriceChange = useCallback(
    (numBins: number) => {
      if (dlmmContractPoolInfo?.activeId === undefined) return
      const binRes = formatMinMaxBinId(Number(numBins), dlmmContractPoolInfo?.activeId)

      if (binRes) {
        const { minBinId, maxBinId } = binRes

        const priceRes = formatMinMaxPriceData(minBinId, maxBinId)
        if (priceRes) {
          const { minPriceData, maxPriceData } = priceRes
          setMinPriceData(minPriceData as RangePriceType)
          setMaxPriceData(maxPriceData as RangePriceType)
        }
      }
    },
    [
      dlmmContractPoolInfo?.binStep,
      dlmmContractPoolInfo?.activeId,
      fromToken?.address,
      dlmmApiPoolInfo?.tokenA?.decimals,
      fromAmount,
      toAmount,
      isAutoFill
    ]
  )

  const [currentNumBins, setCurrentNumBins] = useState<NumBinsTypes | undefined>('49')
  const { isApp } = useWindowWidth()
  const handleChangeTab = (val: any) => {
    setCurrentNumBins(val.label)
    handlePriceChange(Number(val.label))
  }

  const [activeInput, setActiveInput] = useState<'min' | 'max' | undefined>(undefined)
  const [minValue, setMinValue] = useState<string>('')
  const [preMinValue, setPreMinValue] = useState<string>('')
  const [maxValue, setMaxValue] = useState<string>('')
  const [preMaxValue, setPreMaxValue] = useState<string>('')

  useEffect(() => {
    if (dlmmContractPoolInfo?.activeId !== undefined && minPriceData?.binId !== undefined && maxPriceData?.binId !== undefined) {
      const minGap = dlmmContractPoolInfo?.activeId - minPriceData?.binId
      const maxGap = maxPriceData?.binId - dlmmContractPoolInfo?.activeId
      const numBinsTabs: NumBinsTypes[] = ['19', '49', '79']
      const totalGap = minGap + maxGap + 1 + ''
      if ((minGap === maxGap || minGap === 0 || maxGap === 0) && numBinsTabs.includes(totalGap as any)) {
        setCurrentNumBins(totalGap as NumBinsTypes)
      } else {
        setCurrentNumBins(undefined)
      }
    }
  }, [minPriceData?.binId, maxPriceData?.binId, dlmmContractPoolInfo?.activeId])

  useEffect(() => {
    if (minPriceData?.price !== undefined && maxPriceData?.price !== undefined && currentPrice) {
      if (direct) {
        const minPercent = d(removeComma(minPriceData?.price)).sub(currentPrice).div(currentPrice).mul(100).toNumber().toFixed(2)
        const maxPercent = d(removeComma(maxPriceData?.price)).sub(currentPrice).div(currentPrice).mul(100).toNumber().toFixed(2)
        setMinValue(minPercent)
        setPreMinValue(minPercent)
        setMaxValue(maxPercent)
        setPreMaxValue(maxPercent)
      } else {
        const maxPercent = d(d(1).div(removeComma(minPriceData?.price)))
          .sub(d(1).div(currentPrice))
          .div(d(1).div(currentPrice))
          .mul(100)
          .toNumber()
          .toFixed(2)
        const minPercent = d(d(1).div(removeComma(maxPriceData?.price)))
          .sub(d(1).div(currentPrice))
          .div(d(1).div(currentPrice))
          .mul(100)
          .toNumber()
          .toFixed(2)

        setMinValue(minPercent)
        setPreMinValue(minPercent)
        setMaxValue(maxPercent)
        setPreMaxValue(maxPercent)
      }
    }
  }, [currentPrice, minPriceData?.price, maxPriceData?.price, direct])

  const handleRangeChange = (value: string, type: 'min' | 'max') => {
    console.log(value, preMaxValue, preMinValue, 'handleRangeChange, handleRangeChange')
    if (
      dlmmApiPoolInfo?.isReverse !== undefined &&
      dlmmContractPoolInfo?.binStep !== undefined &&
      dlmmApiPoolInfo?.tokenA &&
      dlmmApiPoolInfo?.tokenB &&
      preMinValue !== undefined &&
      preMaxValue !== undefined
    ) {
      const tokenA = dlmmApiPoolInfo?.tokenA
      const tokenB = dlmmApiPoolInfo?.tokenB
      if (direct) {
        if (type === 'min') {
          let min_price
          if (value?.startsWith('-')) {
            min_price = d(currentPrice)
              .sub(d(currentPrice).mul(value.replace('-', '')).div(100))
              .toString()
          } else {
            min_price = d(currentPrice).add(d(currentPrice).mul(value).div(100)).toString()
          }
          let minBinId = BinUtils?.getBinIdFromPrice(min_price, dlmmContractPoolInfo?.binStep, false, tokenA?.decimals, tokenB?.decimals)
          minBinId = Math.min(Math.max(minBinId, binIdRange?.minBinId), binIdRange?.maxBinId)

          const adjustMaxBinId = adjustReferBinId(binIdRange?.minBinId, binIdRange?.maxBinId, minBinId, true, maxPriceData?.binId)
          const minPriceData = buildPriceData(minBinId, true)
          if (minPriceData) {
            setMinPriceData(minPriceData as RangePriceType)
          }

          if (adjustMaxBinId && adjustMaxBinId !== maxPriceData?.binId) {
            const maxPriceData = buildPriceData(adjustMaxBinId, false)
            if (maxPriceData) {
              setMaxPriceData(maxPriceData as RangePriceType)
            }
          }
        } else {
          let upper_price
          if (value?.startsWith('-')) {
            upper_price = d(currentPrice)
              .sub(d(currentPrice).mul(value.replace('-', '')).div(100))
              .toString()
          } else {
            upper_price = d(currentPrice).add(d(currentPrice).mul(value).div(100)).toString()
          }
          let maxBinId = BinUtils?.getBinIdFromPrice(upper_price, dlmmContractPoolInfo?.binStep, true, tokenA?.decimals, tokenB?.decimals)
          maxBinId = Math.min(Math.max(maxBinId, binIdRange?.minBinId), binIdRange?.maxBinId)

          const maxPriceData = buildPriceData(maxBinId, false)
          if (maxPriceData) {
            setMaxPriceData(maxPriceData as RangePriceType)
          }

          const adjustMinBinId = adjustReferBinId(binIdRange?.minBinId, binIdRange?.maxBinId, maxBinId, false, minPriceData?.binId)
          if (adjustMinBinId && adjustMinBinId !== minPriceData?.binId) {
            const minPriceData = buildPriceData(adjustMinBinId, true)
            if (minPriceData) {
              setMinPriceData(minPriceData as RangePriceType)
            }
          }
        }
      } else {
        if (type === 'min') {
          let maxBinId = 0
          if (value === preMaxValue && minPriceData) {
            maxBinId = minPriceData.binId
          }

          if (!maxBinId) {
            let upper_price
            if (value?.startsWith('-')) {
              upper_price = d(1)
                .div(d(d(1).div(currentPrice)).sub(d(1).div(currentPrice).mul(value.replace('-', '')).div(100)))
                .toString()
            } else {
              upper_price = d(1)
                .div(d(d(1).div(currentPrice)).add(d(1).div(currentPrice).mul(value).div(100)))
                .toString()
            }
            maxBinId = BinUtils?.getBinIdFromPrice(upper_price, dlmmContractPoolInfo?.binStep, false, tokenA?.decimals, tokenB?.decimals)
          }
          maxBinId = Math.min(Math.max(maxBinId, binIdRange?.minBinId), binIdRange?.maxBinId)

          const _maxPriceData = buildPriceData(maxBinId, false)
          if (_maxPriceData) {
            setMaxPriceData(_maxPriceData as RangePriceType)
          }

          const adjustMinBinId = adjustReferBinId(binIdRange?.minBinId, binIdRange?.maxBinId, maxBinId, false, minPriceData?.binId)
          if (adjustMinBinId && adjustMinBinId !== minPriceData?.binId) {
            const minPriceData = buildPriceData(adjustMinBinId, true)
            if (minPriceData) {
              setMinPriceData(minPriceData as RangePriceType)
            }
          }
        } else {
          let minBinId = 0
          if (value === preMinValue && maxPriceData) {
            minBinId = maxPriceData.binId
          }

          if (!minBinId) {
            let min_price
            if (value?.startsWith('-')) {
              min_price = d(1)
                .div(d(d(1).div(currentPrice)).sub(d(1).div(currentPrice).mul(value.replace('-', '')).div(100)))
                .toString()
            } else {
              min_price = d(1)
                .div(d(d(1).div(currentPrice)).add(d(1).div(currentPrice).mul(value).div(100)))
                .toString()
            }

            minBinId = BinUtils?.getBinIdFromPrice(min_price, dlmmContractPoolInfo?.binStep, true, tokenA?.decimals, tokenB?.decimals)
          }
          minBinId = Math.min(Math.max(minBinId, binIdRange?.minBinId), binIdRange?.maxBinId)

          const adjustMaxBinId = adjustReferBinId(binIdRange?.minBinId, binIdRange?.maxBinId, minBinId, true, maxPriceData?.binId)
          const minPriceData = buildPriceData(minBinId, true)
          if (minPriceData) {
            setMinPriceData(minPriceData as RangePriceType)
          }

          if (adjustMaxBinId && adjustMaxBinId !== maxPriceData?.binId) {
            const maxPriceData = buildPriceData(adjustMaxBinId, false)
            if (maxPriceData) {
              setMaxPriceData(maxPriceData as RangePriceType)
            }
          }
        }
      }
    }
  }

  const isMinInput = useMemo(() => activeInput === 'min', [activeInput])
  const isMaxInput = useMemo(() => activeInput === 'max', [activeInput])

  const minInputRef = useRef(null)
  const minCursorPos = useRef(0)
  const maxInputRef = useRef(null)
  const maxCursorPos = useRef(0)

  const handleMinInput = e => {
    minCursorPos.current = e.target.selectionStart
  }
  const handleMaxInput = e => {
    maxCursorPos.current = e.target.selectionStart
  }

  // 恢复光标位置
  useEffect(() => {
    if (minInputRef.current) {
      const adjustedPos = Math.min(minCursorPos.current, minValue.length)
      minInputRef.current?.setSelectionRange(adjustedPos, adjustedPos)
    }
  }, [minValue])
  // 恢复光标位置
  useEffect(() => {
    if (maxInputRef.current) {
      const adjustedPos = Math.min(maxCursorPos.current, maxValue.length)
      maxInputRef.current?.setSelectionRange(adjustedPos, adjustedPos)
    }
  }, [maxValue])

  const onMinInputBlur = (value: string) => {
    const number = value.replace(/[% ]/g, '')
    setActiveInput(undefined)
    console.log(preMinValue, 'test', number, number === '-', 'onMinInputChange')
    if (number === '-') {
      setMinValue(preMinValue)
      return
    }
    if (number && number !== preMinValue) {
      setPreMinValue(number)
      handleRangeChange(number, 'min')
    } else {
      setMinValue(preMinValue)
    }
  }

  const onMinInputChange = (stringValue: string, numberValue: number) => {
    console.log(stringValue, numberValue, stringValue.startsWith('-') && d(stringValue.replace('-', '')).gt(99.99), 'onMinInputChange')
    if (!stringValue) {
      setMinValue('')
    } else {
      if (stringValue.split('').every(s => s === '-') && stringValue.length > 0) {
        console.log(stringValue, 'onMinInputChange')
        setMinValue('-')
      } else if (stringValue === '-9007199254740991') {
        setMinValue(preMinValue)
      } else if (stringValue.startsWith('-') && d(stringValue.replace('-', '')).gt(99.99)) {
        setMinValue('-99.99')
        setShowMinWarning(true)
      } else {
        setShowMinWarning(false)
        setMinValue(stringValue)
      }
    }
  }

  useEffect(() => {
    if (showMaxWarning) {
      setTimeout(() => {
        setShowMaxWarning(false)
      }, 3000)
    }
  }, [showMaxWarning])

  useEffect(() => {
    if (showMinWarning) {
      setTimeout(() => {
        setShowMinWarning(false)
      }, 3000)
    }
  }, [showMinWarning])

  const onMaxInputBlur = (value: string) => {
    setActiveInput(undefined)
    const number = value.replace(/[% ]/g, '')
    if (number === '-') {
      setMaxValue(preMinValue)
      return
    }
    console.log(number, preMaxValue, 'onMaxInputBlur')
    if (number && number !== preMaxValue) {
      setPreMaxValue(number)
      handleRangeChange(number, 'max')
    } else {
      setMaxValue(preMaxValue)
    }
  }

  const onMaxInputChange = (stringValue: string, numberValue: number) => {
    if (!stringValue) {
      setMaxValue('')
    } else {
      if (stringValue.split('').every(s => s === '-') && stringValue.length > 0) {
        setMaxValue('-')
      } else if (stringValue === '-9007199254740991') {
        setMaxValue(preMaxValue)
      } else if (stringValue.startsWith('-') && d(stringValue.replace('-', '')).gt(99.99)) {
        setMaxValue('-99.99')
        setShowMaxWarning(true)
      } else {
        setShowMaxWarning(false)
        setMaxValue(stringValue)
      }
    }
  }

  return {
    isMinInput,
    minValue,
    minInputRef,
    onMinInputBlur,
    onMinInputChange,
    handleMinInput,
    isMaxInput,
    maxValue,
    maxInputRef,
    onMaxInputChange,
    onMaxInputBlur,
    handleMaxInput,
    currentNumBins,
    handleChangeTab,
    setActiveInput,
    showMaxWarning,
    showMinWarning,
    editNumBins,
    setEditNumBins
  }
}

export default useQuickPriceRangeChange
