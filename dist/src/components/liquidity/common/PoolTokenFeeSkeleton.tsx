import { HStack, Skeleton, SkeletonCircle, VStack } from '@chakra-ui/react'

export default function PoolTokenFeeSkeleton() {
  return (
    <VStack w="100%" gap="12px" align="flex-start" flex="1">
      <HStack w="100%" gap="4px">
        <HStack gap="0px">
          <SkeletonCircle size="22px" />
          <SkeletonCircle size="22px" />
        </HStack>
        <VStack align="flex-start" gap="4px">
          <Skeleton h="14px" w="100px" />
          <Skeleton h="10px" w="80px" />
        </VStack>
        <SkeletonCircle size="12px" />
      </HStack>
    </VStack>
  )
}
