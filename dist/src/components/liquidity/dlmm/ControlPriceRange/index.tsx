import { DLMM_MAX_BIN_NUMBER } from '@/constant/dlmm'
import { PriceDataType } from '@/hooks/create-pool/useCreateDLMMPool'
import useDlmmPriceRange from '@/hooks/dlmm/useDlmmPriceRange'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import { d } from '@cetus/utils'
import { Stack, StackProps } from '@chakra-ui/react'
import PriceInput from './PriceInput'

export default function ControlPriceRange({
  perText,
  direct,
  lowerPrice,
  upperPrice,
  wrapStyle = {},
  children,
  percentageInputs
}: {
  perText: string
  direct: boolean
  lowerPrice: PriceDataType | null
  upperPrice: PriceDataType | null
  wrapStyle?: StackProps
  children?: React.ReactNode
  percentageInputs?: {
    min?: {
      value: string
      inputRef: React.RefObject<any>
      isActive: boolean
      showWarning: boolean
      onBlur: (value: string) => void
      onChange: (stringValue: string, numberValue: number) => void
      onInput: (e: any) => void
      onFocus: () => void
    }
    max?: {
      value: string
      inputRef: React.RefObject<any>
      isActive: boolean
      showWarning: boolean
      onBlur: (value: string) => void
      onChange: (stringValue: string, numberValue: number) => void
      onInput: (e: any) => void
      onFocus: () => void
    }
  }
}) {
  const { handleAddPrice, handleSubPrice, onPriceChange } = useDlmmPriceRange(direct)
  const { numBins } = useAddDlmmLiquidityStore()
  return (
    <Stack className="controlPriceRange" flexDir={'row'} w="100%" gap={{ base: '8px', lg: '16px' }} {...wrapStyle}>
      <PriceInput
        title="Min Price"
        perText={perText}
        data={lowerPrice as any}
        onPriceChange={onPriceChange}
        direct={direct}
        loading={!lowerPrice}
        handleAddPrice={handleAddPrice}
        handleSubPrice={handleSubPrice}
        subDisabled={d(numBins).gte(DLMM_MAX_BIN_NUMBER)}
        addDisabled={false}
        percentageInput={percentageInputs?.min}
      />
      {children}
      <PriceInput
        title="Max Price"
        perText={perText}
        data={upperPrice as any}
        onPriceChange={onPriceChange}
        direct={direct}
        loading={!upperPrice}
        handleAddPrice={handleAddPrice}
        handleSubPrice={handleSubPrice}
        subDisabled={false}
        addDisabled={d(numBins).gte(DLMM_MAX_BIN_NUMBER)}
        percentageInput={percentageInputs?.max}
      />
    </Stack>
  )
}
