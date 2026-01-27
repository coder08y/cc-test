import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { DeepBookPoolMarginTabs } from '@/types/deepbook'
import { CetusTooltip } from '@cetus/design'
import { useAccountStore } from '@cetus/stores'
import { HTextLabelBox, Icon, NumericFormatInput, SingleCoinImage } from '@cetus/ui-kit'
import { d, formatNumber, formatNumberWithKMB, formatUSDPrice } from '@cetus/utils'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import InputBlockGroup, { InputBlockProps } from '../InputBlockGroup'
interface MarginTradeAmountBlockProps {
  from: InputBlockProps
  to: InputBlockProps
  isShowOrderVolumeError: boolean
  currentDeepBookPool: any
  orderType: 'Market' | 'Limit'
  available: string
  availableSymbol?: string
  availableUSD?: string
  tradeType: DeepBookPoolMarginTabs
  price: string
  maxFee: string
  maxAmount?: string
  total: string | undefined
  estTotalUsd?: string
  estValue?: string
  setEstValue?: (value: string) => void
  handleEstValueChange?: (value: string) => void
  isEditingEstValue?: boolean
  setIsEditingEstValue?: (value: boolean) => void
}

export default function MarginTradeAmountBlock({
  from,
  to,
  isShowOrderVolumeError,
  currentDeepBookPool,
  orderType,
  available,
  availableSymbol,
  availableUSD,
  tradeType,
  price,
  maxFee,
  maxAmount,
  total,
  estTotalUsd,
  estValue,
  setEstValue,
  handleEstValueChange,
  isEditingEstValue,
  setIsEditingEstValue
}: MarginTradeAmountBlockProps) {
  const { currentAccount, onWalletModal } = useAccountStore()
  const { marginManagerByAccount } = useMarginStore()
  const openAssetsActionModal = useDeepBookStore(state => state.openAssetsActionModal)

  // 获取当前池子的 managerId
  const managerId = useMarginStore((state: any) => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return ''
    }
    const marginManagerByAccount = state.marginManagerByAccount
    const selectedManagerInfo = state.getCurrentMarginManagerInfo(currentAccount.address)

    // 优先使用用户选择的 manager
    if (selectedManagerInfo?.margin_manager_id && currentDeepBookPool.address) {
      const selectedManager = (marginManagerByAccount as any[])?.find(
        (m: any) => m?.margin_manager_id === selectedManagerInfo.margin_manager_id && m?.deepbook_pool_id === currentDeepBookPool.address
      )
      if (selectedManager) {
        return selectedManagerInfo.margin_manager_id
      }
    }

    // 如果没有选择的 manager 或选择的 manager 不属于当前池子，则按 pool_id 查找
    const marginManager = (marginManagerByAccount as any[])?.find((m: any) => m?.deepbook_pool_id === currentDeepBookPool.address)
    return marginManager?.margin_manager_id || ''
  })

  // 从 store 读取 balance 数据（使用 props 中的 currentDeepBookPool）
  const balanceData = useMarginStore((state: any) => {
    if (!currentAccount?.address || !currentDeepBookPool?.address) {
      return state.getMarginBalanceData('', '', '')
    }
    return state.getMarginBalanceData(currentAccount.address, currentDeepBookPool.address, managerId)
  })

  // 从 store 数据中提取需要的值
  const baseFreeBalance = balanceData.baseFreeBalance
  const quoteFreeBalance = balanceData.quoteFreeBalance
  const baseMarginBalanceUSD = balanceData.baseMarginBalanceUSD
  const quoteMarginBalanceUSD = balanceData.quoteMarginBalanceUSD
  const basePrice = balanceData.basePrice
  const quotePrice = balanceData.quotePrice

  // console.log('[available]', available)

  // 检查是否为初始状态（没有 margin manager）
  const isInitialState = useMemo(() => {
    if (!currentDeepBookPool?.address || !marginManagerByAccount) {
      return true
    }
    return !marginManagerByAccount.some((m: any) => m?.deepbook_pool_id === currentDeepBookPool.address)
  }, [currentDeepBookPool?.address, marginManagerByAccount])

  // 获取默认 token（初始状态时优先使用 quoteAssets）
  const defaultToken = useMemo(() => {
    return currentDeepBookPool?.quoteAssets || currentDeepBookPool?.baseAssets
  }, [currentDeepBookPool])

  // 准备抵押品数据
  const collateralItem = useMemo(() => {
    // Long 展示 quote，Short 展示 base
    if (tradeType === DeepBookPoolMarginTabs.Long) {
      return {
        balance: quoteFreeBalance || '0',
        balanceUSD: quoteMarginBalanceUSD || '0',
        iconUrl: currentDeepBookPool?.quoteAssets?.icon_url,
        symbol: currentDeepBookPool?.quoteAssets?.symbol || '',
        decimals: currentDeepBookPool?.quoteAssets?.decimals
      }
    } else {
      return {
        balance: baseFreeBalance || '0',
        balanceUSD: baseMarginBalanceUSD || '0',
        iconUrl: currentDeepBookPool?.baseAssets?.icon_url,
        symbol: currentDeepBookPool?.baseAssets?.symbol || '',
        decimals: currentDeepBookPool?.baseAssets?.decimals
      }
    }
  }, [tradeType, baseFreeBalance, quoteFreeBalance, baseMarginBalanceUSD, quoteMarginBalanceUSD, currentDeepBookPool])

  // 计算限价单的 maxAvailable
  // 对于限价单，基于 availableUSD 和用户输入的限价 price 计算最大可输入的 base token 数量
  // 对于市价单，使用 available（token 数量）
  const maxAvailableForInput = useMemo(() => {
    // 限价单时需要根据价格计算
    if (orderType === 'Limit') {
      if (tradeType === DeepBookPoolMarginTabs.Long) {
        // Long 限价单：基于 availableUSD 计算 quote token 数量（InputBlockGroup 会使用 price 转换为 base token 数量）
        // 需要 availableUSD、quotePrice 和 price 都有效
        if (!availableUSD || !quotePrice || !price || d(availableUSD).lte(0) || d(quotePrice).lte(0) || d(price).lte(0)) {
          return available || '0'
        }
        // maxAvailable = availableUSD / quotePrice（quote token 数量）
        // InputBlockGroup 会使用用户输入的 price（限价，base/quote 价格）将其转换为 base token 数量
        // 最终能买到的 base token 数量 = (availableUSD / quotePrice) / price = availableUSD / (price × quotePrice)
        // 这与验证逻辑一致：estTotalUsd = amount × price × quotePrice，所以 amount ≤ availableUSD / (price × quotePrice)
        const result = d(availableUSD).div(d(quotePrice)).toString()
        return result
      } else {
        // Short 限价单：直接使用 maxAmount（base token 数量）
        // 因为 Short 订单支付的是 base token，所以最大可卖数量就是 available（base token 数量），即 maxAmount
        // 不需要根据价格计算，因为用户支付的就是 base token
        if (maxAmount && d(maxAmount).gt(0)) {
          return maxAmount
        }
        return available || '0'
      }
    }
    // 市价单：使用 available（token 数量）
    return available || '0'
  }, [orderType, tradeType, available, availableUSD, quotePrice, price, maxAmount])

  return (
    <>
      <InputBlockGroup
        from={from}
        to={to}
        isShowOrderVolumeError={isShowOrderVolumeError}
        minSize={currentDeepBookPool?.minSize}
        isMarket={orderType === 'Market'}
        maxAvailable={maxAvailableForInput}
        tradeType={tradeType === DeepBookPoolMarginTabs.Long ? 'Buy' : 'Sell'}
        price={price}
        maxFee={maxFee}
        tradeAssetCoinType={currentDeepBookPool?.baseAssets?.coin_type}
      />
      <Box w="100%" border="1px solid" borderColor="border" borderRadius="8px" p="12px">
        {/* Market 模式：只读显示 */}
        {orderType === 'Market' && (
          <HTextLabelBox
            label={'Total'}
            value={
              !total || total === '--' ? (
                <Text color="text_caption">--</Text>
              ) : (
                <HStack whiteSpace="nowrap" w="100%">
                  <Text fontSize={'14px'} color="text_caption">
                    {formatNumber(total)} {currentDeepBookPool?.quoteAssets?.symbol}
                  </Text>
                  {estTotalUsd && <Text fontSize={'14px'}>≈ ${formatNumberWithKMB(estTotalUsd, 2, true)}</Text>}
                </HStack>
              )
            }
            labelStyle={{ fontSize: '14px' }}
            valueStyle={{ fontSize: '14px', maxW: '100%' }}
            wrapStyle={{
              h: '20px',
              lineHeight: '20px',
              sx: {
                '& > div:last-child': {
                  maxW: '100%',
                  flex: 1,
                  overflow: 'hidden',
                  '&::webkit-scrollbar': {
                    display: 'none'
                  },
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }
              }
            }}
          />
        )}
        {/* Limit 模式：可输入的 Est.Value */}
        {orderType === 'Limit' && (
          <HStack w="100%" h="20px" lineHeight="20px" justifyContent="space-between" alignItems="center">
            <Text fontSize="14px" fontWeight={500} color="text_paragraph">
              Total
            </Text>
            <HStack overflow="hidden" flex="1" gap="4px" justifyContent="flex-end" alignItems="center">
              <NumericFormatInput
                value={isEditingEstValue ? estValue || '' : total || ''}
                onChange={(value: string) => {
                  if (handleEstValueChange) {
                    handleEstValueChange(value)
                  }
                }}
                onFocus={() => {
                  if (setIsEditingEstValue) {
                    setIsEditingEstValue(true)
                  }
                  // 如果 estValue 为空且有 total 值，将 total 设置到 estValue（与 spot-Limit 保持一致）
                  if (!estValue && total && setEstValue) {
                    setEstValue(total)
                  }
                }}
                onBlur={() => {
                  if (setIsEditingEstValue) {
                    setIsEditingEstValue(false)
                  }
                }}
                placeholder="0.00"
                style={{
                  textAlign: 'right',
                  fontSize: '14px',
                  height: '20px',
                  minHeight: '20px',
                  padding: '0',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--chakra-colors-text_caption)',
                  outline: 'none'
                }}
                decimals={currentDeepBookPool?.quoteAssets?.decimals}
              />
              <Text fontSize="14px" color="text_caption" whiteSpace="nowrap" flexShrink={0}>
                {currentDeepBookPool?.quoteAssets?.symbol}
              </Text>
              {estTotalUsd && (
                <Text fontSize="14px" color="text_paragraph" whiteSpace="nowrap" flexShrink={0}>
                  ≈ ${formatNumberWithKMB(estTotalUsd)}
                </Text>
              )}
            </HStack>
          </HStack>
        )}
      </Box>
      <VStack w="100%" gap="12px">
        <HTextLabelBox
          label={
            <HStack gap="4px">
              <Text fontSize={'12px'}>Usable Funds</Text>
              <CetusTooltip
                placement="top"
                tooltip={
                  <Text fontSize={'12px'} lineHeight="16px">
                    The max funds you can utilize to place new margin orders, based on your collateral and the leverage you're applying.
                  </Text>
                }
              >
                <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
              </CetusTooltip>
            </HStack>
          }
          value={
            <HStack gap="4px" alignItems={'center'}>
              {Number(available) > 0 ? (
                <CetusTooltip
                  placement="top-end"
                  tooltip={
                    <HStack gap="32px">
                      <HStack gap="4px">
                        <SingleCoinImage imageUrl={collateralItem.iconUrl} w="16px" h="16px" />
                        <Text fontSize={'12px'} color={'text_caption'}>
                          {collateralItem.symbol}
                        </Text>
                      </HStack>

                      <Text fontSize={'12px'} color={'text_caption'}>
                        {formatNumber(available)}
                      </Text>
                    </HStack>
                  }
                >
                  <Text fontSize={'12px'} color={'text_caption'} textDecor={'underline dotted'}>
                    ${formatUSDPrice(availableUSD || '0', true)}
                  </Text>
                </CetusTooltip>
              ) : (
                <Text fontSize={'12px'} color={'text_caption'}>
                  ${formatUSDPrice(availableUSD || '0', true)}
                </Text>
              )}
              <CetusTooltip placement="top-end" tooltip={<Text fontSize={'12px'}>Deposit Collateral</Text>}>
                <Text
                  cursor={'pointer'}
                  as="span"
                  w="16px"
                  h="16px"
                  fontSize={'12px'}
                  lineHeight={1}
                  display={'flex'}
                  alignItems={'center'}
                  justifyContent={'center'}
                  bg="primary_opacity.10"
                  borderRadius="50%"
                  color={'primary'}
                  onClick={() => {
                    if (!currentAccount?.address) {
                      onWalletModal(true)
                      return
                    }
                    // 如果是初始状态，使用 "Initialize & Deposit Collateral"，否则使用 "Deposit"
                    const actionType = isInitialState ? 'Initialize & Deposit Collateral' : 'Deposit'
                    // 根据 tradeType 选择对应的 token：Long 使用 quoteAssets，Short 使用 baseAssets
                    const collateralToken =
                      tradeType === DeepBookPoolMarginTabs.Long ? currentDeepBookPool?.quoteAssets : currentDeepBookPool?.baseAssets
                    // 禁用 token 切换，只允许 deposit 对应的 collateralItem token
                    openAssetsActionModal(actionType, collateralToken, true)
                  }}
                  _hover={
                    !currentAccount?.address
                      ? {}
                      : {
                          bg: 'primary_opacity.20'
                        }
                  }
                  transition="all 0.2s"
                >
                  +
                </Text>
              </CetusTooltip>
            </HStack>
          }
          labelStyle={{ fontSize: '14px' }}
          valueStyle={{ fontSize: '14px' }}
          wrapStyle={{ h: '14px', lineHeight: '14px' }}
        />

        <HTextLabelBox
          label={
            <HStack gap="4px">
              <Text fontSize={'12px'}>Max {tradeType === DeepBookPoolMarginTabs.Long ? 'Long' : 'Short'}</Text>
              <CetusTooltip
                placement="top"
                tooltip={
                  <Text fontSize={'12px'} lineHeight="16px">
                    {tradeType === DeepBookPoolMarginTabs.Long
                      ? 'The max amount you may buy/long based on your current usable funds and the current market price.'
                      : 'The max amount you may sell/short based on your current usable funds and the current market price.'}
                  </Text>
                }
              >
                <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
              </CetusTooltip>
            </HStack>
          }
          // <Text fontSize={'12px'}></Text>}
          value={
            <Text fontSize={'12px'} color={'text_caption'}>
              {formatNumber(maxAmount || '0')} {currentDeepBookPool?.baseAssets?.symbol}
            </Text>
          }
          labelStyle={{ fontSize: '12px' }}
          valueStyle={{ fontSize: '12px' }}
          wrapStyle={{ h: '14px', lineHeight: '14px' }}
        />
      </VStack>
    </>
  )
}
