import { colorMap } from '@/constant/deepbook'
import useGetDeepBookLiquidationRecords from '@/hooks/deepbook/useGetDeepBookLiquidationRecords'
import { useInitCursor } from '@/hooks/deepbook/useInitCursor'
import { useLoadMore } from '@/hooks/deepbook/useLoadMore'
import useDeepBookStore from '@/store/deepbook'
import useMarginStore from '@/store/deepbook/margin'
import { AddressCopyLink } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Icon, NoData, Table } from '@cetus/ui-kit'
import { formatNumber } from '@cetus/utils'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { useEffect, useMemo, useRef } from 'react'
import CoinPairInfo from '../../common/CoinPairInfo'
import LoadMoreIndicator from '../LoadMoreIndicator'
import { LeverageTag } from '../Margin/LeverageTag'
import MobileOrderList, { MobileOrderListField } from '../MobileOrderList'

dayjs.extend(utc)
dayjs.extend(timezone)

type TagType = 'Partial' | 'Full' | 'Bad Debt'

const tagColorMap: Record<TagType, { color: string; bg: string }> = {
  Partial: {
    color: 'rgba(117, 200, 255, 1)',
    bg: 'rgba(117, 200, 255, 0.1)'
  },
  Full: {
    color: colorMap[2].color,
    bg: colorMap[2].bg
  },
  'Bad Debt': {
    color: colorMap[1].color,
    bg: colorMap[1].bg
  }
}

const StatusTag = ({ type }: { type: TagType }) => {
  return (
    <Text
      as="span"
      fontSize="12px"
      lineHeight="16px"
      color={tagColorMap[type].color}
      bg={tagColorMap[type].bg}
      borderRadius="6px"
      p="4px 8px"
      whiteSpace="nowrap"
    >
      {type}
    </Text>
  )
}

// 获取健康度状态的工具函数（与 useMarginTrade.ts 保持一致）
const getHealthFactorStatus = (
  value: number | '∞' | null,
  liquidationRiskRatio?: string,
  minBorrowRiskRatio?: string,
  minWithdrawRiskRatio?: string
): { status: string; color: string; bg: string } | null => {
  if (value === null) {
    return null
  }

  // 使用池子返回的风险比率值，如果不存在则使用默认值
  const lr = liquidationRiskRatio ? Number(liquidationRiskRatio) : 1.25
  const mcr = minBorrowRiskRatio ? Number(minBorrowRiskRatio) : 1.5
  const mwr = minWithdrawRiskRatio ? Number(minWithdrawRiskRatio) : 2

  if (value === '∞') {
    return {
      status: 'Low risk',
      color: colorMap[3].color,
      bg: colorMap[3].bg
    }
  } else if (value <= lr) {
    return {
      status: 'Liquid',
      color: colorMap[1].color,
      bg: colorMap[1].bg
    }
  } else if (value < mcr) {
    return {
      status: 'Liquid',
      color: colorMap[4].color,
      bg: colorMap[4].bg
    }
  } else if (value < mwr) {
    return {
      status: 'Medium risk',
      color: colorMap[2].color,
      bg: colorMap[2].bg
    }
  } else {
    return {
      status: 'Low risk',
      color: colorMap[3].color,
      bg: colorMap[3].bg
    }
  }
}

const RiskRatioDisplay = ({
  before,
  after,
  liquidationRiskRatio,
  minBorrowRiskRatio,
  minWithdrawRiskRatio
}: {
  before: string
  after: string
  liquidationRiskRatio?: string
  minBorrowRiskRatio?: string
  minWithdrawRiskRatio?: string
}) => {
  // 将字符串转换为数字，处理 '∞' 的情况
  const beforeValue = before === '∞' ? '∞' : before ? Number(before) : null
  const afterValue = after === '∞' ? '∞' : after ? Number(after) : null

  // 获取颜色状态
  const beforeStatus = getHealthFactorStatus(beforeValue, liquidationRiskRatio, minBorrowRiskRatio, minWithdrawRiskRatio)
  const afterStatus = getHealthFactorStatus(afterValue, liquidationRiskRatio, minBorrowRiskRatio, minWithdrawRiskRatio)

  return (
    <HStack gap="4px" alignItems="center">
      <Text fontSize="12px" lineHeight="16px" color={beforeStatus?.color || 'text_caption'}>
        {formatNumber(before, 2)}
      </Text>
      <Icon xlinkHref="#icon-icon_right" fontSize="12px" svgFill="text_caption" />
      <Text fontSize="12px" lineHeight="16px" color={afterStatus?.color || 'text_caption'}>
        {formatNumber(after, 2)}
      </Text>
    </HStack>
  )
}

export default function LiquidationRecordTableBlock() {
  const { deepBookLiquidationRecords, deepBookLiquidationRecordsLoading, setDeepBookLiquidationRecords, setShowDeepBookLiquidationRecordsNum } =
    useMarginStore()
  const { currentDeepBookPool, isCheckedAllMarkets } = useDeepBookStore()
  const { currentAccount, onWalletModal } = useAccountStore()
  const { isApp } = useWindowWidth()
  const { getDeepBookLiquidationRecords } = useGetDeepBookLiquidationRecords()
  const { getExplorerUrl } = useExplorer()

  // 初始化数据加载
  useEffect(() => {
    if (currentAccount?.address) {
      const params: any = {
        limit: PAGE_SIZE
      }
      if (!isCheckedAllMarkets && currentDeepBookPool?.address) {
        params.poolId = currentDeepBookPool.address
      }
      getDeepBookLiquidationRecords(params)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAccount?.address, isCheckedAllMarkets, currentDeepBookPool?.address])

  const deepBookLiquidationRecordsList = useMemo(() => {
    // 暂时显示所有数据，因为 poolId 是 MarginPoolID，与 currentDeepBookPool?.address 可能不匹配
    // 如果需要筛选，需要根据 MarginPoolID 找到对应的 spot pool
    return deepBookLiquidationRecords || []
  }, [deepBookLiquidationRecords])

  const dataSource = useMemo(() => {
    return deepBookLiquidationRecordsList || []
  }, [deepBookLiquidationRecordsList])

  // 更新数量显示（可选，参考其他组件的注释）
  // useEffect(() => {
  //   setShowDeepBookLiquidationRecordsNum(dataSource?.length || 0)
  // }, [dataSource?.length, setShowDeepBookLiquidationRecordsNum])

  // 滚动容器引用
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // ===== 使用通用的加载更多 hook =====
  const PAGE_SIZE = 20 // 统一的分页大小
  const { loadMoreRef, isLoadingMore, cursor, hasMore, setCursor, setHasMore } = useLoadMore({
    onLoadMore: async () => {
      const params: any = {
        limit: PAGE_SIZE,
        eventCursor: cursor,
        isLoadMore: true
      }

      // 根据筛选条件添加参数
      if (!isCheckedAllMarkets && currentDeepBookPool?.address) {
        params.poolId = currentDeepBookPool.address
      }

      const result = await getDeepBookLiquidationRecords(params)

      if (result && result.list.length > 0) {
        setDeepBookLiquidationRecords([...deepBookLiquidationRecords, ...result.list])
        setCursor(result.cursor)
        setHasMore(result.hasMore)
      } else {
        setHasMore(false)
      }
    },
    enabled: true,
    dataLength: dataSource?.length || 0,
    isInitialLoading: deepBookLiquidationRecordsLoading,
    scrollContainerRef
  })

  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    setDeepBookLiquidationRecords([])
    setCursor(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCheckedAllMarkets])

  // 初始化 cursor
  useInitCursor(deepBookLiquidationRecords, cursor, setCursor, setHasMore, 'LiquidationRecord', PAGE_SIZE)

  // ===== Mobile fields configuration =====
  const mobileFields: MobileOrderListField[] = useMemo(
    () => [
      {
        key: 'status',
        label: 'Status',
        render: (item: any) => <StatusTag type={item?.status} />
      },
      {
        key: 'debtRepaid',
        label: 'Debt Repaid',
        render: (item: any) => (
          <Text fontSize="12px" color="text_caption">
            {formatNumber(item?.debtRepaid?.amount)} {item?.debtRepaid?.symbol}
          </Text>
        )
      },
      {
        key: 'assetDecreased',
        label: 'Asset Decreased',
        render: (item: any) => (
          <Text fontSize="12px" color="text_caption">
            {formatNumber(item?.assetDecreased?.amount)} {item?.assetDecreased?.symbol}
          </Text>
        )
      },
      {
        key: 'riskRatio',
        label: 'Risk Ratio',
        render: (item: any) => (
          <RiskRatioDisplay
            before={item?.riskRatioBefore}
            after={item?.riskRatioAfter}
            liquidationRiskRatio={currentDeepBookPool?.liquidationRiskRatio}
            minBorrowRiskRatio={currentDeepBookPool?.minBorrowRiskRatio}
            minWithdrawRiskRatio={currentDeepBookPool?.minWithdrawRiskRatio}
          />
        )
      },
      {
        key: 'tx',
        label: 'Txns',
        render: (item: any) => (
          <HStack
            justify="flex-end"
            gap="4px"
            onClick={() => {
              window.open(getExplorerUrl(item?.tx, 'tx'), '_blank')
            }}
            _hover={{
              cursor: 'pointer',
              svg: {
                fill: 'primary'
              },
              '&>p': {
                color: 'primary',
                textDecoration: 'underline'
              }
            }}
          >
            <Text fontSize="12px">{item?.tx ? `${item.tx.slice(0, 3)}...${item.tx.slice(-3)}` : '-'}</Text>
          </HStack>
        )
      }
    ],
    [getExplorerUrl, currentDeepBookPool]
  )

  // ===== Render Mobile or Desktop =====
  if (isApp) {
    return (
      <>
        <MobileOrderList
          dataSource={dataSource}
          fields={mobileFields}
          loading={!currentAccount?.address ? false : deepBookLiquidationRecordsLoading}
          noDataText="No liquidation history yet"
          noDataType={!currentAccount?.address ? 'nowallet' : 'nodata'}
          onWalletConnect={() => onWalletModal(true)}
          showProgress={false}
          headerRight={(item: any) => {
            const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
            const formattedTime = item?.timestamp
              ? dayjs(item.timestamp * 1000)
                  .tz(browserTimezone)
                  .format('MMM D YYYY h:mm:ss A')
              : '-'
            return (
              <VStack alignItems="flex-end" gap="4px">
                <Text fontSize="12px" color="text_caption">
                  {formattedTime}
                </Text>
                <StatusTag type={item?.status} />
              </VStack>
            )
          }}
        />

        {/* 加载更多指示器 - 移动端 */}
        {hasMore && <LoadMoreIndicator ref={loadMoreRef} isLoadingMore={isLoadingMore} hasMore={hasMore} dataLength={dataSource?.length || 0} />}
      </>
    )
  }

  return (
    <Box ref={scrollContainerRef} w="100%" h="100%" display="flex" flexDirection="column" overflow="auto">
      <Table
        dataSource={dataSource}
        columns={getColumns(getExplorerUrl, currentDeepBookPool) as any}
        loading={!currentAccount?.address ? false : deepBookLiquidationRecordsLoading}
        fixedHeader
        headBg={'bg_secondary'}
        trPadding="4px"
        rowStyle={{
          _hover: {
            borderRadius: '6px !important',
            'td:first-of-type': {
              borderRadius: '6px 0 0 6px !important'
            },
            'td:last-of-type': {
              borderRadius: '0 6px 6px 0 !important'
            }
          }
        }}
        tableContainerWrapStyle={{
          h: '100%'
        }}
        sx={{
          'thead tr > th:first-of-type': {
            pl: '12px !important'
          },
          'tbody tr td:first-of-type': {
            pl: '12px !important'
          },
          'thead tr > th:last-of-type': {
            pr: '12px !important'
          },
          'tbody tr td:last-of-type': {
            pr: '12px !important'
          }
        }}
        noData={
          !currentAccount?.address ? (
            <NoData imgSize="100px" type="nowallet" noBorder bg="none" onboard={() => onWalletModal(true)} />
          ) : dataSource?.length == 0 ? (
            <NoData imgSize="100px" type="nodata" text="No liquidation history yet" noBorder bg="none" />
          ) : undefined
        }
        loadMoreIndicator={{ loadMoreRef, isLoadingMore, hasMore, cursor, dataSource }}
      />
    </Box>
  )
}

const getColumns = (getExplorerUrl: ReturnType<typeof useExplorer>['getExplorerUrl'], currentDeepBookPool?: any) => {
  return [
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Market
        </Text>
      ),
      key: '#',
      thConfig: {
        w: '20%'
      },
      render: (item: any, index?: number) => (
        <HStack h="32px" gap="4px">
          <CoinPairInfo
            poolInfo={{
              displayTokenA: item?.baseAssets,
              displayTokenB: item?.quoteAssets,
              poolAddress: item?.poolId
            }}
            symbolFontSize="12px"
            imgStyle={{
              w: '20px',
              h: '20px'
            }}
            showFee={false}
          />
          {item?.leverage && <LeverageTag leverage={item?.leverage} />}
        </HStack>
      )
    },
    {
      title: <Text fontSize="12px">Time</Text>,
      key: 'time',
      thConfig: {
        w: '18%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => {
        const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone
        const formattedTime = item?.timestamp
          ? dayjs(item.timestamp * 1000)
              .tz(browserTimezone)
              .format('MMM D YYYY h:mm:ss A')
          : '-'
        return (
          <Text w="100%" textAlign="left" fontSize="12px" color="text_caption">
            {formattedTime}
          </Text>
        )
      }
    },
    {
      title: (
        <Text color="text_paragraph" fontSize="12px" fontWeight="500">
          Status
        </Text>
      ),
      key: 'status',
      thConfig: {
        w: '10%'
      },
      tdConfig: {
        textAlign: 'left !important' as const
      },
      render: (item: any) => <StatusTag type={item?.status} />
    },
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Liq. price
        </Text>
      ),
      key: 'liqPrice',
      thConfig: {
        w: '10%',
        textAlign: 'left' as const
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => (
        <Text w="100%" textAlign="left" fontSize="12px" color="text_caption">
          {item?.liqPrice || '-'}
        </Text>
      )
    },
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Debt Repaid
        </Text>
      ),
      key: 'debtRepaid',
      thConfig: {
        w: '12%',
        textAlign: 'left' as const
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => (
        <Text w="100%" textAlign="left" fontSize="12px" color="text_caption">
          {formatNumber(item?.debtRepaid?.amount)} {item?.debtRepaid?.symbol}
        </Text>
      )
    },
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Asset Decreased
        </Text>
      ),
      key: 'assetDecreased',
      thConfig: {
        w: '12%',
        textAlign: 'left' as const
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => (
        <Text w="100%" textAlign="left" fontSize="12px" color="text_caption">
          {formatNumber(item?.assetDecreased?.amount)} {item?.assetDecreased?.symbol}
        </Text>
      )
    },
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Risk Ratio
        </Text>
      ),
      key: 'riskRatio',
      thConfig: {
        w: '12%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => (
        <RiskRatioDisplay
          before={item?.riskRatioBefore}
          after={item?.riskRatioAfter}
          liquidationRiskRatio={currentDeepBookPool?.liquidationRiskRatio}
          minBorrowRiskRatio={currentDeepBookPool?.minBorrowRiskRatio}
          minWithdrawRiskRatio={currentDeepBookPool?.minWithdrawRiskRatio}
        />
      )
    },
    {
      title: <Text fontSize="12px">Txns</Text>,
      key: 'tx',
      thConfig: {
        w: '6%',
        textAlign: 'left' as const
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => (
        <HStack
          w="100%"
          justify="flex-start"
          gap="4px"
          cursor="pointer"
          _hover={{
            cursor: 'pointer',
            svg: {
              fill: 'primary'
            },
            '& p': {
              color: 'primary',
              textDecoration: 'underline dotted'
            }
          }}
          sx={{ svg: { _hover: { fill: 'primary' } } }}
        >
          <AddressCopyLink
            hasUnderline={false}
            address={item?.tx}
            showLink={false}
            subStringLengthStart={3}
            color="text_caption"
            onClickLink={() => window.open(getExplorerUrl(item.tx, 'tx'), '_blank')}
          />
        </HStack>
      )
    }
  ]
}
