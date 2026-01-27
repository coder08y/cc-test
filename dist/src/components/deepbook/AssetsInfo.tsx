import useGetDeepBookMarginBalance from '@/hooks/deepbook/margin/useGetDeepBookMarginBalance'
import useGetDeepBookManagerBalance from '@/hooks/deepbook/useGetDeepBookManagerBalance'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { Icon, RefreshButton } from '@cetus/ui-kit'
import { Box, HStack, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo } from 'react'
import BalanceManagerSelector from './BalanceManagerSelector'

import { useGetCoin } from '@/hooks/common/useCoin'
import usePlaceMarginOrder from '@/hooks/deepbook/margin/useMarginOrderActions'
import useMarginSettleList from '@/hooks/deepbook/margin/useMarginSettleList'
// import useGetDeepBookAssetsPayload from '@/hooks/deepbook/useGetDeepBookAssetsPayload'
import useAssetsActionRefresh from '@/hooks/deepbook/useAssetsActionRefresh'
// import useTransaction from '@/hooks/common/useTransaction'
import useDeepBookOrderActions from '@/hooks/deepbook/useDeepBookOrderActions'
import useGetDeepBookBalance from '@/hooks/deepbook/useGetDeepBookBalance'
// import useGlobalStore from '@/store/common/global'
import { testnetCoins } from '@/hooks/deepbook/useGetDeepBookPools'
import useGetDeepBookSettleList from '@/hooks/deepbook/useGetDeepBookSettleList'
import { CetusTooltip } from '@cetus/design'
// import useDocumentSize from '@cetus/hooks/src/useDocumentSize'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
// import useTransactionModal from '@cetus/hooks/src/useTransactionModal'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import envConfigs from '@cetus/types/src/config/envConfigs'
// import usePeripherySDKStore from '@cetus/stores/src/usePeripherySDKStore'
// import { BalanceChanges, CommonTypeInfo, TransactionStatusType } from '@cetus/types'
import { HTextLabelBox, SingleCoinImage } from '@cetus/ui-kit'
import { abbreviateTokenName, d, formatPriceWithDown, formatUSDPrice, isAvailableObject } from '@cetus/utils'
import { Button, Skeleton } from '@chakra-ui/react'
import AssetsInfoSettledBalance from './AssetsInfoSettledBalance'
// import WithdrawAllModal from './WithdrawAllModal'

interface TokenAssetItemProps {
  token: Token
  onDeposit: (token: Token) => void
  onWithdraw: (token: Token) => void
  freeBalance: string | number | object | undefined
  balanceInfo: any
  lockBalance?: string | number | object | undefined
  showLockBalance?: boolean
  // Margin pool 模式下，直接使用已计算的 USD 值
  freeBalanceUSD?: string
  walletBalanceUSD?: string
}

function TokenAssetItem({
  token,
  onDeposit,
  onWithdraw,
  freeBalance,
  balanceInfo,
  lockBalance = '0',
  showLockBalance = true,
  freeBalanceUSD: providedFreeBalanceUSD,
  walletBalanceUSD: providedWalletBalanceUSD
}: TokenAssetItemProps) {
  const isLoading = !token?.symbol
  const { getTokenAmountValue } = useTokenPrice()

  // 确保 freeBalance 是字符串类型（兼容 margin pool 和普通 pool 的不同格式）
  const freeBalanceStr = useMemo(() => {
    if (freeBalance === null || freeBalance === undefined) {
      return '0'
    }
    if (typeof freeBalance === 'string') {
      return freeBalance
    }
    if (typeof freeBalance === 'number') {
      return String(freeBalance)
    }
    if (typeof freeBalance === 'object') {
      // 如果是对象，尝试获取 balanceFormat 或其他可能的属性
      return (freeBalance as any).balanceFormat || (freeBalance as any).balance || '0'
    }
    return '0'
  }, [freeBalance])

  // 确保 lockBalance 是字符串类型
  const lockBalanceStr = useMemo(() => {
    if (lockBalance === null || lockBalance === undefined) {
      return '0'
    }
    if (typeof lockBalance === 'string') {
      return lockBalance
    }
    if (typeof lockBalance === 'number') {
      return String(lockBalance)
    }
    if (typeof lockBalance === 'object') {
      return (lockBalance as any).balanceFormat || (lockBalance as any).balance || '0'
    }
    return '0'
  }, [lockBalance])

  // 计算美元价值：如果提供了已计算的值（margin pool），直接使用；否则重新计算
  const freeBalanceUSD = providedFreeBalanceUSD || getTokenAmountValue(token?.coin_type, freeBalanceStr)
  const lockBalanceUSD = showLockBalance ? getTokenAmountValue(token?.coin_type, lockBalanceStr) : '0'
  const balanceTooltipItems = showLockBalance
    ? [
        {
          label: 'Locked',
          amount: lockBalanceStr,
          amountUSD: lockBalanceUSD
        },
        {
          label: 'Free Balance',
          amount: freeBalanceStr,
          amountUSD: freeBalanceUSD
        }
      ]
    : [
        {
          label: 'Free Balance',
          amount: freeBalanceStr,
          amountUSD: freeBalanceUSD
        }
      ]
  const walletBalanceUSD = providedWalletBalanceUSD || getTokenAmountValue(token?.coin_type, balanceInfo?.balanceFormat || '0')
  const balanceTooltipDescription = showLockBalance ? (
    <Text fontSize="12px" lineHeight={'16px'}>
      Includes Locked and Free Balance.
      <br />
      Locked Balance refers to assets in open orders.
      <br />
      Free Balance is the available assets in the DeepBook balance manager
    </Text>
  ) : (
    <Text fontSize="12px" lineHeight={'16px'}>
      Free Balance is the available assets in the DeepBook balance manager.
    </Text>
  )
  const isZeroBalance = d(freeBalanceStr ?? 0).lte(0)
  const isZeroLockBalance = d(lockBalanceStr ?? 0).lte(0)
  const totalDeepBookBalance = d(freeBalanceStr ?? 0)
    .add(d(lockBalanceStr ?? 0))
    .toString()

  // console.log('totalDeepBookBalance', totalDeepBookBalance, token?.symbol)

  const totalDeepBookBalanceUSD = getTokenAmountValue(token?.coin_type, totalDeepBookBalance)
  // console.log('totalDeepBookBalanceUSD', totalDeepBookBalanceUSD, token?.symbol)

  // 只要有 lockBalance 或 freeBalance，就显示 tooltip
  const hasAnyBalance = !isZeroBalance || !isZeroLockBalance

  // 始终显示所有 tooltip items（包括为 0 的项）
  // 如果 showLockBalance 为 true，会显示 Locked 和 Free Balance 两项；否则只显示 Free Balance
  const shouldShowTooltip = showLockBalance || !isZeroBalance

  const balanceDisplay = (
    <Text textDecoration={hasAnyBalance ? 'underline dotted' : 'none'} fontSize="12px" lineHeight="16px">
      <Text as="span" color="text_caption" fontSize="12px" lineHeight="16px">
        {formatPriceWithDown(totalDeepBookBalance ?? 0)}
      </Text>{' '}
      (${formatUSDPrice(totalDeepBookBalanceUSD, true)})
    </Text>
  )

  // console.log('totalDeepBookBalanceUSD', totalDeepBookBalanceUSD)

  return (
    <VStack align="flex-start" w="100%" gap="12px" mb="12px" _last={{ mb: 0 }}>
      {isLoading ? (
        <HStack w="100%">
          <SkeletonCircle />
          <Skeleton />
        </HStack>
      ) : (
        <HStack w="100%">
          <SingleCoinImage imageUrl={token?.logo_url} imgBoxStyle={{ w: '24px', h: '24px' }} imageStyle={{ w: '24px', h: '24px' }} />
          <Text color="text_caption">{abbreviateTokenName(token?.symbol)}</Text>
        </HStack>
      )}

      {/* <HStack w="100%" h="20px" justify="space-between">
        <HStack gap="4px">
          <Text>Locked</Text>
          <CetusTooltip tooltip={<Text fontSize="12px">Locked in Limit Orders</Text>} placement="top">
            <Icon xlinkHref="#icon-icon_tips" svgW="20px" svgH="20px" />
          </CetusTooltip>
        </HStack>
        {isLoading ? <Skeleton /> : <Text color="text_caption">{lockBalance}</Text>}
      </HStack> */}

      <HTextLabelBox
        isLoading={false}
        label={
          <HStack gap="2px">
            <Text fontSize="12px" lineHeight="16px">
              DeepBook Balance
            </Text>
            <CetusTooltip tooltip={balanceTooltipDescription} placement="top">
              <Icon xlinkHref="#icon-icon_tips" svgW="18px" svgH="18px" />
            </CetusTooltip>
          </HStack>
        }
        value={
          isLoading ? (
            <Skeleton />
          ) : shouldShowTooltip ? (
            <CetusTooltip
              placement="top-end"
              tooltip={balanceTooltipItems.map((item, index: number) => (
                <VStack
                  mb={index === 0 && balanceTooltipItems.length > 1 ? '8px' : '0px'}
                  gap="4px"
                  w="200px"
                  alignItems="flex-start"
                  key={`deepbook-balance-${index}`}
                >
                  <Text fontSize="12px">{item.label}</Text>
                  <HStack gap="4px" bg="background" w="100%" justifyContent="space-between" p="8px" borderRadius="6px">
                    <HStack>
                      <SingleCoinImage imageUrl={token?.logo_url} imgBoxStyle={{ w: '16px', h: '16px' }} imageStyle={{ w: '16px', h: '16px' }} />
                      <Text color="text_caption" fontSize="12px">
                        {abbreviateTokenName(token?.symbol)}
                      </Text>
                    </HStack>
                    <Text fontSize="12px" lineHeight="16px">
                      <Text as="span" color="text_caption" mr="2px" fontSize="12px" lineHeight="16px">
                        {formatPriceWithDown(item.amount ?? 0, 4)}
                      </Text>
                      (${formatUSDPrice(item.amountUSD, true, 4)})
                    </Text>
                  </HStack>
                </VStack>
              ))}
            >
              {balanceDisplay}
            </CetusTooltip>
          ) : (
            balanceDisplay
          )
        }
        labelStyle={{ fontSize: '12px', h: '16px', lineHeight: '16px' }}
        valueStyle={{ fontSize: '12px', h: '16px', lineHeight: '16px' }}
        skeletonStyle={{ valueW: '96px', valueH: '16px' }}
      />

      <HTextLabelBox
        isLoading={false}
        label="Wallet Balance"
        value={
          isLoading ? (
            <Skeleton />
          ) : (
            <HStack gap={'4px'}>
              <Text as="span" color="text_caption" fontSize="12px" lineHeight="16px">
                {formatPriceWithDown(balanceInfo?.balanceFormat ?? 0)}
              </Text>
              <Text as="span" color="text_paragraph" fontSize="12px" lineHeight="16px">
                (${formatUSDPrice(walletBalanceUSD, true)})
              </Text>
            </HStack>
          )
        }
        labelStyle={{ fontSize: '12px', h: '16px', lineHeight: '16px' }}
        valueStyle={{ fontSize: '12px', h: '16px', lineHeight: '16px' }}
        skeletonStyle={{ valueW: '96px', valueH: '16px' }}
      />

      <HStack w="100%">
        <Button
          variant="ghost"
          h="28px"
          w="50%"
          borderRadius="8px"
          isDisabled={d(freeBalanceStr ?? 0).lte(0)}
          fontSize="12px"
          borderColor="transparent !important"
          onClick={() => onWithdraw(token)}
        >
          Withdraw
        </Button>
        <Button
          variant="ghost"
          h="28px"
          w="50%"
          borderRadius="8px"
          borderColor="transparent !important"
          isDisabled={d(balanceInfo?.balanceFormat ?? 0).lte(0)}
          fontSize="12px"
          onClick={() => onDeposit(token)}
        >
          Deposit
        </Button>
      </HStack>
    </VStack>
  )
}

function AssetsInfo({
  hideHeader = false,
  maxH = { base: 'auto', lg: '408px' },
  onOpenInnerDrawer
}: { hideHeader?: boolean; maxH?: string | { base: string; lg: string }; onOpenInnerDrawer?: () => void }) {
  const {
    currentDeepBookPool,
    // currentBalanceManagerInfoMap,
    deepBookOpenOrders,
    // managerBalanceObjs,
    // managerBalanceListObjs,
    deepBookSettleList,
    deepBookPools,
    // withdrawAllModalOpen,
    // setWithdrawAllModalOpen,
    balanceManagerList,
    getTradeType
  } = useDeepBookStore()
  const { marginSettleList } = useMarginStore()
  const { currentAccount } = useAccountStore()
  // const [withdrawAllLoading, setWithdrawAllLoading] = useState(false)
  const { getAllManagerBalances } = useGetDeepBookManagerBalance()
  const deepCoinType = '0xdeeb7a4662eec9f2f3def03fb937a663dddaa2e215b8078a284d026b7946c270::deep::DEEP'
  const deepCoinMainnet = useGetCoin(deepCoinType)
  const deepCoin = envConfigs.env === 'testnet' ? testnetCoins.DEEP : deepCoinMainnet

  // console.log('deepCoin', deepCoinMainnet)

  const currentBalanceManagerInfo = useDeepBookStore((state: any) => {
    const address = currentAccount?.address
    if (!address) return null
    return state.currentBalanceManagerInfoMap[address] || null
  })
  const { getManagerBalance } = useGetDeepBookManagerBalance()
  // const { deposit: spotDeposit, withdraw: spotWithdraw } = useDeepBookAssetsActions()
  // const { deposit: marginDeposit, withdraw: marginWithdraw } = useDeepBookMarginAssetsActions()
  const { claimSettled } = useDeepBookOrderActions()
  const { marginClaimSettled } = usePlaceMarginOrder()
  const { getSettleList } = useGetDeepBookSettleList()
  const { getSettleList: getMarginSettleList } = useMarginSettleList()

  useEffect(() => {
    if (currentBalanceManagerInfo?.balanceManager && currentDeepBookPool?.address && currentAccount?.address && deepCoin) {
      getManagerBalance(
        [
          { coin_type: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
          { coin_type: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals },
          { coin_type: deepCoin?.coin_type, decimals: deepCoin?.decimals }
        ],
        currentAccount?.address,
        currentBalanceManagerInfo?.balanceManager
      )
    }
  }, [currentBalanceManagerInfo, currentAccount?.address, currentDeepBookPool, deepCoin])

  // 获取所有 balance manager 的余额
  useEffect(() => {
    if (balanceManagerList?.length > 0 && currentDeepBookPool?.address && currentAccount?.address && deepCoin) {
      const coins = [
        { coinType: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
        { coinType: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals },
        { coinType: deepCoin?.coin_type, decimals: deepCoin?.decimals }
      ]

      getAllManagerBalances(balanceManagerList, coins, currentAccount?.address)
    }
  }, [balanceManagerList, currentAccount?.address, currentDeepBookPool, deepCoin])

  // 获取 settled balance
  useEffect(() => {
    if (deepBookPools?.length > 0 && currentAccount?.address && isAvailableObject(currentBalanceManagerInfo)) {
      getSettleList()
    }
  }, [deepBookPools?.length, currentAccount?.address, currentDeepBookPool?.address, currentBalanceManagerInfo])

  useEffect(() => {
    if (currentDeepBookPool?.address && currentAccount?.address) {
      getMarginSettleList()
    }
  }, [currentDeepBookPool?.address, currentAccount?.address])

  // 根据是否为 Margin pool 选择使用哪个数据源
  const spotBalance = useGetDeepBookBalance()

  // 获取当前池子的 managerId
  const managerId = useMarginStore((state: any) => {
    if (!currentDeepBookPool?.isMarginPool || !currentAccount?.address || !currentDeepBookPool?.address) {
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

  // 从 store 读取 margin balance 数据（如果是 margin pool）
  const marginBalanceData = useMarginStore((state: any) => {
    if (!currentDeepBookPool?.isMarginPool || !currentAccount?.address || !currentDeepBookPool?.address) {
      return null
    }
    return state.getMarginBalanceData(currentAccount.address, currentDeepBookPool.address, managerId)
  })

  // 保留 hook 调用以获取 baseBalance 和 quoteBalance 对象（store 中没有存储这些对象）
  const marginBalanceHook = useGetDeepBookMarginBalance()

  const tradeTypeByPool = useDeepBookStore(state => {
    return state.tradeTypeByPool
  })
  const poolAddress = useMemo(() => {
    return currentDeepBookPool?.address
  }, [currentDeepBookPool?.address])

  const tradeType = useMemo(() => {
    return poolAddress ? tradeTypeByPool[poolAddress] : 'Spot'
  }, [poolAddress, tradeTypeByPool])

  // 如果是 Margin pool，使用 margin 资产数据；否则使用普通 DeepBook 资产数据
  const balanceData = currentDeepBookPool?.isMarginPool && tradeType == 'Margin' ? marginBalanceHook : spotBalance
  // console.log('🚀🚀🚀 ~ AssetsInfo.tsx:404 ~ AssetsInfo ~ marginBalanceHook:', marginBalanceHook)
  const { baseBalance, quoteBalance, deepBalance, deepFreeBalance } = balanceData

  // 从 store 或 hook 获取 margin pool 的余额数据
  const baseFreeBalance =
    currentDeepBookPool?.isMarginPool && tradeType == 'Margin'
      ? (marginBalanceData?.baseFreeBalance ?? marginBalanceHook.baseFreeBalance)
      : spotBalance.baseFreeBalance
  const quoteFreeBalance =
    currentDeepBookPool?.isMarginPool && tradeType == 'Margin'
      ? (marginBalanceData?.quoteFreeBalance ?? marginBalanceHook.quoteFreeBalance)
      : spotBalance.quoteFreeBalance

  // 仅在 margin pool 模式下获取 USD 值
  const baseMarginBalanceUSD =
    currentDeepBookPool?.isMarginPool && tradeType == 'Margin'
      ? (marginBalanceData?.baseMarginBalanceUSD ?? marginBalanceHook.baseMarginBalanceUSD)
      : undefined
  const quoteMarginBalanceUSD =
    currentDeepBookPool?.isMarginPool && tradeType == 'Margin'
      ? (marginBalanceData?.quoteMarginBalanceUSD ?? marginBalanceHook.quoteMarginBalanceUSD)
      : undefined

  // 获取 margin 相关数据（hooks 必须无条件调用，用于计算 marginData）
  // const marginBalanceData = useGetDeepBookMarginBalance()
  // const marginDebtData = useDeepbookMarginDebt()

  // 获取 token price hook（用于计算钱包余额的 USD 值）
  const { getTokenAmountValue } = useTokenPrice()

  // 获取钱包余额的 USD 值（仅在 margin pool 模式下需要，因为 marginBalance 返回的是 balanceInfo 对象）
  const baseWalletBalanceUSD = useMemo(() => {
    if (currentDeepBookPool?.isMarginPool && baseBalance?.balanceFormat) {
      return getTokenAmountValue(currentDeepBookPool?.baseAssets?.coin_type, baseBalance.balanceFormat)
    }
    return undefined
  }, [currentDeepBookPool?.isMarginPool, baseBalance, currentDeepBookPool?.baseAssets?.coin_type, getTokenAmountValue])

  const quoteWalletBalanceUSD = useMemo(() => {
    if (currentDeepBookPool?.isMarginPool && quoteBalance?.balanceFormat) {
      return getTokenAmountValue(currentDeepBookPool?.quoteAssets?.coin_type, quoteBalance.balanceFormat)
    }
    return undefined
  }, [currentDeepBookPool?.isMarginPool, quoteBalance, currentDeepBookPool?.quoteAssets?.coin_type, getTokenAmountValue])

  // 计算 margin 相关的显示值（仅在 margin pool 模式下使用）
  // const marginCollateralValue = useMemo(() => {
  //   if (!currentDeepBookPool?.isMarginPool || !marginBalanceData?.totalCollateralValue) {
  //     return '$0'
  //   }
  //   if (marginBalanceData.totalCollateralValue === '0') {
  //     return '$0'
  //   }
  //   return `$${formatNumber(marginBalanceData.totalCollateralValue, 2)}`
  // }, [currentDeepBookPool?.isMarginPool, marginBalanceData?.totalCollateralValue])

  // const marginDebtValue = useMemo(() => {
  //   if (!currentDeepBookPool?.isMarginPool || !marginDebtData?.totalDebtValue) {
  //     return '$0'
  //   }
  //   if (marginDebtData.totalDebtValue === '0') {
  //     return '$0'
  //   }
  //   return `$${formatNumber(marginDebtData.totalDebtValue, 2)}`
  // }, [currentDeepBookPool?.isMarginPool, marginDebtData?.totalDebtValue])

  // 获取当前 pool 的 settled balance
  const currentSettledBalance = useMemo(() => {
    if (!currentDeepBookPool?.address) {
      return { baseSettle: '0', quoteSettle: '0', canClaim: false }
    }

    // 根据 pool 类型选择对应的 settle list
    const settleList = getTradeType(currentDeepBookPool?.address) == 'Margin' ? marginSettleList : deepBookSettleList

    if (!settleList?.length) {
      return { baseSettle: '0', quoteSettle: '0', canClaim: false }
    }

    const settled = settleList.find((item: any) => item.address === currentDeepBookPool.address)
    return settled || { baseSettle: '0', quoteSettle: '0', canClaim: false }
  }, [deepBookSettleList, marginSettleList, currentDeepBookPool?.address])

  const lockInfo = useMemo(() => {
    const result = {
      baseLock: '0',
      quoteLock: '0',
      deepLock: '0'
    }

    // 如果是 margin pool，从 marginBalanceData 中获取 lock balance
    if (currentDeepBookPool?.isMarginPool && tradeType == 'Margin' && marginBalanceData) {
      result['baseLock'] = marginBalanceData.baseLockedBalance || '0'
      result['quoteLock'] = marginBalanceData.quoteLockedBalance || '0'
      return result
    }

    // 否则，从 deepBookOpenOrders 中计算（spot orders）
    if (deepBookOpenOrders?.length > 0) {
      let baseLock = '0'
      let quoteLock = '0'
      deepBookOpenOrders
        .filter(ele => ele.instrument == 'Spot')
        .forEach((item: any) => {
          if (currentDeepBookPool?.address === item?.address) {
            if (item?.side == 'Buy') {
              // 买单锁定 quote asset (需要用 quote 购买 base)
              quoteLock = d(quoteLock)
                .add(d(item.originalQuantity).sub(d(item.filledQuantity)).mul(item.price))
                .toString()
            } else {
              // 卖单锁定 base asset (需要卖出 base)
              baseLock = d(baseLock)
                .add(d(item.originalQuantity).sub(d(item.filledQuantity)))
                .toString()
            }
          }
        })

      result['baseLock'] = baseLock
      result['quoteLock'] = quoteLock
    }

    return result
  }, [deepBookOpenOrders, currentDeepBookPool, marginBalanceData])

  const openAssetsActionModal = useDeepBookStore(state => state.openAssetsActionModal)

  const handleDeposit = (token: Token) => {
    onOpenInnerDrawer?.()
    openAssetsActionModal('Deposit', token)
  }

  const handleWithdraw = (token: Token) => {
    onOpenInnerDrawer?.()
    openAssetsActionModal('Withdraw', token)
  }

  const { handleRefresh } = useAssetsActionRefresh()

  const { isApp } = useWindowWidth()

  const shouldShowDeepCoin = useMemo(() => {
    const deepCoinType = deepCoin?.coin_type
    if (!deepCoinType) return false
    const baseCoinType = currentDeepBookPool?.baseAssets?.coin_type
    const quoteCoinType = currentDeepBookPool?.quoteAssets?.coin_type
    return deepCoinType !== baseCoinType && deepCoinType !== quoteCoinType
  }, [deepCoin?.coin_type, currentDeepBookPool?.baseAssets?.coin_type, currentDeepBookPool?.quoteAssets?.coin_type])

  const isShowSettledBalance = useMemo(() => {
    return (d(currentSettledBalance.baseSettle).gt(0) || d(currentSettledBalance.quoteSettle).gt(0)) && currentAccount?.address
  }, [currentSettledBalance, currentAccount?.address])

  return (
    <VStack
      w="100%"
      align="flex-start"
      bg={{ base: 'transparent', lg: 'bg_secondary' }}
      borderRadius="12px"
      h="100%"
      display="flex"
      flexDirection="column"
      overflow="hidden"
      pt={tradeType !== 'Margin' && isApp ? '12px' : '0'}
    >
      {isApp || hideHeader ? null : (
        <Box w="100%" p="12px 0 0" flexShrink={0}>
          <HStack w="100%" borderBottom="1px solid" borderColor="border" pb="12px">
            <HStack w="100%" justifyContent={'space-between'} alignItems={'center'} px="12px">
              <Text fontSize="14px" color="text_caption">
                Account Portfolio
              </Text>
              <HStack>
                <BalanceManagerSelector isMarginPool={tradeType == 'Margin'} />
                {isApp && <RefreshButton handleRefresh={handleRefresh} w="28px" h="28px" minW="28px" innerStyle={{ bg: 'none' }} />}
              </HStack>
            </HStack>
          </HStack>
        </Box>
      )}

      <VStack
        w="100%"
        align="flex-start"
        p={{ base: '0', lg: '0 12px 12px' }}
        // minHeight="334px"
        // h={{ base: '100%', lg: size?.h - 80 - 430 - 8 - 46 - 40 }}
        overflowY="auto"
        overflowX="hidden"
        bg={{ base: 'transparent', lg: 'bg_secondary' }}
        gap={'0'}
        maxH={isShowSettledBalance ? '518px' : maxH}
      >
        {(d(currentSettledBalance.baseSettle).gt(0) || d(currentSettledBalance.quoteSettle).gt(0)) && currentAccount?.address && (
          <AssetsInfoSettledBalance
            currentDeepBookPool={currentDeepBookPool}
            currentSettledBalance={currentSettledBalance}
            onClaim={tradeType == 'Margin' ? marginClaimSettled : claimSettled}
          />
        )}
        <TokenAssetItem
          token={currentDeepBookPool?.baseAssets}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          freeBalance={baseFreeBalance}
          balanceInfo={baseBalance}
          lockBalance={lockInfo?.baseLock}
          freeBalanceUSD={tradeType == 'Margin' ? baseMarginBalanceUSD : undefined}
          walletBalanceUSD={baseWalletBalanceUSD}
        />
        <TokenAssetItem
          token={currentDeepBookPool?.quoteAssets}
          onDeposit={handleDeposit}
          onWithdraw={handleWithdraw}
          balanceInfo={quoteBalance}
          freeBalance={quoteFreeBalance}
          lockBalance={lockInfo?.quoteLock}
          freeBalanceUSD={tradeType == 'Margin' ? quoteMarginBalanceUSD : undefined}
          walletBalanceUSD={quoteWalletBalanceUSD}
        />
        {shouldShowDeepCoin && deepCoin && (
          <TokenAssetItem
            token={deepCoin}
            onDeposit={handleDeposit}
            onWithdraw={handleWithdraw}
            balanceInfo={deepBalance}
            freeBalance={deepFreeBalance}
            // showLockBalance={false}
          />
        )}
      </VStack>
      {/* <WithdrawAllModal
        isOpen={withdrawAllModalOpen}
        isLoading={withdrawAllLoading}
        onClose={() => setWithdrawAllModalOpen(false)}
        onConfirm={async selectedAccounts => {
          if (selectedAccounts.length === 0) return

          setWithdrawAllLoading(true)
          try {
            // 构造 balanceManagers 参数：Record<string, {coinType: string, amount: string}[]>
            const balanceManagers: Record<string, { coinType: string; amount: string }[]> = {}

            selectedAccounts.forEach((balanceManager: string) => {
              const balances = (managerBalanceListObjs as Record<string, any>)[balanceManager] || {}
              const coinsToWithdraw: { coinType: string; amount: string }[] = []

              // 获取 base、quote 和 DEEP 资产的余额
              const baseCoinType = currentDeepBookPool?.baseAssets?.coin_type
              const quoteCoinType = currentDeepBookPool?.quoteAssets?.coin_type
              const deepCoinType = deepCoin?.coin_type

              if (baseCoinType && balances[baseCoinType]) {
                const baseAmount = balances[baseCoinType]?.balance || '0'
                const baseAdjusted = balances[baseCoinType]?.adjusted_balance || '0'
                if (d(baseAdjusted).gt(0)) {
                  coinsToWithdraw.push({
                    coinType: baseCoinType,
                    amount: baseAmount
                  })
                }
              }

              if (quoteCoinType && balances[quoteCoinType]) {
                const quoteAmount = balances[quoteCoinType]?.balance || '0'
                const quoteAdjusted = balances[quoteCoinType]?.adjusted_balance || '0'
                if (d(quoteAdjusted).gt(0)) {
                  coinsToWithdraw.push({
                    coinType: quoteCoinType,
                    amount: quoteAmount
                  })
                }
              }

              if (deepCoinType && balances[deepCoinType]) {
                const deepAmount = balances[deepCoinType]?.balance || '0'
                const deepAdjusted = balances[deepCoinType]?.adjusted_balance || '0'
                if (d(deepAdjusted).gt(0)) {
                  coinsToWithdraw.push({
                    coinType: deepCoinType,
                    amount: deepAmount
                  })
                }
              }

              // 只有当有可提取余额时才添加到 balanceManagers
              if (coinsToWithdraw.length > 0) {
                balanceManagers[balanceManager] = coinsToWithdraw
              }
            })

            // 检查是否有可提取的余额
            if (Object.keys(balanceManagers).length === 0) {
              setWithdrawAllLoading(false)
              return
            }

            // 构建交易
            const tx = (deepBookSDK.DeepbookUtils as any).withdrawManagersFreeBalance({
              account: currentAccount?.address as string,
              balanceManagers
            })

            // 创建 toast 信息
            const toastInfo = {
              getShowInfo: (status: TransactionStatusType, balanceChanges?: Record<string, BalanceChanges>) => {
                const description = `Withdraw from ${selectedAccounts.length} account${selectedAccounts.length > 1 ? 's' : ''}`
                const info: CommonTypeInfo = {
                  modalDescriptionText: description,
                  toastTitleText: description
                }
                if (status === 'success') {
                  info.toastDescriptionContent = 'Withdraw successful'
                  info.modalDescriptionText = description
                  info.toastTitleText = 'Withdraw All successful'
                }
                return info
              }
            }

            transactionConfirmation(toastInfo)

            // 执行交易
            const res = await signAndExecuteTransaction(tx, toastInfo, {
              useMev: mevProtect,
              useFastMode: transactionMode === 'Fast Mode',
              maxCapForGas,
              customGasPrice,
              msafeParams: {}
            })

            if (res) {
              // 刷新余额数据
              fetchAccountBalance()

              // 刷新所有 balance manager 的余额
              if (balanceManagerList && balanceManagerList.length > 0) {
                const coinsForRefresh = [
                  { coinType: currentDeepBookPool?.baseAssets.coin_type, decimals: currentDeepBookPool?.baseAssets.decimals },
                  { coinType: currentDeepBookPool?.quoteAssets.coin_type, decimals: currentDeepBookPool?.quoteAssets.decimals },
                  { coinType: deepCoin?.coin_type, decimals: deepCoin?.decimals }
                ]
                getAllManagerBalances(balanceManagerList, coinsForRefresh, currentAccount?.address as string)
              }

              setWithdrawAllModalOpen(false)
            }
          } catch (error) {
            console.log('🚀 ~ withdraw all error:', error)
          } finally {
            setWithdrawAllLoading(false)
          }
        }}
      /> */}
    </VStack>
  )
}

export default AssetsInfo
