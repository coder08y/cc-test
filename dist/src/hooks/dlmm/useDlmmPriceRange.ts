import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore, { RangePriceType } from '@/store/dlmm/addDlmmLiquidity'
import { d, formatPrice, removeComma } from '@cetus/utils'
import { BinUtils } from '@cetusprotocol/dlmm-sdk'
import { useRef } from 'react'
import { PriceDataType } from '../create-pool/useCreateDLMMPool'
import useCreatePriceBin from './useCreatePriceBin'
import { adjustReferBinId, useMinMaxPriceData } from './useDlmmHelper'

function useDlmmPriceRange(direct: boolean) {
  const { handleActionBinPrice } = useCreatePriceBin()
  const { currentBinStep, dlmmApiPoolInfo, dlmmContractPoolInfo, currentPrice } = useDlmmLiquidityStore()
  const { minPriceData, maxPriceData, setMinPriceData, setMaxPriceData, fromToken, toToken, binIdRange } = useAddDlmmLiquidityStore()
  const { formatMinMaxPriceData, buildPriceData } = useMinMaxPriceData(dlmmApiPoolInfo?.tokenA, dlmmApiPoolInfo?.tokenB, currentBinStep)

  const getReverseType = (type: 'Add' | 'Sub') => {
    if (type === 'Add') {
      return 'Sub'
    }
    return 'Add'
  }
  const handlePriceAction = (type: 'Add' | 'Sub', price: PriceDataType) => {
    const { bin_id, price: _price } = handleActionBinPrice(
      price,
      currentBinStep!,
      dlmmApiPoolInfo?.tokenA?.decimals,
      dlmmApiPoolInfo?.tokenB?.decimals,
      type
    )
    const _binId = Math.min(Math.max(bin_id, binIdRange?.minBinId), binIdRange?.maxBinId)

    if (price?.type === 'lower') {
      const adjustMaxBinId = adjustReferBinId(binIdRange?.minBinId, binIdRange?.maxBinId, _binId, true, maxPriceData?.binId)
      const minPriceData = buildPriceData(_binId, true)
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
      const maxPriceData = buildPriceData(_binId, false)
      if (maxPriceData) {
        setMaxPriceData(maxPriceData as RangePriceType)
      }

      const adjustMinBinId = adjustReferBinId(binIdRange?.minBinId, binIdRange?.maxBinId, _binId, false, minPriceData?.binId)
      if (adjustMinBinId && adjustMinBinId !== minPriceData?.binId) {
        const minPriceData = buildPriceData(adjustMinBinId, true)
        if (minPriceData) {
          setMinPriceData(minPriceData as RangePriceType)
        }
      }
    }
  }
  const handleAddPrice = (price: PriceDataType) => {
    handlePriceAction('Add', price)
  }

  const handleSubPrice = (price: PriceDataType) => {
    handlePriceAction('Sub', price)
  }

  const minPriceRef = useRef<string>('')
  const maxPriceRef = useRef<string>('')
  // 失去焦点操作
  const onPriceChange = (data: RangePriceType, value: string) => {
    const tokenA = data.tokenA
    const tokenB = data.tokenB
    if (!tokenA || !tokenB || !dlmmContractPoolInfo?.binStep) return

    let _binId
    if (d(value).lte('0') || value === 'Infinity') {
      const basePrice = direct ? currentPrice : d(1).div(currentPrice)?.toString()
      if (d(value).lte('0')) {
        const min_price = direct ? d(basePrice).mul(0.0001).toString() : d(basePrice).mul(1.9999).toString()
        const lower_price_format = formatPrice(direct ? min_price : d(1).div(min_price).toString())
        _binId = BinUtils?.getBinIdFromPrice(removeComma(lower_price_format), dlmmContractPoolInfo?.binStep, true, tokenA?.decimals, tokenB?.decimals)
        console.log(lower_price_format, _binId, basePrice, min_price, currentPrice, 'lower_price_format')
      } else {
        const min_price = direct ? d(basePrice).mul(1.9999).toString() : d(basePrice).mul(0.0001).toString()
        const lower_price_format = formatPrice(direct ? min_price : d(1).div(min_price).toString())
        _binId = BinUtils?.getBinIdFromPrice(removeComma(lower_price_format), dlmmContractPoolInfo?.binStep, true, tokenA?.decimals, tokenB?.decimals)
        console.log(lower_price_format, _binId, basePrice, min_price, currentPrice, 'lower_price_format')
      }
    } else {
      _binId = BinUtils.getBinIdFromPrice(value, currentBinStep!, data?.type === 'lower', tokenA?.decimals, tokenB?.decimals)
    }
    _binId = Math.min(Math.max(_binId, binIdRange?.minBinId), binIdRange?.maxBinId)

    const res: RangePriceType = buildPriceData(_binId, data?.type === 'lower') as RangePriceType
    if (data?.type === 'lower') {
      const adjustMaxBinId = adjustReferBinId(binIdRange?.minBinId, binIdRange?.maxBinId, _binId, true, maxPriceData?.binId)
      if (res) {
        setMinPriceData(res as RangePriceType)
      }

      if (adjustMaxBinId && adjustMaxBinId !== maxPriceData?.binId) {
        const maxPriceData = buildPriceData(adjustMaxBinId, false)
        if (maxPriceData) {
          setMaxPriceData(maxPriceData as RangePriceType)
        }
      }
    } else {
      if (res) {
        setMaxPriceData(res as RangePriceType)
      }

      const adjustMinBinId = adjustReferBinId(binIdRange?.minBinId, binIdRange?.maxBinId, _binId, false, minPriceData?.binId)
      if (adjustMinBinId && adjustMinBinId !== minPriceData?.binId) {
        const minPriceData = buildPriceData(adjustMinBinId, true)
        if (minPriceData) {
          setMinPriceData(minPriceData as RangePriceType)
        }
      }
    }
    return res
  }

  return { handleAddPrice, handleSubPrice, onPriceChange }
}

export default useDlmmPriceRange
