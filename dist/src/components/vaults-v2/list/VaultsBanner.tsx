import useGetVaultsTotalEarned from '@/hooks/vault-v2/useGetVaultsTotalEarned'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import { CetusTooltip } from '@cetus/design'
import { useInterval } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { VAULT_FILTER } from '@cetus/types/src/env'
import { Icon } from '@cetus/ui-kit'
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect } from 'react'

export function VaultsBanner() {
  // 总质押
  const { vaultsTotalTvlDisplay, vaultsTotalEarnedDisplay } = useVaultsListV2Store()
  const { isApp } = useWindowWidth()
  const { getVaultsTotalEarned } = useGetVaultsTotalEarned()

  // 第一次进入时立即查询一次
  useEffect(() => {
    getVaultsTotalEarned()
  }, [])

  // 每分钟轮询一次
  useInterval({
    interval: 60000, // 60秒 = 1分钟
    callback: () => {
      getVaultsTotalEarned()
    }
  })
  return (
    <VStack
      w="100%"
      pos="absolute"
      alignItems="start"
      bgColor="#000"
      backgroundImage={{ base: "url('/images/vaults_h5.png')", lg: "url('/images/vaults.png')" }}
      backgroundSize="cover"
      backgroundPosition="center"
      backgroundRepeat="no-repeat"
      backdropFilter="blur(20px)"
      h={{ base: '260px', lg: '240px' }}
    >
      <VStack
        minW={{ base: '100%', lg: '1200px' }}
        p={{ base: '20px 16px 0', lg: '40px 20px 0' }}
        margin="0px auto"
        gap="10px"
        alignItems="start"
        h="100%"
      >
        <HStack w="100%" justify="space-between">
          <Text color="text_caption" fontSize="28px" fontWeight="500">
            Vaults
          </Text>
        </HStack>
        <Text fontSize="16px" whiteSpace="wrap" lineHeight="20px">
          Automate your liquidity to enjoy high yield with ease.&nbsp;
          {isApp && (
            <HStack
              onClick={() => {
                window.open(
                  'https://medium.com/@CetusProtocol/cetus-vaults-automate-your-liquidity-to-earn-high-yield-with-ease-ed655e68122e',
                  '_blank'
                )
              }}
              display={{ base: 'inline-flex', lg: 'flex' }}
              _hover={{
                p: { color: 'primary' },
                svg: { fill: 'primary' }
              }}
            >
              <Text fontSize="16px" cursor="pointer">
                Details
              </Text>
              <Icon xlinkHref="#icon-icon_link3" svgHover="primary" fontSize="16px" />
            </HStack>
          )}
        </Text>
        {!isApp && (
          <HStack
            onClick={() => {
              window.open(
                'https://medium.com/@CetusProtocol/cetus-vaults-automate-your-liquidity-to-earn-high-yield-with-ease-ed655e68122e',
                '_blank'
              )
            }}
            display={{ base: 'inline-flex', lg: 'flex' }}
            _hover={{
              p: { color: 'primary' },
              svg: { fill: 'primary' }
            }}
          >
            <Text fontSize="16px" cursor="pointer">
              Details
            </Text>
            <Icon xlinkHref="#icon-icon_link3" svgHover="primary" fontSize="16px" />
          </HStack>
        )}

        <HStack gap="40px">
          <VStack align="flex-start" gap="8px">
            <HStack gap="4px" justify="flex-start" align="center" mt="20px" h="16px">
              <Text color="text_caption" fontSize="14px">
                Total Value Locked
              </Text>
            </HStack>

            <Skeleton isLoaded={!!vaultsTotalTvlDisplay}>
              <Text fontWeight="600" color="primary" fontSize="20px" mt="3px">
                {vaultsTotalTvlDisplay}
              </Text>
            </Skeleton>
          </VStack>
          {/* toDo: 线上隐藏 */}
          {!VAULT_FILTER && (
            <VStack align="flex-start" gap="8px" mt="20px">
              <CetusTooltip
                tooltip={
                  <Text lineHeight="20px" fontSize="12px">
                    Total user yield from vault earnings (after performance fees) plus additional LP rewards from Haedal.
                  </Text>
                }
                placement="top"
              >
                <HStack gap="4px" justify="flex-start" align="center" h="16px">
                  <Text color="text_caption" fontSize="14px">
                    Total Yield
                  </Text>
                  <Icon xlinkHref="#icon-icon_tips" fontSize="18px" />
                </HStack>
              </CetusTooltip>

              <Skeleton isLoaded={!!vaultsTotalEarnedDisplay}>
                <Text fontWeight="600" color="primary" fontSize="20px" mt="3px">
                  {vaultsTotalEarnedDisplay}
                </Text>
              </Skeleton>
            </VStack>
          )}
        </HStack>
      </VStack>
    </VStack>
  )
}
