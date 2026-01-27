import CoinPairInfo from '@/components/common/CoinPairInfo'
import useCalculateVaultFarmingApr from '@/hooks/vaults-farming/useCalculateVaultFarmingApr'
import useCurrentVaultsFarm from '@/hooks/vaults-farming/useCurrentVaultsFarm'
import { VaultsV2ListItemType } from '@/types/vaults-v2'
import { CetusTooltip } from '@cetus/design'
import { HTextLabelBox, Icon } from '@cetus/ui-kit'
import { HStack, Image, Progress, Text, VStack } from '@chakra-ui/react'
import { AumLimit } from '../../common/AumLimit'
import { VaultsAction } from '../common/VaultsAction'
import VaultsAprBlock from '../common/VaultsAprBlock'
import { VaultsExpendItem } from '../common/VaultsExpendItem'
import VaultsHoldings from '../common/VaultsHoldings'
import VaultsRewardsBlock from '../common/VaultsRewardsBlock'

function VaultsListItemH5<T>({
  openExpend,
  onExpand,
  apiInfo,
  logo_url,
  jumpVaultsDetail,
  isShowPowered,
  isShowAumLimit,
  currentStatus
}: VaultsV2ListItemType<T>) {
  const { currentVaultsFarm, isActiveVaultsFarming } = useCurrentVaultsFarm(apiInfo?.vaultId)
  const { vaultFarmingAprDisplay } = useCalculateVaultFarmingApr(currentVaultsFarm)

  return (
    <VStack w="100%" align="flex-start" border="1px solid" borderColor="border" p="8px" borderRadius="12px" gap="16px" bg="bg_fifth">
      <HStack>
        <CoinPairInfo
          versionBlockPosition="right"
          poolInfo={{
            ...apiInfo,
            poolAddress: apiInfo?.vaultId,
            poolType: apiInfo?.category === 'haevault_v2' ? '' : apiInfo?.clmmPoolAddress.length > 0 ? 'clmm' : 'dlmm'
          }}
          showPoolTypeTag={apiInfo?.category === 'haevault_v2' ? false : true}
          showFee={apiInfo?.category === 'haevault_v2' ? false : true}
          // isShowPowered={isShowPowered}
          symbolFontSize="15px"
          isShowVaultsFarmIcon={isActiveVaultsFarming}
          type="row"
          status={apiInfo?.status}
          currentStatus={currentStatus}
        />
      </HStack>
      <VStack w="100%" gap="16px" mt="4px">
        {isShowAumLimit ? (
          <HTextLabelBox
            label="TVL"
            value={
              <VStack alignItems="flex-end">
                {Number(apiInfo.hardCapUSD) == 0 ? (
                  <CetusTooltip
                    tooltip=" No capacity limit "
                    children={
                      <VStack gap="4px">
                        <Text textColor="text_caption" textAlign="right" fontWeight="500">
                          {apiInfo.vaultsTvlDisplay}
                        </Text>
                        <Text h="12px" lineHeight="12px" color="primary" bg="primary_opacity.10" p="0px 8px" borderRadius="12px">
                          ∞
                        </Text>
                      </VStack>
                    }
                  />
                ) : (
                  <AumLimit
                    depositRatio={apiInfo.depositRatio}
                    hardCapUSD={apiInfo.hardCapUSD}
                    vaultTvl={apiInfo.vaultsTvl}
                    textStyle={{
                      textDecoration: 'none'
                    }}
                    value={
                      <VStack alignItems="flex-end">
                        <Text textColor="text_caption" textAlign="right" fontWeight="500">
                          {apiInfo.vaultsTvlDisplay}
                        </Text>
                        <Progress
                          h="4px"
                          w="80px"
                          value={Number(apiInfo.depositRatio)}
                          bg="primary_opacity.10"
                          sx={{
                            'div[role="progressbar"]': {
                              bg: 'primary'
                            }
                          }}
                        />
                      </VStack>
                    }
                  />
                )}
              </VStack>
            }
            labelStyle={{ fontSize: '14px' }}
            valueStyle={{ fontSize: '14px', fontWeight: '500' }}
          />
        ) : (
          <HTextLabelBox
            label="TVL"
            value={
              <Text textColor="text_caption" textAlign="right" fontWeight="500">
                {apiInfo.vaultsTvlDisplay}
              </Text>
            }
            labelStyle={{ fontSize: '14px' }}
            valueStyle={{ fontSize: '14px' }}
          />
        )}

        <HTextLabelBox
          label={
            <HStack justify="flex-end" gap="2px">
              <Text>APY</Text>
              <CetusTooltip
                placement="auto-start"
                tooltip={
                  <Text lineHeight="20px" fontSize="12px">
                    APY is estimated according to the trading fees and rewards earned over the past 7 days with daily compounding to be considered.
                  </Text>
                }
              >
                <Icon xlinkHref="#icon-icon_tips" />
              </CetusTooltip>
            </HStack>
          }
          value={
            <VaultsAprBlock
              vaultId={apiInfo?.vaultId}
              farmingTextStyle={{
                h: '20px',
                p: '4px 6px',
                fontSize: '12px'
              }}
              apyTextStyle={{
                fontSize: '14px'
              }}
            />
          }
          labelStyle={{ fontSize: '14px' }}
          valueStyle={{ fontSize: '14px', fontWeight: '500' }}
        />

        <HTextLabelBox
          label="Provider"
          value={
            <HStack gap="2px">
              <Image
                src={apiInfo?.category === 'cetus' ? '/images/cetus-logo@2x.png' : '/images/haedal-logo@2x.png'}
                w={apiInfo?.category === 'cetus' ? '20px' : '18px'}
                h={apiInfo?.category === 'cetus' ? '20px' : '18px'}
              />
              <Text color="text_caption">{apiInfo?.category === 'cetus' ? 'Cetus ' : `Haedal  ${apiInfo?.version === 'V1' ? 'v1' : 'v2'}`}</Text>
              {/* {apiInfo?.version && <VaultVersionTag version={apiInfo?.version} poolType={apiInfo?.category !== 'haevault_v2' ? 'clmm' : 'dlmm'} wrapStyle={{ bg: 'transparent', borderColor: 'white_color_opacity.20' }}/>} */}
            </HStack>
          }
          labelStyle={{ fontSize: '14px' }}
          valueStyle={{ fontSize: '14px' }}
        />
        <HTextLabelBox
          label="Earnings"
          value={<VaultsRewardsBlock rewardList={apiInfo.vaultsRewards} />}
          labelStyle={{ fontSize: '14px' }}
          valueStyle={{ fontSize: '14px' }}
        />

        <HTextLabelBox
          label="Your Holdings"
          value={<VaultsHoldings vaultId={apiInfo.vaultId} category={apiInfo.category} />}
          labelStyle={{ fontSize: '14px' }}
          valueStyle={{ fontSize: '14px', fontWeight: '500' }}
        />
      </VStack>
      <VStack w="100%" gap="8px">
        <VaultsAction
          isOpen={openExpend}
          isFrozen={apiInfo?.isFrozen}
          isMigrate={apiInfo?.migrate_target_vault !== undefined}
          jumpVaultsDetail={() => {
            jumpVaultsDetail(apiInfo.vaultId)
          }}
          onExpand={onExpand}
          status={apiInfo?.status}
        />
        {openExpend && <VaultsExpendItem apiInfo={apiInfo} logo_url={logo_url} />}
      </VStack>
    </VStack>
  )
}

export default VaultsListItemH5
