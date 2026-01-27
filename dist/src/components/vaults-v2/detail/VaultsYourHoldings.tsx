import useGetVaultDailyYield from '@/hooks/vault-v2/chart/useGetVaultDailyYield'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import { CetusTooltip } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'

import { HTextLabelBox, Icon, VTextLabelBox } from '@cetus/ui-kit'
import { d, formatCurrency, formatNumber, removeComma, symbolDataDisplayProcessing } from '@cetus/utils'
import { Box, HStack, Menu, MenuButton, MenuList, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

export default function VaultsYourHoldings({
  balanceDisplay,
  totalHolding,
  sharePoolRate,
  apiVaultInfo,
  holdCoinAmounts,
  holdCoinAValue,
  holdCoinBValue,
  isNotMatch,
  posVaultId
}: {
  balanceDisplay: string
  totalHolding: string
  sharePoolRate: string
  apiVaultInfo: any
  holdCoinAmounts: {
    displayCoinA: string
    displayCoinB: string
  }
  holdCoinAValue: string | undefined
  holdCoinBValue: string | undefined
  isNotMatch: boolean
  posVaultId?: string
}) {
  const { displayTokenA, displayTokenB } = apiVaultInfo || {}
  const { displayCoinA, displayCoinB } = holdCoinAmounts || { displayCoinA: '', displayCoinB: '' }
  const [isOpen, setIsOpen] = useState(false)

  const { getVaultDailyYield } = useGetVaultDailyYield()
  const [dailyYieldPerLp, setDailyYieldPerLp] = useState<any>(null)
  const [dailyYieldLoading, setDailyYieldLoading] = useState(false)
  const [dailyYield, setDailyYield] = useState<string>('-')
  const { currentVaultPositionLoading, setDailyYieldPerLpMap } = useVaultsPositionStore()

  const getVaultDailyYieldData = async () => {
    try {
      setDailyYieldLoading(true)
      const vaultId = apiVaultInfo?.vaultId
      const res = await getVaultDailyYield(apiVaultInfo?.vaultId, apiVaultInfo?.category)
      setDailyYieldPerLpMap(vaultId, Number(res))
      setDailyYieldPerLp({
        value: Number(res),
        vaultId
      })
    } catch (error) {
      setDailyYieldPerLp(null)
    }
  }

  useEffect(() => {
    if (apiVaultInfo?.vaultId && posVaultId && posVaultId === apiVaultInfo?.vaultId) {
      setDailyYieldPerLp(null)
      getVaultDailyYieldData()
    }
  }, [apiVaultInfo?.vaultId, posVaultId])

  useEffect(() => {
    const originalBalanceDisplay = removeComma(balanceDisplay)
    if (posVaultId == dailyYieldPerLp?.vaultId && dailyYieldPerLp?.value && originalBalanceDisplay && !currentVaultPositionLoading) {
      const tempDailyYield = `+ ${symbolDataDisplayProcessing(
        d(dailyYieldPerLp?.value || 0)
          .mul(originalBalanceDisplay || 0)
          .toString(),
        '$',
        2
      )}`
      setDailyYield(tempDailyYield)
      setDailyYieldLoading(false)
    } else {
      setDailyYield('-')
      setDailyYieldLoading(false)
    }
  }, [dailyYieldPerLp, balanceDisplay, currentVaultPositionLoading, posVaultId, dailyYieldPerLp?.vaultId])

  const { isApp } = useWindowWidth()

  const isShowDailyYield = useMemo(() => {
    // return (VAULT_FILTER ? false : dailyYield !== '-' && dailyYield !== '+ $0') && Number(balanceDisplay) > 0
    return dailyYield !== '-' && dailyYield !== '+ $0' && Number(removeComma(balanceDisplay)) > 0
    // return false
  }, [dailyYield])

  return (
    <Menu isOpen={isOpen} onClose={() => setIsOpen(false)} placement="bottom" preventOverflow={false}>
      <MenuButton
        onClick={() => setIsOpen(!isOpen)}
        bg="none"
        w="100%"
        sx={{
          span: {
            pointerEvents: 'unset'
          }
        }}
      >
        <HStack
          bg="card_bg"
          w={{ base: '100%', lg: '460px' }}
          borderRadius="16px"
          p="16px"
          justifyContent="space-between"
          position="relative"
          h={{
            lg: apiVaultInfo?.category == 'cetus' ? '80px' : 'auto'
          }}
        >
          <HStack
            w="100%"
            justifyContent="space-between"
            flexDirection={{ base: 'column', lg: 'row' }}
            alignItems={{ base: 'flex-start', lg: 'center' }}
            gap={{ base: '12px', lg: '8px' }}
          >
            <HStack justifyContent="space-between" w="100%">
              <VTextLabelBox
                title="Your Holdings"
                value={currentVaultPositionLoading || isNotMatch ? <Skeleton w="100px" h="20px" /> : balanceDisplay ? totalHolding : '0'}
                wrapStyle={{
                  gap: '12px'
                }}
                valueStyle={{ fontSize: '16px' }}
              />
              {isApp && (
                <Icon
                  xlinkHref="#icon-icon_arrow"
                  svgW="12px"
                  svgH="12px"
                  transition="transform 0.5s"
                  transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                />
              )}
            </HStack>
            {isShowDailyYield && <Box w={{ base: '100%', lg: '0px' }} h={{ base: '1px', lg: '0px' }} bg="border" />}

            {(isShowDailyYield || !isApp) && (
              <HStack gap="8px" w={{ base: '100%' }} justifyContent={isShowDailyYield ? 'space-between' : 'flex-end'}>
                {isShowDailyYield && (
                  <VTextLabelBox
                    title={
                      <HStack gap="2px">
                        <CetusTooltip
                          placement="top"
                          tooltip={
                            <Text fontSize="12px" lineHeight="20px">
                              Estimated based on the vault's performance over the past 24 hours. It includes vault yields in fee earnings plus mining
                              & farming rewards, with performance fees deducted.
                            </Text>
                          }
                          children={
                            <Text fontSize="12px" color="primary_gray" textDecoration="underline dotted" textDecorationColor="primary_gray">
                              Est. Daily Yield
                            </Text>
                          }
                        />
                      </HStack>
                    }
                    value={
                      <HStack>
                        {currentVaultPositionLoading || dailyYieldLoading || isNotMatch ? (
                          <Skeleton w="100px" h="20px" />
                        ) : (
                          <Text color="primary_green">{dailyYield ? dailyYield : '-'}</Text>
                        )}
                      </HStack>
                    }
                    wrapStyle={{
                      gap: { base: '12px', lg: '6px' },
                      w: '100%',
                      flexDirection: { base: 'row', lg: 'column' },
                      alignItems: { base: 'center', lg: 'flex-end' },
                      justifyContent: { base: 'space-between', lg: 'space-between' }
                    }}
                    valueStyle={{ fontSize: '18px', color: 'primary_green' }}
                  />
                )}

                {!isApp && (
                  <Icon
                    xlinkHref="#icon-icon_arrow"
                    svgW="12px"
                    svgH="12px"
                    transition="transform 0.5s"
                    transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                  />
                )}
              </HStack>
            )}
          </HStack>
        </HStack>
      </MenuButton>
      <MenuList w={{ base: 'calc(100vw - 20px)', lg: '460px' }} bg="card_bg" p="16px" borderRadius="16px">
        <VStack w="100%" gap="12px">
          <HStack w="100%" justifyContent="space-between">
            <Text fontSize="16px" color="text_caption">
              {currentVaultPositionLoading ? <Skeleton w="100px" h="20px" /> : balanceDisplay ? `${balanceDisplay} LP` : '- LP'}
            </Text>
            <HTextLabelBox
              label="Your share"
              value={currentVaultPositionLoading ? <Skeleton w="100px" h="20px" /> : sharePoolRate ? `${sharePoolRate}` : '-'}
              wrapStyle={{ justifyContent: 'flex-start', width: 'auto' }}
            />
          </HStack>
          <HStack w="100%" justifyContent="space-between" bg="primary_opacity.10" p="8px 0px" borderRadius="16px">
            <VStack alignItems="center" flex="1">
              <HStack>
                <SingleTokenInfo token={displayTokenA} haveName={false} haveSymbol={false} imgBoxStyle={{ w: '20px', h: '20px' }} />
                <Text color="text_caption">{displayTokenA?.symbol}</Text>
              </HStack>
              {currentVaultPositionLoading ? (
                <Skeleton w="100px" h="20px" />
              ) : (
                <HStack gap="4px">
                  <Text color="text_caption">{formatNumber(displayCoinA, displayTokenA?.decimals)}</Text>
                  <Text fontSize="12px" color="primary_gray">
                    {displayTokenA?.symbol}
                  </Text>
                </HStack>
              )}
              <Text fontSize="12px" color="primary_gray">
                {currentVaultPositionLoading ? <Skeleton w="100px" h="20px" /> : formatCurrency(holdCoinAValue, 2)}
              </Text>
            </VStack>
            <Box w="1px" h="35px" bg="card_bg" />
            <VStack alignItems="center" flex="1">
              <HStack>
                <SingleTokenInfo token={displayTokenB} haveName={false} haveSymbol={false} imgBoxStyle={{ w: '20px', h: '20px' }} />
                <Text color="text_caption">{displayTokenB?.symbol}</Text>
              </HStack>
              {currentVaultPositionLoading ? (
                <Skeleton w="100px" h="20px" />
              ) : (
                <HStack gap="4px">
                  <Text color="text_caption">{formatNumber(displayCoinB, displayTokenB?.decimals)}</Text>
                  <Text fontSize="12px" color="primary_gray">
                    {displayTokenB?.symbol}
                  </Text>
                </HStack>
              )}
              <Text fontSize="12px" color="primary_gray">
                {currentVaultPositionLoading ? <Skeleton w="100px" h="20px" /> : formatCurrency(holdCoinBValue, 2)}
              </Text>
            </VStack>
          </HStack>
        </VStack>
      </MenuList>
    </Menu>
  )
}
