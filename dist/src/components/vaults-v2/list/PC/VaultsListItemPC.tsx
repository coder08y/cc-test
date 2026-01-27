import useCurrentVaultsFarm from '@/hooks/vaults-farming/useCurrentVaultsFarm'
import { VaultsV2ListItemType } from '@/types/vaults-v2'
import { Block, CetusTooltip } from '@cetus/design'
import { Progress, Td, Text, Tr, VStack } from '@chakra-ui/react'
import React from 'react'
import CoinPairInfo from '../../../common/CoinPairInfo'
import { AumLimit } from '../../common/AumLimit'
import { VaultsAction } from '../common/VaultsAction'
import VaultsAprBlock from '../common/VaultsAprBlock'
import { VaultsExpendItem } from '../common/VaultsExpendItem'
import VaultsHoldings from '../common/VaultsHoldings'
import { VaultsProvider } from '../common/VaultsProvider'
import VaultsRewardsBlock from '../common/VaultsRewardsBlock'

export function VaultsListItemPC<T>({
  openExpend,
  onExpand,
  apiInfo,
  logo_url,
  jumpVaultsDetail,
  isShowPowered,
  isShowAumLimit,
  currentStatus
}: VaultsV2ListItemType<T>) {
  const { isActiveVaultsFarming } = useCurrentVaultsFarm(apiInfo?.vaultId)
  console.log('0108####🚀 ~ VaultsListItemPC ~ apiInfo:', apiInfo)

  return (
    <React.Fragment key={apiInfo.vaultId}>
      <Tr
        cursor="pointer"
        h="106px"
        onClick={onExpand}
        sx={{
          td: {
            pb: '16px'
          }
        }}
      >
        <Td w="20%">
          <CoinPairInfo
            versionBlockPosition="right"
            poolInfo={{
              ...apiInfo,
              poolAddress: apiInfo?.vaultId,
              poolType: apiInfo?.category === 'haevault_v2' ? '' : apiInfo?.clmmPoolAddress.length > 0 ? 'clmm' : 'dlmm'
            }}
            // isShowPowered={isShowPowered}
            showFee={apiInfo?.category === 'haevault_v2' ? false : true}
            symbolFontSize="15px"
            isShowVaultsFarmIcon={isActiveVaultsFarming}
            showPoolTypeTag={apiInfo?.category === 'haevault_v2' ? false : true}
            type="column"
            imgStyle={apiInfo?.status === 'sunset' ? { filter: 'grayscale(100%)' } : {}}
            status={apiInfo?.status}
            currentStatus={currentStatus}
            clickFun={onExpand}
          />
        </Td>
        {isShowAumLimit ? (
          <Td textAlign="right" w="14%">
            {Number(apiInfo?.hardCapUSD) == 0 ? (
              <CetusTooltip
                tooltip=" No capacity limit "
                children={
                  <VStack gap="4px" alignItems="end">
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
          </Td>
        ) : (
          <Td textAlign="right" w="14%">
            <Text textColor="text_caption" textAlign="right" fontWeight="500">
              {apiInfo.vaultsTvlDisplay}
            </Text>
          </Td>
        )}

        <Td textAlign="right" w="10%">
          <VaultsAprBlock
            vaultId={apiInfo?.vaultId}
            wrapStyle={{
              alignItems: 'flex-end'
            }}
            farmingTextStyle={{
              h: '20px',
              p: '0 4px'
            }}
          />
        </Td>
        <Td textAlign="right" w="10%">
          <VaultsProvider category={apiInfo.category} version={apiInfo.version} />
        </Td>
        {/* 奖励 */}
        <Td textAlign="right" w="13%">
          <VaultsRewardsBlock rewardList={apiInfo.vaultsRewards} />
        </Td>

        <Td textAlign="right" w="13%">
          <VaultsHoldings vaultId={apiInfo.vaultId} category={apiInfo.category} />
        </Td>

        <Td textAlign="right" w="18%">
          <VaultsAction
            isOpen={openExpend}
            isFrozen={apiInfo?.isFrozen}
            status={apiInfo?.status}
            isMigrate={apiInfo?.migrate_target_vault !== undefined}
            jumpVaultsDetail={() => {
              jumpVaultsDetail(apiInfo.vaultId)
            }}
          />
        </Td>
      </Tr>

      {!openExpend && <Tr h="16px" />}

      <Tr
        cursor="pointer"
        position="relative"
        top="-16px"
        left="0px"
        sx={{
          td: {
            p: '0 !important',
            bg: 'transparent !important',
            border: 'none !important',
            _first: {
              borderRadius: ' 16px !important'
            },
            _last: {
              borderRadius: '0 0 16px 0 !important'
            }
          },
          _hover: {
            bg: 'transparent !important',
            td: {
              bg: 'transparent !important'
            }
          }
        }}
      >
        {openExpend && (
          <Td colSpan={7}>
            <Block p="16px" borderTop="none" borderRadius=" 0 0 16px 16px ">
              <VaultsExpendItem apiInfo={apiInfo} logo_url={logo_url} />
            </Block>
          </Td>
        )}
      </Tr>
    </React.Fragment>
  )
}
