import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HStack, Skeleton, SkeletonCircle, VStack } from '@chakra-ui/react'

function PositionListLoading() {
  const { isApp } = useWindowWidth()
  return (
    <Block w="100%" p={isApp ? '16px 12px' : '24px 16px 16px'} borderRadius="16px">
      <VStack w="100%" gap={{ base: '12px', lg: '24px' }}>
        <HStack w="100%" justify="space-between">
          <HStack gap="0">
            <SkeletonCircle size="9" />
            <SkeletonCircle size="9" />
            <VStack gap="4px" ml="4px" align="flex-start">
              <Skeleton height="4" width="100px" />
              <Skeleton height="4" width="150px" />
            </VStack>
          </HStack>
          {!isApp && <Skeleton height="5" width="250px" />}
        </HStack>
        <VStack w="100%" gap="12px">
          {isApp ? (
            <Block w="100%" borderRadius="16px" bg="position_bg" border="none" p={{ base: '16px 8px 12px', lg: '20px 16px ' }}>
              <VStack w="100%" gap="12px" align="flex-start">
                <HStack w="100%" justify="space-between">
                  <Skeleton height="4" width="100px" />
                  <Skeleton height="4" width="100px" />
                </HStack>
                <HStack w="100%" justify="space-between">
                  <Skeleton height="4" width="100px" />
                  <Skeleton height="4" width="100px" />
                </HStack>
                <HStack w="100%" justify="space-between">
                  <Skeleton height="4" width="100px" />
                  <Skeleton height="4" width="100px" />
                </HStack>
              </VStack>
            </Block>
          ) : (
            <VStack w="100%">
              <Block w="100%" borderRadius="16px" bg="position_bg" border="none" p={{ base: '16px 8px 12px', lg: '20px 16px ' }}>
                <VStack w={{ base: '100%', lg: 'calc(100%)' }} align="flex-start">
                  <HStack w="100%" justify="space-between">
                    <Skeleton height="4" width="100px" />
                    <Skeleton height="4" width="100px" />
                    <Skeleton height="4" width="100px" />
                    <Skeleton height="4" width="100px" />
                    <Skeleton height="4" width="100px" />
                  </HStack>
                </VStack>
              </Block>
              <Block w="100%" borderRadius="16px" bg="position_bg" border="none" p={{ base: '16px 8px 12px', lg: '20px 16px ' }}>
                <VStack w={{ base: '100%', lg: 'calc(100%)' }} align="flex-start">
                  <HStack w="100%" justify="space-between">
                    <Skeleton height="4" width="100px" />
                    <Skeleton height="4" width="100px" />
                    <Skeleton height="4" width="100px" />
                    <Skeleton height="4" width="100px" />
                    <Skeleton height="4" width="100px" />
                  </HStack>
                </VStack>
              </Block>
            </VStack>
          )}
        </VStack>
      </VStack>
    </Block>
  )
}

export default PositionListLoading
