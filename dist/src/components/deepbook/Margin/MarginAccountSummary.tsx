import useDeepBookStore from '@/store/deepbook'
import { CetusTooltip } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { d, formatUSDPrice } from '@cetus/utils'
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import MarginCollateralItems, { CollateralItem } from './MarginCollateralItems'

export type AccountSummaryItem = {
  label: string
  value: string
  tooltip: string
  showAfter?: string // 用于显示变化后的值，如 "$200 → $250"
}

type MarginAccountSummaryProps = {
  items: AccountSummaryItem[]
  noTooltip?: boolean
  baseBalance?: string
  quoteBalance?: string
  baseBalanceUSD?: string
  quoteBalanceUSD?: string
  baseDebt?: string
  quoteDebt?: string
  baseDebtUSD?: string
  quoteDebtUSD?: string
  debtOnlyUSD?: boolean // 是否只显示负债的美元价值（用于 AssetsInfoModal）
  loading?: boolean // 是否显示加载状态
}
export function RenderSummaryValue({ value, showAfter, underline = false }: { value: string; showAfter?: string; underline?: boolean }) {
  return (
    <Text
      textDecoration={underline ? 'underline dotted' : 'none'}
      textUnderlineOffset={underline ? '2px' : '0'}
      as="div"
      color="text_caption"
      fontSize="12px"
      lineHeight="16px"
      display="flex"
      alignItems="center"
      gap="4px"
    >
      {value}{' '}
      {showAfter ? (
        <HStack gap="4px">
          <Icon xlinkHref="#icon-icon_right" fontSize="12px" svgHover="text_paragraph" cursor="auto" />
          <Text fontSize="12px" lineHeight="16px" color="text_caption">
            {showAfter}
          </Text>
        </HStack>
      ) : null}
    </Text>
  )
}

export const getMarginAccountSummaryItems = ({
  CollateralValue,
  CollateralAfterValue,
  DebtValue,
  DebtAfterValue
}: {
  CollateralValue: string
  CollateralAfterValue?: string
  DebtValue: string
  DebtAfterValue?: string
}) => {
  return [
    {
      label: 'Total Collateral',
      value: CollateralValue,
      tooltip:
        'The total value of assets in your DeepBook margin account that are counted as collateral, including free, locked, and settled balances',
      showAfter: CollateralAfterValue
    },
    {
      label: 'Total Debt',
      value: DebtValue,
      tooltip: 'Total debt including both the borrowed principal and any accrued interest',
      showAfter: DebtAfterValue
    }
  ]
}

export default function MarginAccountSummary({
  items,
  noTooltip = false,
  baseBalance = '0',
  quoteBalance = '0',
  baseBalanceUSD = '0',
  quoteBalanceUSD = '0',
  baseDebt = '0',
  quoteDebt = '0',
  baseDebtUSD = '0',
  quoteDebtUSD = '0',
  debtOnlyUSD = false,
  loading = false
}: MarginAccountSummaryProps) {
  const currentDeepBookPool = useDeepBookStore(state => state.currentDeepBookPool)

  return (
    <VStack w="100%" gap="8px" alignItems="flex-start">
      {items.map(item => {
        // 如果是 Total Collateral，显示详细的 tooltip
        const isTotalCollateral = item.label === 'Total Collateral'
        const isTotalDebt = item.label === 'Total Debt'

        const collateralItems: CollateralItem[] = isTotalCollateral
          ? [
              {
                // label: 'Collateral 1',
                balance: baseBalance,
                balanceUSD: baseBalanceUSD,
                iconUrl: currentDeepBookPool?.baseAssets?.icon_url,
                symbol: currentDeepBookPool?.baseAssets?.symbol || '',
                decimals: currentDeepBookPool?.baseAssets?.decimals
              },
              {
                // label: 'Collateral 2',
                balance: quoteBalance,
                balanceUSD: quoteBalanceUSD,
                iconUrl: currentDeepBookPool?.quoteAssets?.icon_url,
                symbol: currentDeepBookPool?.quoteAssets?.symbol || '',
                decimals: currentDeepBookPool?.quoteAssets?.decimals
              }
            ]
          : []

        const hasDetailTooltip = isTotalCollateral && collateralItems.length > 0
        const detailItems = collateralItems

        // 计算 Total Debt 的显示值：token 数量 + USD value
        // Debt 只会存在一种资产的负债
        let debtTokenAmount = ''
        let debtTokenSymbol = ''
        let debtUSDValue = ''
        let hasDebt = false
        if (isTotalDebt) {
          const baseDebtValue = d(baseDebt)
          const quoteDebtValue = d(quoteDebt)
          const hasBaseDebt = baseDebtValue.gt(0)
          const hasQuoteDebt = quoteDebtValue.gt(0)

          if (hasBaseDebt) {
            const formatted = formatUSDPrice(baseDebt, currentDeepBookPool?.baseAssets?.decimals || 6)
            debtTokenAmount = formatted || baseDebtValue.toString()
            debtTokenSymbol = currentDeepBookPool?.baseAssets?.symbol || ''
            debtUSDValue = `$${formatUSDPrice(baseDebtUSD)}`
            hasDebt = true
          } else if (hasQuoteDebt) {
            const formatted = formatUSDPrice(quoteDebt, currentDeepBookPool?.quoteAssets?.decimals || 6)
            debtTokenAmount = formatted || quoteDebtValue.toString()
            debtTokenSymbol = currentDeepBookPool?.quoteAssets?.symbol || ''
            debtUSDValue = `$${formatUSDPrice(quoteDebtUSD)}`
            hasDebt = true
          }
        }

        return (
          <HStack key={item.label} w="100%" justifyContent="space-between" alignItems="center">
            <HStack w="100%" gap="4px" flex="1">
              <Text fontSize="12px" lineHeight="16px">
                {item.label}
              </Text>
              <CetusTooltip
                tooltip={
                  <VStack gap="4px" alignItems="flex-start">
                    <Text fontSize="12px" lineHeight="16px">
                      {item.tooltip}
                    </Text>
                  </VStack>
                }
              >
                <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
              </CetusTooltip>
            </HStack>
            {isTotalDebt ? (
              hasDebt ? (
                debtOnlyUSD ? (
                  <Skeleton isLoaded={!loading} h="16px">
                    <RenderSummaryValue value={debtUSDValue} showAfter={item.showAfter} />
                  </Skeleton>
                ) : (
                  <Skeleton isLoaded={!loading} h="16px">
                    <Text as="div" fontSize="12px" lineHeight="16px" display="flex" alignItems="center" gap="4px">
                      <Text fontSize="12px" lineHeight="16px" color="text_caption">
                        {debtUSDValue}
                      </Text>
                      <Text fontSize="12px" lineHeight="16px" color="text_paragraph">
                        ({debtTokenAmount} {debtTokenSymbol})
                      </Text>
                      {item.showAfter ? (
                        <HStack gap="4px">
                          <Icon xlinkHref="#icon-icon_right" fontSize="12px" svgHover="text_paragraph" cursor="auto" />
                          <Text fontSize="12px" lineHeight="16px" color="text_caption">
                            {item.showAfter}
                          </Text>
                        </HStack>
                      ) : null}
                    </Text>
                  </Skeleton>
                )
              ) : (
                <Skeleton isLoaded={!loading} h="16px">
                  <RenderSummaryValue value="$0" showAfter={item.showAfter} />
                </Skeleton>
              )
            ) : !noTooltip && hasDetailTooltip ? (
              <CetusTooltip
                placement="top-end"
                tooltip={
                  <VStack gap="4px" alignItems="flex-start">
                    <Text fontSize="12px" lineHeight="16px">
                      Collateral
                    </Text>
                    <MarginCollateralItems items={detailItems} />
                  </VStack>
                }
              >
                <Skeleton isLoaded={!loading} h="16px">
                  <RenderSummaryValue value={item.value} showAfter={item.showAfter} underline={true} />
                </Skeleton>
              </CetusTooltip>
            ) : !noTooltip ? (
              <Skeleton isLoaded={!loading} h="16px">
                <RenderSummaryValue value={item.value} showAfter={item.showAfter} underline={true} />
              </Skeleton>
            ) : (
              <Skeleton isLoaded={!loading} h="16px">
                <RenderSummaryValue value={item.value} showAfter={item.showAfter} />
              </Skeleton>
            )}
          </HStack>
        )
      })}
    </VStack>
  )
}
