import { Box, HStack } from '@chakra-ui/react'
import ProQuickBuySelect from './ProQuickBuySelect'
import ProRangeSelect from './ProRangeSelect'
import ProSortTab from './ProSortTab'
import ProTimeSelect from './ProTimeSelect'

function ProFilterBlock() {
  return (
    <HStack w="100%" justify="flex-start">
      <ProSortTab />
      <ProRangeSelect />
      <Box flex={1} />
      <ProTimeSelect />
      <ProQuickBuySelect />
    </HStack>
  )
}

export default ProFilterBlock
