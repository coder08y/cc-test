import { TokensMap } from '@/types'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { HTextLabelBox, SingleCoinImage } from '@cetus/ui-kit'
import { textEllipses } from '@cetus/utils'
import { Box, HStack, Skeleton, Stack, Text, VStack } from '@chakra-ui/react'
import WithTooltipInfo from './WithTooltipInfo'

type RatioTypes = 'image' | 'text' | 'zap' | 'dlmm_zap'
type DepositRatioProps = {
  type: RatioTypes
  tokenA?: Token
  tokenB?: Token
  percentMap: TokensMap
  lockRatio?: boolean
  isReverse?: boolean
  isLoading?: boolean
  label?: string
}

function DepositRatio({
  tokenA,
  tokenB,
  type = 'image',
  percentMap,
  lockRatio = false,
  isReverse = false,
  isLoading = false,
  label
}: DepositRatioProps) {
  const { isApp } = useWindowWidth()
  return (
    <>
      {type === 'image' && (
        <WithTooltipInfo
          label="Deposit Ratio"
          tooltip="The ratio of two assets depends on the range you set and the current pool price."
          wrapStyle={{ gap: '0px' }}
        >
          <Stack flexDir={{ base: 'row', lg: 'row' }} gap={{ base: '4px', lg: '12px' }} justify={{ base: 'flex-end', lg: 'space-between' }}>
            {[tokenA, tokenB].filter(Boolean).map((token, index) => (
              <HStack key={token?.coin_type} gap="4px" justify={{ base: 'flex-end', lg: 'space-between' }} w={{ base: '100%', lg: 'auto' }}>
                <SingleCoinImage
                  imageUrl={token?.logo_url}
                  coinType={token ? token?.coin_type : ''}
                  w={isApp ? '16px' : '20px'}
                  h={isApp ? '16px' : '20px'}
                  showTagWidth="10px"
                  showTagHeight="10px"
                />
                <Text color={index === 0 ? 'primary' : 'primary_green'} fontSize={isApp ? '12px' : '14px'} whiteSpace="nowrap">
                  {textEllipses(token?.symbol, 10)}
                  &nbsp;
                  {lockRatio ? '--' : percentMap[index === 0 ? (isReverse ? 'percentB' : 'percentA') : isReverse ? 'percentA' : 'percentB']}%
                </Text>
                {isApp && index === 0 && <Box w="1px" h="8px" bg="border" mx="4px" />}
              </HStack>
            ))}
          </Stack>
        </WithTooltipInfo>
      )}
      {type === 'text' && (
        <HTextLabelBox
          isLoading={false}
          label="Deposit Ratio"
          value={`${percentMap[isReverse ? 'percentB' : 'percentA']}% ${textEllipses(tokenA?.symbol)} / ${percentMap[isReverse ? 'percentA' : 'percentB']}% ${textEllipses(tokenB?.symbol)} `}
          labelStyle={{
            fontSize: { base: '12px', lg: '14px' }
          }}
          valueStyle={{
            fontSize: { base: '12px', lg: '14px' },
            maxW: 'unset'
          }}
          skeletonStyle={{
            valueW: '128px'
          }}
        />
      )}
      {type === 'zap' && (
        <VStack w="100%" align="start">
          <Text fontSize="12px" color="text_caption">
            {label || 'Expected Amounts toAdd'}
          </Text>
          {isLoading ? (
            <Skeleton w={{ base: '100%', lg: '150px' }} h="16px" />
          ) : (
            <HStack gap={{ base: '4px', lg: '12px' }} justify="space-between" w="100%">
              {(!isReverse ? [tokenA, tokenB] : [tokenB, tokenA]).filter(Boolean).map((token, index) => (
                <HStack key={token?.coin_type} gap="4px">
                  {/* <SingleCoinImage
                    imageUrl={token?.logo_url}
                    coinType={token ? token?.coin_type : ''}
                    w="20px"
                    h="20px"
                    showTagWidth="10px"
                    showTagHeight="10px"
                  /> */}
                  <Text color={index === 0 ? 'primary' : 'primary_green'} fontSize="12px" whiteSpace="nowrap">
                    {textEllipses(token?.symbol, 10)}
                    &nbsp;
                    {lockRatio ? '--' : percentMap[index === 0 ? (isReverse ? 'percentB' : 'percentA') : isReverse ? 'percentA' : 'percentB']}%
                  </Text>
                </HStack>
              ))}
            </HStack>
          )}
        </VStack>
      )}

      {type === 'dlmm_zap' && (
        <VStack w="100%" align="start">
          <Text fontSize="12px" color="text_caption">
            {label || 'Expected Amounts toAdd'}
          </Text>
          {isLoading ? (
            <Skeleton w={{ base: '100%', lg: '150px' }} h="16px" />
          ) : (
            <HStack gap={{ base: '4px', lg: '12px' }} justify="space-between" w="100%">
              {(!isReverse ? [tokenA, tokenB] : [tokenB, tokenA]).filter(Boolean).map((token, index) => (
                <HStack key={token?.coin_type} gap="4px" w="auto">
                  {/* <SingleCoinImage
                    imageUrl={token?.logo_url}
                    coinType={token ? token?.coin_type : ''}
                    w="20px"
                    h="20px"
                    showTagWidth="10px"
                    showTagHeight="10px"
                  /> */}
                  <Text
                    color={isReverse ? (index === 0 ? 'primary' : 'primary_green') : index === 0 ? 'primary_green' : 'primary'}
                    fontSize="12px"
                    whiteSpace="nowrap"
                  >
                    {textEllipses(token?.symbol, 10)}
                    &nbsp;
                    {lockRatio ? '--' : percentMap[index === 0 ? (isReverse ? 'percentB' : 'percentA') : isReverse ? 'percentA' : 'percentB']}%
                  </Text>
                </HStack>
              ))}
            </HStack>
          )}
        </VStack>
      )}
    </>
  )
}

export default DepositRatio
