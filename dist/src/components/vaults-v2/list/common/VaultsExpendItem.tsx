import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import { VaultV2ApiInfo } from '@/types/vaults-v2'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { HTextLabelBox, Icon, NoData, SingleCoinImage, VTextLabelBox } from '@cetus/ui-kit'
import { formatNumber } from '@cetus/utils'
import { Button, Center, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

type VaultsExpendItemProps = {
  apiInfo: VaultV2ApiInfo
  logo_url?: string
}

export function VaultsExpendItem(props: VaultsExpendItemProps) {
  const { apiInfo, logo_url } = props
  const navigate = useNavigate()
  const { currentAccount, onWalletModal } = useAccountStore()
  const { isApp } = useWindowWidth()

  const { vaultsPositionObj } = useVaultsPositionStore()
  const vaultsPosition = useMemo(() => {
    return vaultsPositionObj[apiInfo?.vaultId]
  }, [JSON.stringify(vaultsPositionObj), apiInfo?.vaultId])

  if (!currentAccount) {
    return (
      <NoData
        type="nowallet"
        onboard={() => {
          onWalletModal(true)
        }}
      />
    )
  }

  return (
    <Stack
      flexDir={{ base: 'column', lg: 'row' }}
      bg="bg_primary"
      w="100%"
      gap="16px"
      borderRadius={{ base: '8px', lg: '20px' }}
      border="1px solid"
      borderColor="border"
      p={{ base: '8px', lg: '10px 52px 10px 16px' }}
      cursor="pointer"
      justifyContent={{ base: 'center', lg: 'space-between' }}
      onClick={() => {
        if (!apiInfo?.isFrozen) {
          navigate(`/vaults/${apiInfo?.vaultId}`)
        }
      }}
    >
      <HStack gap="15px">
        <SingleCoinImage imageUrl={logo_url} imgBoxStyle={{ w: '60px', h: '60px' }} />
        <VStack gap="4px" alignItems="start">
          <Text color="primary_gray">Your LP tokens</Text>
          {/** 由于当前数据较低，先隐藏icon */}
          <Text color="text_caption">{`${vaultsPosition?.balanceDisplay || '--'} LP`}</Text>
          {/* <CetusTooltip
            tooltip={
              <VStack gap="8px" cursor="pointer" alignItems="start">
                <Text fontSize="12px" lineHeight="20px">
                  Your estimated daily earnings to be compounded according to recent vault performance.
                </Text>
                {rewardPerA && rewardPerB && (
                  <Text fontSize="14px" color="text_caption">
                    {`${rewardPerA} + ${rewardPerB}`}
                  </Text>
                )}
              </VStack>
            }
          >
            <HStack gap="8px" cursor="pointer">
              <Text color="text_caption">{`${balanceDisplay || '0'} LP`}</Text>
              <Image src="/images/icon_apr@2x.png" w="24px" h="24px" />
            </HStack>
          </CetusTooltip> */}
        </VStack>
      </HStack>

      <Stack flexDir={{ base: 'column', lg: 'row' }} gap={{ base: '16px', lg: '8px' }}>
        {isApp ? (
          <>
            <HTextLabelBox
              label="Pooled assets"
              labelStyle={{ fontSize: '14px' }}
              valueStyle={{ fontSize: '14px' }}
              value={
                <Stack gap={{ base: '4px', lg: '12px' }} flexDir={{ base: 'column', lg: 'row' }} align={{ base: 'flex-end', lg: 'center' }}>
                  <HStack gap="4px">
                    <SingleCoinImage imageUrl={apiInfo.displayTokenA.logo_url} imgBoxStyle={{ w: '20px', h: '20px' }} />
                    <Text color="text_caption">{vaultsPosition?.displayAmountA ? formatNumber(vaultsPosition?.displayAmountA) : '--'}</Text>
                    <Text color="text_caption">{apiInfo?.displayTokenA?.symbol}</Text>
                  </HStack>
                  <HStack gap="4px">
                    <SingleCoinImage imageUrl={apiInfo.displayTokenB.logo_url} imgBoxStyle={{ w: '20px', h: '20px' }} />
                    <Text color="text_caption">{vaultsPosition?.displayAmountB ? formatNumber(vaultsPosition?.displayAmountB) : '--'}</Text>
                    <Text color="text_caption">{apiInfo?.displayTokenB?.symbol}</Text>
                  </HStack>
                </Stack>
              }
            />
            <HTextLabelBox
              label="Share of pool"
              labelStyle={{ fontSize: '14px' }}
              valueStyle={{ fontSize: '14px' }}
              value={vaultsPosition?.shartOfPoolDisplay || '--'}
            />
            <Button variant="outline" h="32px" gap="0px" display="flex" justifyContent="center" alignItems="center" borderRadius="4px">
              <Text color="primary_gray">Details</Text>
              {/* <Block borderRadius="4px" p="0px" bg="rgb(118,200,255,0.1)" w="fit-content">
                <Center w="20px" h="20px">
                  <Icon svgW="16px" xlinkHref="#icon-icon_arrow" variant="gray" transition="transform 0.5s" transform="rotate(-90deg)" />
                </Center>
              </Block> */}
              <Icon xlinkHref="#icon-icon_descending_nor" transform="rotate(270deg)" fontSize="20px" />
            </Button>
          </>
        ) : (
          <>
            <Center mr="90px">
              <VTextLabelBox
                wrapStyle={{
                  gap: '4px',
                  alignItems: 'end'
                }}
                title="Pooled assets"
                titleStyle={{
                  color: 'primary_gray'
                }}
                value={
                  <HStack gap="4px">
                    <SingleCoinImage imageUrl={apiInfo.displayTokenA.logo_url} imgBoxStyle={{ w: '20px', h: '20px' }} />
                    <Text color="text_caption">{vaultsPosition?.displayAmountA ? formatNumber(vaultsPosition?.displayAmountA) : '--'}</Text>
                    <Text color="text_caption" mr="8px">
                      {apiInfo?.displayTokenA?.symbol}
                    </Text>

                    <SingleCoinImage imageUrl={apiInfo.displayTokenB.logo_url} imgBoxStyle={{ w: '20px', h: '20px' }} />
                    <Text color="text_caption">{vaultsPosition?.displayAmountB ? formatNumber(vaultsPosition?.displayAmountB) : '--'}</Text>
                    <Text color="text_caption">{apiInfo?.displayTokenB?.symbol}</Text>
                  </HStack>
                }
              />
            </Center>
            <Center mr="80px">
              <VTextLabelBox
                wrapStyle={{
                  gap: '4px',
                  alignItems: 'end'
                }}
                title="Share of pool"
                titleStyle={{
                  color: 'primary_gray'
                }}
                value={vaultsPosition?.shartOfPoolDisplay || '--'}
              />
            </Center>
            <HStack gap="0px">
              <Text color="primary_gray">Details</Text>
              {/* <Block borderRadius="4px" p="0px" bg="rgb(118,200,255,0.1)"> */}
              {/* <Center w="20px" h="20px"> */}
              {/* <Icon svgW="16px" xlinkHref="#icon-icon-left" variant="gray" transition="transform 0.5s" transform="rotate(-90deg)" /> */}
              <Icon xlinkHref="#icon-icon_descending_nor" transform="rotate(270deg)" fontSize="20px" />

              {/* </Center> */}
              {/* </Block> */}
            </HStack>
          </>
        )}
      </Stack>
    </Stack>
  )
}
