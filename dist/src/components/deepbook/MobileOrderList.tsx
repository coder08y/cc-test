import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NoData } from '@cetus/ui-kit'
import { formatNumber } from '@cetus/utils'
import { Box, HStack, Progress, Skeleton, Text, VStack } from '@chakra-ui/react'
import { ReactNode } from 'react'
import CoinPairInfo from '../common/CoinPairInfo'
import SideBadge from './SideBadge'

export interface MobileOrderItem {
  orderId?: string
  poolId?: string
  baseAssets: any
  quoteAssets: any
  side: 'Buy' | 'Sell' | 'Long' | 'Short'
  price: string | number
  filledQuantity?: string | number
  originalQuantity?: string | number
  filledPercentage?: number
  orderStatus?: string
  blockTime?: string
  total?: string | number
  fee?: string | number
  feeCoinSymbol?: string
  tx?: string
  [key: string]: any
}

export interface MobileOrderListField {
  key: string
  label: string
  render: (item: MobileOrderItem) => ReactNode
  showInHeader?: boolean // 是否显示在顶部区域
  alignItems?: 'center' | 'flex-start' | 'flex-end'
}

export interface MobileOrderListProps {
  dataSource: MobileOrderItem[]
  fields: MobileOrderListField[]
  loading?: boolean
  noDataText?: string
  noDataType?: 'nowallet' | 'nodata'
  onWalletConnect?: () => void
  headerRight?: (item: MobileOrderItem) => ReactNode
  actions?: (item: MobileOrderItem) => ReactNode
  showProgress?: boolean
}

export default function MobileOrderList({
  dataSource,
  fields,
  loading = false,
  noDataText = 'No data',
  noDataType = 'nodata',
  onWalletConnect,
  headerRight,
  actions,
  showProgress = true
}: MobileOrderListProps) {
  if (loading) {
    return (
      <VStack w="100%" gap="12px" p="12px">
        {Array.from({ length: 3 }).map((_, index) => (
          <Box key={index} w="100%" borderTop="1px solid" borderColor="border" py="12px">
            <HStack w="100%" justify="space-between" mb="12px">
              <HStack gap="8px">
                <Skeleton w="48px" h="24px" borderRadius="full" />
                <Skeleton w="120px" h="24px" borderRadius="12px" />
              </HStack>
            </HStack>

            <VStack w="100%" gap="8px">
              {Array.from({ length: 3 }).map((__, fieldIndex) => (
                <HStack key={fieldIndex} w="100%" justify="space-between">
                  <Skeleton w="100%" h="12px" borderRadius="4px" />
                </HStack>
              ))}
            </VStack>
          </Box>
        ))}
      </VStack>
    )
  }

  if (noDataType === 'nowallet' && onWalletConnect) {
    return <NoData type="nowallet" noBorder bg="none" onboard={onWalletConnect} />
  }

  if (!dataSource || dataSource.length === 0) {
    return <NoData type="nodata" text={noDataText} noBorder bg="none" />
  }

  const bodyFields = fields.filter(f => !f.showInHeader)

  const { isApp } = useWindowWidth()

  return (
    <VStack w="100%" gap="0" p="12px">
      {dataSource.map((item, index) => {
        const filledPercentage =
          item.filledPercentage ||
          (item.filledQuantity && item.originalQuantity ? (Number(item.filledQuantity) / Number(item.originalQuantity)) * 100 : 0)

        return (
          <Box
            key={item.orderId || index}
            w="100%"
            // bg="bg_secondary"
            // borderRadius="12px"
            borderTop="1px solid"
            borderColor="border"
            p={index === dataSource.length - 1 ? '12px 0 0 ' : '12px 0'}
          >
            {/* Header */}
            <HStack w="100%" justify="space-between" mb="12px">
              <HStack gap={isApp ? '4px' : '8px'}>
                <SideBadge side={item.side} />
                <CoinPairInfo
                  poolInfo={{
                    displayTokenA: item.baseAssets,
                    displayTokenB: item.quoteAssets,
                    poolAddress: item.poolId
                  }}
                  imgStyle={{
                    w: isApp ? '20px' : '24px',
                    h: isApp ? '20px' : '24px'
                  }}
                  showFee={false}
                  coinPairInfoWrapStyle={{
                    p: '0px'
                  }}
                />
              </HStack>

              {headerRight ? (
                headerRight(item)
              ) : showProgress ? (
                <HStack alignItems="center" gap={'8px'}>
                  <VStack gap="8px">
                    <Text color="text_caption" fontSize="12px">
                      {formatNumber(filledPercentage, 2)}%
                    </Text>
                    <Progress
                      w="50px"
                      h="4px"
                      value={filledPercentage}
                      bg="#282828"
                      sx={{
                        'div[role="progressbar"]': {
                          bg: 'primary'
                        }
                      }}
                    />
                  </VStack>
                  {/* Actions */}
                  {actions && <Box>{actions(item)}</Box>}
                </HStack>
              ) : null}
            </HStack>

            {/* Body Fields */}
            <VStack w="100%" gap="8px" mb={'0'}>
              {bodyFields.map(field => (
                <HStack alignItems={field.alignItems || 'center'} key={field.key} w="100%" justify="space-between">
                  <Text fontSize="12px" lineHeight="16px">
                    {field.label}
                  </Text>
                  <Box fontSize="12px" color="text_caption" textAlign="right" lineHeight="16px">
                    {field.render(item)}
                  </Box>
                </HStack>
              ))}
            </VStack>
          </Box>
        )
      })}
    </VStack>
  )
}
