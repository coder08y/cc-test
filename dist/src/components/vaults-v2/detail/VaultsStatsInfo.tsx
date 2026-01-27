import { VaultV2ApiInfo } from '@/types/vaults-v2'
import { CetusTooltip, TooltipIcon } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HTextLabelBox, VTextLabelBox } from '@cetus/ui-kit'
import { symbolDataDisplayProcessing } from '@cetus/utils'
import { Center, HStack, Image, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import VaultsAprBlock from '../list/common/VaultsAprBlock'
import { VaultsProvider } from '../list/common/VaultsProvider'
import { CoinImage } from '../list/common/VaultsRewardsBlock'

export default function VaultsStatsInfo({
  apiVaultInfo,
  vaultTvl,
  performanceFee,
  currentVaultPool
}: {
  apiVaultInfo: VaultV2ApiInfo
  vaultTvl: string
  performanceFee?: string
  currentVaultPool?: any
}) {
  const { isApp } = useWindowWidth()
  const rewardsLoading = useMemo(() => {
    return !apiVaultInfo?.vaultsRewards || apiVaultInfo?.vaultsRewards?.length === 0
  }, [apiVaultInfo?.vaultsRewards, apiVaultInfo?.status])

  const tvlLoading = useMemo(() => {
    // 如果没有基础信息，则为 loading 状态
    if (!apiVaultInfo || !currentVaultPool) return true

    // 对于 haedal 和 haevault_v2 类型，检查 vaultTvl 是否有值
    if (apiVaultInfo?.category === 'haedal' || apiVaultInfo?.category === 'haevault_v2') {
      return !vaultTvl
    }

    // 对于其他类型，检查 vaultsTvlDisplay 是否有值
    return !apiVaultInfo?.vaultsTvlDisplay
  }, [apiVaultInfo, apiVaultInfo?.category, vaultTvl, apiVaultInfo?.vaultsTvlDisplay])

  return (
    <VStack w="100%" bg="bg_secondary" borderRadius="16px" p="20px 16px 12px">
      <HStack w="100%" spacing="16px" paddingBottom={'16px'} borderBottom={'1px solid'} borderColor="border_secondary">
        <VTextLabelBox
          title="TVL"
          value={
            tvlLoading ? (
              <Skeleton w="100px" h="20px" />
            ) : (
              <Text color="text_caption" fontSize="16px" fontWeight="500">
                {(apiVaultInfo?.category == 'haedal' || apiVaultInfo?.category == 'haevault_v2'
                  ? symbolDataDisplayProcessing(vaultTvl, '$')
                  : apiVaultInfo?.vaultsTvlDisplay) || '-'}
              </Text>
            )
          }
          wrapStyle={{ flex: 1, gap: '8px', h: '36px' }}
          titleStyle={{ fontSize: '12px', color: 'primary_gray' }}
        />
        <VTextLabelBox
          title="APY"
          value={
            <VaultsAprBlock
              vaultId={apiVaultInfo?.vaultId}
              wrapStyle={{
                flexDirection: 'row',
                h: '20px',
                alignItems: {
                  base: 'flex-start'
                }
              }}
              apyTextStyle={{
                fontSize: '16px'
              }}
              farmingTextStyle={{
                p: '4px',
                fontSize: '12px'
              }}
            />
          }
          wrapStyle={{ flex: 1, gap: '8px', h: '36px' }}
          titleStyle={{ fontSize: '12px', color: 'primary_gray' }}
        />
        {apiVaultInfo?.status !== 'sunset' && (
          <VTextLabelBox
            title="Earnings"
            value={
              <CetusTooltip
                placement="top"
                tooltip={
                  <Text fontSize="12px" lineHeight="20px" maxW="240px">
                    Rewards will be auto harvested and compounded to your position.
                  </Text>
                }
              >
                <Center>
                  <HStack justifyContent="end">
                    {rewardsLoading ? (
                      <Skeleton w="80px" h="20px" />
                    ) : (
                      apiVaultInfo.vaultsRewards.map(coinType => {
                        return <CoinImage key={coinType} coinType={coinType} size="20px" />
                      })
                    )}
                  </HStack>
                </Center>
              </CetusTooltip>
            }
            wrapStyle={{ flex: 1, h: '40px', gap: rewardsLoading ? '8px' : '8px' }}
            titleStyle={{ fontSize: '12px', color: 'primary_gray' }}
          />
        )}
      </HStack>
      <HStack w="100%" gap={{ base: '16px', lg: '40px' }}>
        <HStack>
          <HTextLabelBox
            label="Provider"
            isLoading={tvlLoading}
            value={
              // <HStack gap="8px">
              //   <Image
              //     src={apiVaultInfo?.category === 'cetus' ? '/images/cetus-logo@2x.png' : '/images/haedal-logo@2x.png'}
              //     w={apiVaultInfo?.category === 'cetus' ? '18px' : '18px'}
              //     h={apiVaultInfo?.category === 'cetus' ? '18px' : '18px'}
              //   />
              //   <Text fontSize="14px" color="text_caption">
              //     {apiVaultInfo?.category === 'cetus' ? 'Cetus Protocol' : 'Haedal Protocol'}
              //   </Text>
              // </HStack>
              <HStack gap="8px">
                {!apiVaultInfo?.version || isApp ? (
                  <Image
                    src={apiVaultInfo?.category === 'cetus' ? '/images/cetus-logo@2x.png' : '/images/haedal-logo@2x.png'}
                    w={apiVaultInfo?.category === 'cetus' ? '18px' : '24px'}
                    h={apiVaultInfo?.category === 'cetus' ? '18px' : '24px'}
                  />
                ) : (
                  <VaultsProvider category={apiVaultInfo.category} version={apiVaultInfo.version} />
                )}
                {!isApp ? (
                  <Text fontSize="14px" color="text_caption">
                    {apiVaultInfo?.category === 'cetus' ? 'Cetus Protocol' : 'Haedal Protocol'}
                  </Text>
                ) : (
                  <Text fontSize="14px" color="text_caption">
                    {apiVaultInfo?.category === 'cetus' ? 'Cetus' : `Haedal ${apiVaultInfo?.version === 'V1' ? 'v1' : 'v2'}`}
                  </Text>
                )}
              </HStack>
            }
            wrapStyle={{ flex: 1, gap: '8px' }}
            labelStyle={{ fontSize: '12px', color: 'primary_gray' }}
          />
        </HStack>
        {apiVaultInfo?.category !== 'cetus' && (
          <HStack>
            <HTextLabelBox
              label={
                <HStack gap="2px">
                  <Text fontSize="12px" color="primary_gray">
                    Performance Fee
                  </Text>
                  <TooltipIcon maxW="340px" tooltipCon="Commission charged from earned fees and rewards" />
                </HStack>
              }
              value={!performanceFee ? <Skeleton w="40px" h="20px" /> : performanceFee || '-'}
              valueStyle={{
                fontSize: '14px'
              }}
              wrapStyle={{
                justifyContent: 'flex-start',
                gap: '8px'
              }}
            />
          </HStack>
        )}
      </HStack>
    </VStack>
  )
}
