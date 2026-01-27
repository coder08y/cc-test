import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { formatCurrency } from '@cetus/utils'
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'

export default function TopShowData() {
  const isMarginPoolsLoading = useDeepBookMarginPoolStore(state => state.isMarginPoolsLoading)
  const marginPoolsTotalData: any = useDeepBookMarginPoolStore(state => state.marginPoolsTotalData)
  return (
    <HStack
      flexDirection={{ base: 'column', lg: 'row' }}
      w="100%"
      p={{ base: '20px 0px', lg: '40px 0px' }}
      justify="space-between"
      gap={{ base: '16px', lg: '8px' }}
    >
      <VStack w={{ base: '100%', lg: 'unset' }} align="flex-start">
        <Text color="text_caption" fontSize={{ base: '20px', lg: '24px' }} fontWeight="500">
          DeepBook Margin Pool
        </Text>
        <Text fontSize={{ base: '14px', lg: '16px' }} lineHeight={{ base: '16px', lg: '24px' }}>
          Earn yield by lending to DeepBook Margin Pool
        </Text>
      </VStack>
      <HStack w={{ base: '100%', lg: 'unset' }} gap={{ base: '0px', lg: '72px' }}>
        <VStack flex={{ base: '1', lg: 'unset' }} align={{ base: 'flex-start', lg: 'flex-end' }} gap={{ base: '8px', lg: '12px' }}>
          <Text color="text_caption" fontSize={{ base: '12px', lg: '14px' }}>
            Total Supply
          </Text>
          <Skeleton isLoaded={!!marginPoolsTotalData?.totalSupply} h="20px">
            <Text fontSize={{ base: '14px', lg: '20px' }} color="primary" fontWeight="500">
              {formatCurrency(marginPoolsTotalData?.totalSupply || 0, 2)}
            </Text>
          </Skeleton>
        </VStack>
        <VStack flex={{ base: '1', lg: 'unset' }} align={{ base: 'flex-start', lg: 'flex-end' }} gap={{ base: '8px', lg: '12px' }}>
          <Text color="text_caption" fontSize={{ base: '12px', lg: '14px' }}>
            Total Borrowed
          </Text>
          <Skeleton isLoaded={!!marginPoolsTotalData?.totalBorrow} h="20px">
            <Text fontSize={{ base: '14px', lg: '20px' }} color="primary" fontWeight="500">
              {formatCurrency(marginPoolsTotalData?.totalBorrow || 0, 2)}
            </Text>
          </Skeleton>
        </VStack>
      </HStack>
    </HStack>
  )
}
