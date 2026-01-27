import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { VTextLabelBox } from '@cetus/ui-kit'
import { formatNumber, symbolDataDisplayProcessing } from '@cetus/utils'
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { AumLimit } from '../common/AumLimit'

export function VaultsComposition({
  currentVaultPool,
  apiVaultInfo,
  depositRatio,
  hardCapUSD,
  vaultTvl,
  vaultsCoinAValue,
  vaultsCoinBValue
}: {
  currentVaultPool?: any
  apiVaultInfo?: any
  depositRatio?: string
  hardCapUSD?: string
  vaultTvl?: string
  vaultsCoinAValue?: string
  vaultsCoinBValue?: string
}) {
  const { displayTokenA, displayTokenB } = apiVaultInfo || {}
  const { displayPercentA, displayPercentB, displayAmountA, displayAmountB } = currentVaultPool || {}
  const { isApp } = useWindowWidth()
  return (
    <VStack w="100%" mt={apiVaultInfo?.status === 'sunset' ? '0' : { base: '28px', lg: '44px' }} gap="0">
      <HStack w="100%" justifyContent="space-between">
        <Text textAlign="start" fontSize="14px" color="text_caption">
          Composition
        </Text>
        {hardCapUSD && apiVaultInfo?.status !== 'sunset' && apiVaultInfo?.status !== 'sunsetSoon' && (
          <AumLimit
            depositRatio={depositRatio}
            hardCapUSD={hardCapUSD}
            vaultTvl={vaultTvl}
            label="Capacity"
            value={symbolDataDisplayProcessing(hardCapUSD, '$')}
            haveCircleProgress={true}
            labelStyle={{
              fontSize: '14px'
            }}
            textStyle={{
              fontSize: '14px'
            }}
          />
        )}
      </HStack>

      {!isApp ? (
        <HStack w="100%" justifyContent="space-between" mt="24px">
          <HStack>
            <SingleTokenInfo token={displayTokenA} haveName={false} haveSymbol={false} imgBoxStyle={{ w: '28px', h: '28px' }} />
            <VTextLabelBox
              title={
                <HStack>
                  {!displayAmountA ? (
                    <Skeleton w="100px" h="16px" />
                  ) : (
                    <Text fontSize="14px" color="text_caption">
                      {formatNumber(displayAmountA, 6)} {displayTokenA?.symbol}
                    </Text>
                  )}
                  {!displayPercentA ? (
                    <Skeleton w="50px" h="16px" />
                  ) : (
                    <Text color="primary" fontSize="12px" bg="primary_opacity.10" p="2px" borderRadius="4px">
                      {symbolDataDisplayProcessing(displayPercentA, '%')}
                    </Text>
                  )}
                </HStack>
              }
              value={!vaultsCoinAValue ? <Skeleton w="60px" h="16px" /> : symbolDataDisplayProcessing(vaultsCoinAValue, '$')}
              wrapStyle={{
                gap: '8px'
              }}
              valueStyle={{
                color: 'primary_gray'
              }}
            />
          </HStack>
          <HStack>
            <VTextLabelBox
              title={
                <HStack>
                  {!displayPercentB ? (
                    <Skeleton w="50px" h="16px" />
                  ) : (
                    <Text color="primary_green" fontSize="12px" bg="primary_green_opacity.10" p="2px" borderRadius="4px">
                      {symbolDataDisplayProcessing(displayPercentB, '%')}
                    </Text>
                  )}
                  {!displayAmountB ? (
                    <Skeleton w="100px" h="16px" />
                  ) : (
                    <Text fontSize="14px" color="text_caption">
                      {formatNumber(displayAmountB, 6)} {displayTokenB?.symbol}
                    </Text>
                  )}
                </HStack>
              }
              value={!vaultsCoinBValue ? <Skeleton w="60px" h="16px" /> : symbolDataDisplayProcessing(vaultsCoinBValue, '$')}
              wrapStyle={{
                gap: '8px',
                alignItems: 'flex-end'
              }}
              valueStyle={{
                color: 'primary_gray'
              }}
            />
            <SingleTokenInfo token={displayTokenB} haveName={false} haveSymbol={false} imgBoxStyle={{ w: '28px', h: '28px' }} />
          </HStack>
        </HStack>
      ) : (
        <VStack w="100%" justifyContent="space-between" mt="24px" bg="vaults_price_block_bg" borderRadius="8px" p="16px" gap="0">
          <HStack w="100%" justifyContent="space-between">
            <HStack>
              <SingleTokenInfo token={displayTokenA} haveName={false} haveSymbol={false} imgBoxStyle={{ w: '28px', h: '28px' }} />
              <VTextLabelBox
                title={
                  <HStack>
                    {!displayAmountA ? (
                      <Skeleton w="100px" h="16px" />
                    ) : (
                      <Text fontSize="14px" color="text_caption">
                        {formatNumber(displayAmountA, 6)} {displayTokenA?.symbol}
                      </Text>
                    )}
                  </HStack>
                }
                value={!vaultsCoinAValue ? <Skeleton w="60px" h="16px" /> : symbolDataDisplayProcessing(vaultsCoinAValue, '$')}
                wrapStyle={{
                  gap: '8px',
                  alignItems: 'flex-start'
                }}
                valueStyle={{
                  fontSize: '12px',
                  color: 'primary_gray'
                }}
              />
            </HStack>
            {!displayPercentA ? (
              <Skeleton w="50px" h="16px" />
            ) : (
              <Text color="primary" fontSize="12px" bg="primary_opacity.10" p="2px" borderRadius="4px">
                {symbolDataDisplayProcessing(displayPercentA, '%')}
              </Text>
            )}
          </HStack>
          <Box w="100%" h="1px" bg="border" m="16px 0" />
          <HStack w="100%" justifyContent="space-between">
            <HStack>
              <SingleTokenInfo token={displayTokenB} haveName={false} haveSymbol={false} imgBoxStyle={{ w: '28px', h: '28px' }} />
              <VTextLabelBox
                title={
                  <HStack>
                    {!displayAmountB ? (
                      <Skeleton w="100px" h="16px" />
                    ) : (
                      <Text fontSize="14px" color="text_caption">
                        {formatNumber(displayAmountB, 6)} {displayTokenB?.symbol}
                      </Text>
                    )}
                  </HStack>
                }
                value={!vaultsCoinBValue ? <Skeleton w="60px" h="16px" /> : symbolDataDisplayProcessing(vaultsCoinBValue, '$')}
                wrapStyle={{
                  gap: '8px',
                  alignItems: 'flex-start'
                }}
                valueStyle={{
                  fontSize: '12px',
                  color: 'primary_gray'
                }}
              />
            </HStack>
            {!displayPercentB ? (
              <Skeleton w="50px" h="16px" />
            ) : (
              <Text color="primary_green" fontSize="12px" bg="primary_green_opacity.10" p="2px" borderRadius="4px">
                {symbolDataDisplayProcessing(displayPercentB, '%')}
              </Text>
            )}
          </HStack>
        </VStack>
      )}
    </VStack>
  )
}
