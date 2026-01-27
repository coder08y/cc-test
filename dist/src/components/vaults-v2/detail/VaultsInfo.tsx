import { VaultV2ApiInfo } from '@/types/vaults-v2'
import { AddressCopyLink } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { VTextLabelBox } from '@cetus/ui-kit'
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'

export default function VaultsInfo({ apiVaultInfo, lpTokenInfo }: { apiVaultInfo: VaultV2ApiInfo; lpTokenInfo: Token }) {
  const { getExplorerUrl } = useExplorer()
  const { isApp } = useWindowWidth()

  return (
    <VStack w="100%" bg="bg_secondary" borderRadius="16px" p="20px 16px" gap="0" align="flex-start">
      <Text fontSize="16px" color="text_caption">
        Vault Info
      </Text>
      <HStack w="100%" gap={{ base: '14px', lg: '100px' }} mt="16px" flexDirection={{ base: 'column', lg: 'row' }}>
        <VTextLabelBox
          title="Vault Address"
          value={
            apiVaultInfo?.vaultId ? (
              <AddressCopyLink
                fontSize={{ base: '12px', lg: '14px' }}
                color="text_caption"
                showLink={isApp}
                address={apiVaultInfo?.vaultId || ''}
                onClickLink={() => {
                  window.open(getExplorerUrl(apiVaultInfo?.vaultId, 'poolAddress'), '_blank')
                }}
              />
            ) : (
              <Skeleton w="100px" h="16px" />
            )
          }
          wrapStyle={{
            gap: '12px',
            flexDirection: { base: 'row', lg: 'column' },
            alignItems: { base: 'center', lg: 'flex-start' },
            w: { base: '100%', lg: 'unset' },
            justifyContent: 'space-between'
          }}
          titleStyle={{ fontSize: '12px', color: 'primary_gray' }}
        />
        <VTextLabelBox
          title="LP Token"
          value={
            lpTokenInfo ? (
              <HStack>
                <SingleTokenInfo
                  token={lpTokenInfo}
                  haveName={false}
                  haveSymbol={false}
                  symbolFontSize="12px"
                  warningIcon={{ isNeedShow: false }}
                  imgBoxStyle={{ w: '20px', h: '20px' }}
                />
                <AddressCopyLink
                  fontSize={{ base: '12px', lg: '14px' }}
                  color="text_caption"
                  showLink={isApp}
                  address={apiVaultInfo?.lpTokenType || ''}
                  onClickLink={() => {
                    window.open(getExplorerUrl(apiVaultInfo?.lpTokenType, 'coin'), '_blank')
                  }}
                />
              </HStack>
            ) : (
              <Skeleton w="100px" h="16px" />
            )
          }
          wrapStyle={{
            gap: '12px',
            flexDirection: { base: 'row', lg: 'column' },
            alignItems: { base: 'center', lg: 'flex-start' },
            w: { base: '100%', lg: 'unset' },
            justifyContent: 'space-between'
          }}
          titleStyle={{ fontSize: '12px', color: 'primary_gray' }}
        />
      </HStack>
    </VStack>
  )
}
