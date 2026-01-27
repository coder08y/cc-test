import { CetusTooltip } from '@cetus/design'
import { HTextLabelBox, Icon } from '@cetus/ui-kit'
import { abbreviateTokenName, formatNumber } from '@cetus/utils'
import { HStack, Menu, MenuButton, MenuItem, MenuList, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'

interface FeeBlockProps {
  currentDeepBookPool: any
  currentOrderType: 'Market' | 'Limit'
  tradeType: string
  takerFeeDisplay: string
  makerFeeDisplay: string
  feeType: string
  maxFeeIsLoading: boolean
  isLoading?: boolean
  payWithDeep: boolean
  setPayWithDeep: (payWithDeep: boolean) => void
  askList: any[]
  bidList: any[]
}

export default function FeeBlock({
  currentDeepBookPool,
  currentOrderType,
  tradeType,
  takerFeeDisplay,
  makerFeeDisplay,
  feeType,
  maxFeeIsLoading,
  isLoading = false,
  payWithDeep,
  setPayWithDeep,
  askList,
  bidList
}: FeeBlockProps) {
  const multiplier = useMemo(() => {
    return !payWithDeep ? 1.25 : 1
  }, [payWithDeep])

  const makerFee = useMemo(() => {
    return currentDeepBookPool?.makerFeeRate || 0
  }, [currentDeepBookPool?.makerFeeRate])

  const takerFee = useMemo(() => {
    return currentDeepBookPool?.takerFeeRate || 0
  }, [currentDeepBookPool?.takerFeeRate])

  const takerFeePercentage = useMemo(() => {
    return (takerFee / 1000000000) * multiplier * 100
  }, [takerFee, multiplier])

  const makerFeePercentage = useMemo(() => {
    return (makerFee / 1000000000) * multiplier * 100
  }, [makerFee, multiplier])

  const shouldShowBothFees = useMemo(() => {
    return currentOrderType == 'Limit' || (currentOrderType == 'Market' && bidList.length == 0 && askList.length == 0)
  }, [currentOrderType, bidList.length, askList.length])

  return (
    <HTextLabelBox
      label={
        <HStack gap="2px">
          <Text fontSize={'12px'}>Fee</Text>
          <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
        </HStack>
      }
      labelStyle={{
        textDecoration: 'unset'
      }}
      value={
        <>
          <HStack whiteSpace="nowrap" w="100%" gap="0">
            <CetusTooltip
              placement="top-end"
              tooltip={
                shouldShowBothFees ? (
                  <VStack bg="bg_secondary" borderRadius="8px" align="flex-start" gap="4px">
                    <Text color={'text_caption'} fontWeight={'500'} fontSize="12px" mb="4px">
                      Trading Fee
                    </Text>
                    <Text fontSize="12px" color={'text_paragraph'} lineHeight="16px">
                      Taker：{currentDeepBookPool?.inWhiteList ? `0%` : `${formatNumber(takerFeePercentage, 4)}%`} fee
                    </Text>
                    <Text fontSize="12px" color={'text_paragraph'} lineHeight="16px">
                      {/* 原来的硬编码费率 */}
                      Maker：{currentDeepBookPool?.inWhiteList ? `0%` : `${formatNumber(makerFeePercentage, 4)}%`} fee
                    </Text>
                  </VStack>
                ) : (
                  <VStack bg="bg_secondary" borderRadius="8px" align="flex-start" gap="4px">
                    <Text fontSize="12px" lineHeight="16px">
                      Trading Fee: {currentDeepBookPool?.inWhiteList ? `0%` : `${formatNumber(takerFeePercentage, 4)}%`} (Taker)
                    </Text>
                  </VStack>
                )
              }
            >
              <Text fontSize={'12px'} color={'text_caption'} textDecoration={'underline dotted'} cursor={'pointer'}>
                {(() => {
                  // 如果用户选择用 DEEP 支付手续费，显示 DEEP
                  // 否则根据交易类型：Buy 使用 quoteAssets，Sell 使用 baseAssets
                  const feeSymbol = payWithDeep
                    ? 'DEEP'
                    : tradeType.includes('Buy')
                      ? abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol)
                      : abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol)

                  // 根据 shouldShowBothFees 决定显示格式
                  if (currentDeepBookPool?.inWhiteList) {
                    return shouldShowBothFees ? `0 / 0 ${feeSymbol}` : `0 ${feeSymbol}`
                  }
                  return shouldShowBothFees
                    ? `${formatNumber(takerFeeDisplay, 6)} / ${formatNumber(makerFeeDisplay, 6)} ${feeSymbol}`
                    : `${formatNumber(takerFeeDisplay, 6)} ${feeSymbol}`
                })()}
              </Text>
            </CetusTooltip>

            {currentDeepBookPool?.priceStatus ? (
              <Menu>
                {({ isOpen, onClose }) => (
                  <>
                    <MenuButton>
                      <Icon
                        xlinkHref="#icon-icon_descending"
                        svgW="20px"
                        svgH="20px"
                        sx={{
                          position: 'relative',
                          top: isOpen ? '2px' : '-3px',
                          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                      />
                    </MenuButton>
                    <MenuList bg="bg_secondary" borderRadius="8px" p="4px" minW="76px" display={'flex'} flexDirection={'column'} gap={'4px'}>
                      {[
                        {
                          label: tradeType.includes('Buy')
                            ? abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol)
                            : abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol),
                          value: false
                        },
                        { label: 'DEEP', value: true }
                      ]
                        .filter((item, index, self) => {
                          // 过滤重复的 token，如果 label 相同则只保留第一个
                          return self.findIndex(i => i.label === item.label) === index
                        })
                        .map(item => (
                          <MenuItem
                            p="4px 16px"
                            textAlign="center"
                            borderRadius="4px"
                            sx={{
                              bg: payWithDeep === item.value ? 'primary_opacity.10' : 'none',
                              '& p': {
                                color: payWithDeep === item.value ? 'primary' : 'text_caption'
                              },
                              _hover: {
                                bg: 'primary_opacity.10',
                                '& p': {
                                  color: 'primary'
                                }
                              }
                            }}
                            onClick={() => {
                              // console.log('🚀🚀🚀 ~ onClick ~ item.value:', item)
                              setPayWithDeep(item.value)
                            }}
                            key={`db-fee-${item.label}`}
                          >
                            <Text fontSize="12px">{item.label}</Text>
                          </MenuItem>
                        ))}
                    </MenuList>
                  </>
                )}
              </Menu>
            ) : null}
          </HStack>
        </>
      }
      valueStyle={{ fontSize: '14px' }}
      leftTooltip={
        !currentDeepBookPool.priceStatus ? (
          'Estimated maximum fee for this transaction'
        ) : (
          <HStack flexDirection={'column'} gap={'0'} fontSize={'12px'} alignItems={'flex-start'}>
            <Text fontSize={'12px'}>Estimated maximum fee for this transaction.</Text>
            <Text fontSize={'12px'}>
              You can choose how trading fees are paid: in{' '}
              <Text fontSize="12px" color="text_caption" as={'span'}>
                DEEP{' '}
              </Text>
              or
              <Text fontSize="12px" color="text_caption" whiteSpace="nowrap" as={'span'}>
                {' '}
                input token{' '}
              </Text>
              .
            </Text>
            <Text fontSize={'12px'}>Paying in DEEP is always cheaper</Text>
          </HStack>
        )
      }
      wrapStyle={{ h: '14px', lineHeight: '14px' }}
    />
  )
}
