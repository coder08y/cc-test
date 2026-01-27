import { PoolApiInfo } from '@/types'
import { d, formatNumberWithDown } from '@cetus/utils'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import CoinPairInfo from '../common/CoinPairInfo'
import RangeValue from '../position/clmm/RangeValue'

type ValidRangeBlockProps = {
  apiInfo: PoolApiInfo
}

export function ValidRangeBlock({ apiInfo }: ValidRangeBlockProps) {
  const minPriceReverse = useMemo(() => {
    if (apiInfo?.displayFarmsEffectMaxPrice !== '∞') {
      return d(1).div(apiInfo?.displayFarmsEffectMaxPrice).toString()
    }
  }, [apiInfo?.displayFarmsEffectMaxPrice])

  const maxPriceReverse = useMemo(() => {
    if (d(apiInfo?.displayFarmsEffectMinPrice).gt(0)) {
      return d(1).div(apiInfo?.displayFarmsEffectMinPrice).toString()
    }
  }, [apiInfo?.displayFarmsEffectMinPrice])
  return (
    <VStack align="flex-start" gap="8px" w={{ base: '100%', lg: 'unset' }}>
      <Box m="-12px 0">
        <CoinPairInfo
          poolInfo={{ ...apiInfo, poolAddress: apiInfo?.farmsPoolAddress, poolType: 'clmm' }}
          symbolFontSize="15px"
          versionBlockPosition="right"
          poolType="clmm"
          showPoolTypeTag
          type="column"
        />
      </Box>
      <HStack maxW="100%" display="inline-block" w={{ base: '100%', lg: 'unset' }} borderRadius="12px" bg="position_status_bg" p="7px 12px">
        <VStack align="flex-start" gap="0px" w={{ base: '100%', lg: 'unset' }}>
          <Text fontSize="12px" color="primary_gray">
            Valid Range
          </Text>
          <RangeValue
            symbolEllipsesDecimals={10}
            displayTokenA={apiInfo?.displayTokenA}
            displayTokenB={apiInfo?.displayTokenB}
            fontWeight="500"
            priceInfo={{
              minPrice: formatNumberWithDown(apiInfo?.displayFarmsEffectMinPrice).toString(),
              maxPrice: formatNumberWithDown(apiInfo?.displayFarmsEffectMaxPrice).toString(),
              minPriceResever: formatNumberWithDown(minPriceReverse).toString(),
              maxPriceResever: formatNumberWithDown(maxPriceReverse).toString()
            }}
          />
        </VStack>
      </HStack>
    </VStack>
  )
}
