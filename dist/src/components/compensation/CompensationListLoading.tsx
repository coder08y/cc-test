import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HStack, Skeleton, VStack } from '@chakra-ui/react'

function CompensationListLoading() {
  const { isApp } = useWindowWidth()
  return (
    <VStack w="100%" bg="bg_secondary" p="16px" borderRadius="16px" gap="20px" align="flex-start">
      <HStack w="100%" justify="space-between">
        <HStack gap="0">
          {/* <SkeletonCircle size="9" /> */}
          {/* <SkeletonCircle size="9" /> */}
          <VStack gap="4px" ml="4px" align="flex-start">
            {/* <Skeleton height="4" width="100px" /> */}
            <Skeleton height="28px" width="220px" borderRadius="9px" />
          </VStack>
        </HStack>
        {/* <Skeleton height="5" width="250px" /> */}
      </HStack>
      <VStack w={{ base: '100%', lg: '100%' }} align="flex-start" p="16px" bg="position_bg" borderRadius="16px" border="none">
        {/* <Skeleton height="4" width="200px" mt="8px" /> */}
        <HStack w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }}>
          <VStack
            w={{ base: '100%', lg: '40%' }}
            gap="4px"
            align="flex-start"
            h={{ base: '24px', lg: '58px' }}
            justify={{ base: 'space-between', lg: 'center' }}
            flexDirection={{ base: 'row', lg: 'column' }}
          >
            <Skeleton height={{ base: '16px', lg: '26px' }} width={{ base: '100%', lg: '180px' }} borderRadius="12px" />
          </VStack>
          <HStack
            w={{ base: '100%', lg: '60%' }}
            justifyContent={{ base: 'flex-start', lg: 'space-between' }}
            alignItems={{ base: 'flex-start', lg: 'flex-end' }}
            flexDirection={{ base: 'column', lg: 'row' }}
          >
            <VStack
              gap="4px"
              align="flex-start"
              w="100%"
              h={{ base: '24px', lg: '58px' }}
              justify={{ base: 'space-between', lg: 'center' }}
              flexDirection={{ base: 'row', lg: 'column' }}
              alignItems="center"
            >
              <Skeleton height={{ base: '16px', lg: '26px' }} width={{ base: '100%', lg: '180px' }} borderRadius="12px" />
            </VStack>
            <VStack
              gap="4px"
              align="flex-start"
              w="100%"
              h={{ base: '24px', lg: '58px' }}
              justify={{ base: 'space-between', lg: 'center' }}
              flexDirection={{ base: 'row', lg: 'column' }}
              alignItems="center"
            >
              <Skeleton height={{ base: '16px', lg: '26px' }} width={{ base: '100%', lg: '180px' }} borderRadius="12px" />
            </VStack>
            {!isApp ? (
              <VStack
                gap="4px"
                align="flex-start"
                w="100%"
                h={{ base: '24px', lg: '58px' }}
                justify={{ base: 'space-between', lg: 'center' }}
                flexDirection={{ base: 'row', lg: 'column' }}
                alignItems="center"
              >
                <Skeleton height={{ base: '16px', lg: '26px' }} width={{ base: '100%', lg: '180px' }} borderRadius="12px" />
              </VStack>
            ) : null}
          </HStack>
        </HStack>
      </VStack>
    </VStack>
  )
}

export default CompensationListLoading
