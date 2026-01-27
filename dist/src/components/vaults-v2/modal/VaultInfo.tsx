import PoolTag from '@/components/common/PoolTag'
import useCurrentVaultsFarm from '@/hooks/vaults-farming/useCurrentVaultsFarm'
import { Token } from '@cetus/types'
import { CoinPairImage, VTextLabelBox } from '@cetus/ui-kit'
import { Flex, Text, VStack } from '@chakra-ui/react'
import VaultsFarmIcon from '../common/VaultsFarmIcon'
import { VaultsSunsetTips } from '../common/VaultsSunsetTips'
import VaultsAprBlock from '../list/common/VaultsAprBlock'
import VaultPositionRange from './VaultPositionRange'

type VaultInfoProps = {
  vaultId: string
  displayTokenA?: Token
  displayTokenB?: Token
  feeDisplay: string
  clmmPool: string
  isReverse: boolean
  minPrice?: string
  maxPrice?: string
  currPrice?: string
  category: string
  apiVaultInfo?: any
  binStep?: string
  poolCount?: number
}
function VaultInfo(props: VaultInfoProps) {
  const { vaultId, displayTokenA, displayTokenB, feeDisplay, minPrice, maxPrice, currPrice, apiVaultInfo, binStep, poolCount = 1 } = props
  const { isVaultsFarming, isActiveVaultsFarming } = useCurrentVaultsFarm(vaultId)

  return (
    <VStack
      width={{ base: 'calc(100% + 24px)', lg: 'calc(100% + 32px)' }}
      padding={{ base: '0 12px 8px', lg: '0 16px 16px' }}
      alignItems="left"
      borderBottom={{ base: '0', lg: '1px solid #2A3238' }}
      borderColor="border"
      gap={{ base: '12px', lg: '8px' }}
    >
      <Flex>
        <CoinPairImage
          coinAIconUrl={displayTokenA?.logo_url}
          coinBIconUrl={displayTokenB?.logo_url}
          imageStyle={{
            w: { base: '24px', lg: '32px' },
            h: { base: '24px', lg: '32px' }
          }}
          imgBoxStyle={{
            w: { base: '24px', lg: '32px' },
            h: { base: '24px', lg: '32px' }
          }}
        />

        <Flex marginLeft="8px" justifyContent="space-between" alignItems="center" width="100%">
          <VStack alignItems="flex-start" gap={{ base: '0', lg: '4px' }}>
            <Flex alignItems="center" gap={{ base: '4px', lg: '0' }}>
              <Text fontSize={{ base: '14px', lg: '16px' }} color="text_caption">
                {`${displayTokenA?.symbol} - ${displayTokenB?.symbol}`}
              </Text>
              {isVaultsFarming && isActiveVaultsFarming && (
                <VaultsFarmIcon
                  imageStyle={{
                    ml: '4px'
                  }}
                />
              )}
              {apiVaultInfo?.status === 'sunset' && (
                <VaultsSunsetTips status={apiVaultInfo?.status} onMouseEnter={() => {}} wrapStyle={{ ml: '8px' }} />
              )}
            </Flex>
            {/* <Block w="auto" p="3px 12px 2px" borderRadius="12px" bg="none" borderColor="primary">
              <Text fontSize="12px" color="primary">
                {binStep ? 'DLMM' : 'CLMM'} {feeDisplay} {binStep ? binStep + ' bps' : ''}
              </Text>
            </Block> */}
            {/* <HStack>
              {apiVaultInfo?.version && (
                <VaultVersionTag
                  version={apiVaultInfo?.version}
                  poolType={binStep ? 'dlmm' : 'clmm'}
                  wrapStyle={{ bg: 'transparent', borderColor: 'white_color_opacity.20' }}
                />
              )} */}

            {apiVaultInfo?.version !== 'V2' && poolCount === 1 && (
              <PoolTag
                poolType={binStep ? 'dlmm' : 'clmm'}
                displayFee={feeDisplay}
                binStep={binStep ? Number(binStep) : undefined}
                wrapStyle={{ bg: 'transparent', borderColor: 'white_color_opacity.20' }}
              />
            )}
            {/* </HStack> */}
          </VStack>
          <Flex flexDirection="column">
            {/* <VTextLabelBox
              wrapStyle={{
                gap: '2px',
                alignItems: 'flex-end !important'
              }}
              title=""
              titleStyle={{
                color: 'primary',
                fontSize: '12px'
              }}
              tooltipStyle={{
                p: '8px'
              }}
              value={
                <CetusTooltip
                  tooltip={
                    apiVaultInfo?.category == 'cetus' ? (
                      <VaultsAprTooltipContentLST
                        vaultsLstApyDisplay={apiVaultInfo?.vaultsLstApyDisplay}
                        vaultsApyDisplay={apiVaultInfo?.vaultsApyDisplay}
                        vaultsTotalApyDisplay={apiVaultInfo?.vaultsTotalApyDisplay}
                        vaultsAprDisplay={apiVaultInfo?.vaultsAprDisplay}
                        category={apiVaultInfo?.category}
                      />
                    ) : (
                      <VaultsAprTooltipContent
                        vaultsLstApyDisplay={apiVaultInfo?.vaultsLstApyDisplay}
                        vaultsApyDisplay={apiVaultInfo?.vaultsApyDisplay}
                        vaultsTotalApyDisplay={apiVaultInfo?.vaultsTotalApyDisplay}
                        vaultsAprDisplay={apiVaultInfo?.vaultsAprDisplay}
                        vaultFarmingAprDisplay={vaultFarmingAprDisplay}
                        category={apiVaultInfo?.category}
                        isVaultsFarming={isVaultsFarming}
                      />
                    )
                  }
                >
                  <HStack>
                    <HStack>
                      <Text fontWeight="500" color="primary">
                        APY:
                      </Text>
                      <Text textDecor="underline dotted" color="primary">
                        {apiVaultInfo?.category == 'cetus' ? apiVaultInfo?.vaultsTotalApyDisplay : apiVaultInfo?.vaultsApyDisplay || '-'}
                      </Text>
                    </HStack>
                    {isVaultsFarming && vaultFarmingAprDisplay && (
                      <Text p="2px 4px" bg="primary_yellow_opacity.10" color="primary_yellow" borderRadius="4px" fontSize="12px">
                        +{vaultFarmingAprDisplay}
                      </Text>
                    )}
                  </HStack>
                </CetusTooltip>
              }
              valueStyle={{
                color: 'text_highlight',
                h: '20px',
                lineHeight: '20px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none'
              }}
            /> */}
            <VTextLabelBox
              wrapStyle={{
                gap: '2px',
                alignItems: 'flex-end !important'
              }}
              title=""
              titleStyle={{
                color: 'primary',
                fontSize: '12px'
              }}
              value={
                <VaultsAprBlock
                  vaultId={apiVaultInfo?.vaultId}
                  wrapStyle={{
                    flexDirection: 'row'
                  }}
                />
              }
              valueStyle={{
                color: 'text_highlight',
                h: '20px',
                lineHeight: '20px',
                fontSize: '14px',
                fontWeight: '500',
                textDecoration: 'none'
              }}
            />
          </Flex>
        </Flex>
      </Flex>
      {poolCount === 1 && apiVaultInfo?.category !== 'haevault_v2' && apiVaultInfo?.status !== 'sunset' && (
        <VaultPositionRange minPrice={minPrice} maxPrice={maxPrice} currPrice={currPrice} />
      )}
    </VStack>
  )
}

export default VaultInfo
