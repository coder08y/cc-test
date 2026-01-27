import usePriceRange from '@/hooks/clmm/usePriceRange'
import usePriceRangeStore from '@/store/clmm/priceRange'
import { TickData } from '@/types'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Stack } from '@chakra-ui/react'
import PriceInput from './PriceInput'

export default function ControlPriceRange({
  perText,
  direct,
  minPriceData,
  maxPriceData,
  isFullRange = false
}: {
  perText: string
  direct: boolean
  minPriceData: Partial<TickData>
  maxPriceData: Partial<TickData>
  isFullRange?: boolean
}) {
  const { isApp } = useWindowWidth()
  const { tickDataLoading } = usePriceRangeStore()
  const { handleAddPrice, handleSubPrice, setTickDataBasedOnPrice } = usePriceRange()

  return (
    <Stack flexDir={{ base: 'row', lg: 'row' }} w="100%" gap={{ base: '8px', lg: '16px' }} sx={{ ...(isApp && {}) }}>
      <PriceInput
        title="Min Price"
        perText={perText}
        data={minPriceData}
        direct={direct}
        loading={tickDataLoading}
        handleAddPrice={handleAddPrice}
        handleSubPrice={handleSubPrice}
        setTickDataBasedOnPrice={setTickDataBasedOnPrice}
        isFullRange={isFullRange}
        inline={isApp}
      />
      <PriceInput
        title="Max Price"
        perText={perText}
        data={maxPriceData}
        direct={direct}
        loading={tickDataLoading}
        handleAddPrice={handleAddPrice}
        handleSubPrice={handleSubPrice}
        setTickDataBasedOnPrice={setTickDataBasedOnPrice}
        isFullRange={isFullRange}
        inline={isApp}
      />
    </Stack>
  )
}
