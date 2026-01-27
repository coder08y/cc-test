import { AggregatorDexMap } from '@/config/aggregator'
import { getPercentage } from '@/utils'
import { CoinPairImage, SingleCoinImage } from '@cetus/ui-kit'
import { addComma, formatFeeRate } from '@cetus/utils'
import { Box, Center, HStack, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import RouteTip from './RouteTip'
import { RoutesProps } from './type'

const H5Routes = ({ fromToken, toToken, fromAmount, toAmount, routes, loading }: RoutesProps) => {
  return (
    <VStack w="100%" align="center" p="20px 0 8px">
      <HStack>
        {loading ? (
          <>
            <SkeletonCircle w="28px" h="28px" />
            <Box pos="relative" w="100px" h="14px">
              <Skeleton pos="absolute" left="0" w="50%" borderRadius="4px" h="14px" endColor="skeleton_light" />
              <Skeleton pos="absolute" right="0" w="100%" h="14px" />
            </Box>
          </>
        ) : (
          <>
            <SingleCoinImage
              imageUrl={fromToken?.logo_url}
              w="28px"
              h="28px"
              coinType={fromToken?.coin_type}
              showTagWidth="12px"
              showTagHeight="12px"
            />
            <Text color="text_caption">{addComma(fromAmount || '0')}</Text>
            <Text>{fromToken?.symbol}</Text>
          </>
        )}
      </HStack>

      <Box
        w="100%"
        bg="bg_secondary"
        p="20px 8px"
        borderRadius="8px"
        sx={{
          position: 'relative',
          _before: {
            content: '""',
            position: 'absolute',
            top: '0',
            left: '50%',
            width: '0',
            height: '20px',
            borderLeft: '1px dashed',
            borderColor: 'border'
          },
          _after: {
            content: '""',
            position: 'absolute',
            bottom: '0',
            left: '50%',
            width: '0',
            height: '20px',
            borderLeft: '1px dashed',
            borderColor: 'border'
          }
        }}
      >
        <VStack gap={loading ? '56px' : '16px'} border="1px dashed" borderColor="border" borderRadius="8px" p={loading ? '36px 0' : '16px 0'}>
          {routes?.map((route, index) => (
            <HStack
              key={index}
              w="100%"
              gap="0"
              justify="space-between"
              sx={{
                position: 'relative',
                _before: {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '0',
                  width: '100%',
                  height: '1px',
                  borderTop: '1px dashed',
                  borderColor: 'border',
                  zIndex: 1
                }
              }}
            >
              {!loading && (
                <Center borderRadius="12px" h="24px" bg="h5_router_percentage_bg" p="6px 12px" ml="20px" zIndex={2}>
                  <Text color="primary" fontSize="12px" lineHeight="12px" fontWeight="500">
                    {getPercentage(route.percentage)}
                  </Text>
                </Center>
              )}

              <VStack
                w="100%"
                align="center"
                sx={
                  route.paths.length > 1 && !loading
                    ? {
                        position: 'relative',
                        _before: {
                          content: '""',
                          backgroundColor: 'bg_secondary',
                          position: 'absolute',
                          top: '20px',
                          right: '16px',
                          width: 'calc(100% - 32px)',
                          height: 'calc(100% - 40px)',
                          border: '1px dashed',
                          borderColor: 'border',
                          borderRadius: '8px',
                          zIndex: 2
                        }
                      }
                    : {}
                }
              >
                {loading ? (
                  <>
                    <HStack gap="8px" position="absolute" h="40px" top="-20px" borderRadius="20px" p="8px" bg="card_bg" zIndex={2}>
                      <HStack gap="0">
                        <SkeletonCircle w="24px" h="24px" />
                        <SkeletonCircle w="24px" h="24px" />
                      </HStack>
                      <Box pos="relative" w="100px" h="14px">
                        <Skeleton pos="absolute" left="0" w="50%" borderRadius="4px" h="14px" endColor="skeleton_light" />
                        <Skeleton pos="absolute" right="0" w="100%" h="14px" />
                      </Box>
                    </HStack>
                  </>
                ) : (
                  route.paths.map(path => (
                    <RouteTip key={path.to_type} fromToken={path?.fromToken} toToken={path?.toToken} poolAddress={path?.pool_address}>
                      <HStack key={path.to_type} borderRadius="20px" p="8px" bg="card_bg" zIndex={3}>
                        <CoinPairImage
                          coinAIconUrl={path.fromToken?.logo_url}
                          coinBIconUrl={path.toToken?.logo_url}
                          w="24px"
                          h="24px"
                          imageStyle={{ decoding: 'async' }}
                          coinACoinType={path.fromToken?.coin_type}
                          coinBCoinType={path.toToken?.coin_type}
                          showTagWidth="10px"
                          showTagHeight="10px"
                        />
                        <Text fontSize="12px" color="text_caption" lineHeight="12px" fontWeight="500">
                          {AggregatorDexMap[path.provider]?.name}
                        </Text>
                        {!!+path.fee_rate && (
                          <Center p="6px 8px" border="1px solid" borderColor="border" borderRadius="12px">
                            <Text fontSize="12px" color="text_caption" lineHeight="12px" fontWeight="500">
                              {getPercentage(formatFeeRate(path.fee_rate))}
                            </Text>
                          </Center>
                        )}
                      </HStack>
                    </RouteTip>
                  ))
                )}
              </VStack>
            </HStack>
          ))}
        </VStack>
      </Box>

      <HStack>
        {loading ? (
          <>
            <SkeletonCircle w="28px" h="28px" />
            <Box pos="relative" w="100px" h="14px">
              <Skeleton pos="absolute" left="0" w="50%" borderRadius="4px" h="14px" endColor="skeleton_light" />
              <Skeleton pos="absolute" right="0" w="100%" h="14px" />
            </Box>
          </>
        ) : (
          <>
            <SingleCoinImage imageUrl={toToken?.logo_url} w="28px" h="28px" coinType={toToken?.coin_type} showTagWidth="12px" showTagHeight="12px" />
            <Text color="text_caption">{addComma(toAmount || '0')}</Text>
            <Text>{toToken?.symbol}</Text>
          </>
        )}
      </HStack>
    </VStack>
  )
}

export default H5Routes
