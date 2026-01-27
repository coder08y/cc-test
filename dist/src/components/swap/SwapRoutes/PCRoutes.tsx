import { AggregatorDexMap } from '@/config/aggregator'
import { AggregatorProvider } from '@/types'
import { getPercentage } from '@/utils'
import { CoinPairImage, SingleCoinImage } from '@cetus/ui-kit'
import { addComma, formatFeeRate } from '@cetus/utils'
import { Box, Center, HStack, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import RouteTip from './RouteTip'
import { RoutesProps } from './type'

const PCRoutes = ({ fromToken, toToken, fromAmount, toAmount, routes, loading }: RoutesProps) => {
  return (
    <VStack w="100%" gap="12px">
      <HStack w="100%" justify="space-between">
        <HStack borderRadius="14px" h="28px" p="0 12px 0 0 ">
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
        <HStack borderRadius="14px" h="28px" p="0 0 0 12px">
          {loading ? (
            <>
              <Box pos="relative" w="100px" h="14px">
                <Skeleton pos="absolute" left="0" w="50%" borderRadius="4px" h="14px" endColor="skeleton_light" />
                <Skeleton pos="absolute" right="0" w="100%" h="14px" />
              </Box>
              <SkeletonCircle w="28px" h="28px" />
            </>
          ) : (
            <>
              <Text color="text_caption">{addComma(toAmount || '0')}</Text>
              <Text>{toToken?.symbol}</Text>
              <SingleCoinImage
                imageUrl={toToken?.logo_url}
                w="28px"
                h="28px"
                coinType={toToken?.coin_type}
                showTagWidth="12px"
                showTagHeight="12px"
              />
            </>
          )}
        </HStack>
      </HStack>
      <Box w="100%" bg="bg_secondary" p="32px 24px" borderRadius="12px" position="relative">
        <Box position="absolute" left="0" p="8px" top="calc(50% - 20px)" bg="background" borderRadius="0px 100px 100px 0px" zIndex={2}>
          {loading ? (
            <SkeletonCircle w="24px" h="24px" />
          ) : (
            <SingleCoinImage
              imageUrl={fromToken?.logo_url}
              w="24px"
              h="24px"
              coinType={fromToken?.coin_type}
              showTagWidth="10px"
              showTagHeight="10px"
            />
          )}
        </Box>
        <Box position="absolute" right="0" p="8px" top="calc(50% - 20px)" bg="background" borderRadius="100px 0px 0px 100px" zIndex={2}>
          {loading ? (
            <SkeletonCircle w="24px" h="24px" />
          ) : (
            <SingleCoinImage imageUrl={toToken?.logo_url} w="24px" h="24px" coinType={toToken?.coin_type} showTagWidth="10px" showTagHeight="10px" />
          )}
        </Box>
        <VStack
          gap="32px"
          border="1px dashed"
          borderBottom={(routes || [])?.length > 1 ? '1px dashed' : 'none'}
          borderColor="border"
          borderRadius="8px"
        >
          {routes?.map((route, index) => (
            <HStack
              key={index}
              mt={index === 0 ? '-20px' : 0}
              mb={index === routes.length - 1 ? '-20px' : 0}
              w="100%"
              justify="space-between"
              gap="0"
              sx={
                index > 0 && index < routes.length - 1
                  ? {
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
                    }
                  : { position: 'relative' }
              }
            >
              {!loading && (
                <Center borderRadius="12px" h="24px" bg="card_bg" p="8px 12px" ml="24px" zIndex={2} position="absolute">
                  <Text color="primary" fontSize="12px" lineHeight="12px" fontWeight="500">
                    {getPercentage(route.percentage)}
                  </Text>
                </Center>
              )}

              <HStack h="40px" w="100%" justify="center" zIndex={2}>
                {loading ? (
                  <>
                    <HStack gap="8px" position="absolute" h="40px" borderRadius="20px" p="8px" bg="card_bg">
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
                      <HStack borderRadius="20px" p="8px" bg="card_bg">
                        <CoinPairImage
                          coinAIconUrl={path.fromToken?.logo_url}
                          coinBIconUrl={path.toToken?.logo_url}
                          variant=""
                          p="0px"
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
                              {getPercentage(formatFeeRate(path.fee_rate, path.provider === AggregatorProvider.FULLSAIL ? 4 : 2))}
                            </Text>
                          </Center>
                        )}
                      </HStack>
                    </RouteTip>
                  ))
                )}
              </HStack>
            </HStack>
          ))}
        </VStack>
      </Box>
    </VStack>
  )
}

export default PCRoutes
