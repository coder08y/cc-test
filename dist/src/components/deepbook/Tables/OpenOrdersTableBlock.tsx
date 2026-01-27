import useDeepBookOrderActions from '@/hooks/deepbook/useDeepBookOrderActions'
import { CetusTooltip } from '@cetus/design'
import { useAccountStore } from '@cetus/stores'
import { Icon, NoData, NumericFormatInput, Table, VaulDrawer } from '@cetus/ui-kit'
import { d, formatNumber, formatNumberWithDown } from '@cetus/utils'
import { Box, Button, HStack, Portal, Progress, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSideFilter } from '../../../hooks/deepbook/useSideFilter'
import CoinPairInfo from '../../common/CoinPairInfo'
// import TypeCon from '../common/proModeAndChart/ProModeTradeTab/TypeCon'
import CombinedFilter from '../../common/CombinedFilter'
import SideBadge from '../SideBadge'

import useMarginOrderActions from '@/hooks/deepbook/margin/useMarginOrderActions'
import useDeepbookModifyOrder from '@/hooks/deepbook/useDeepbookModifyOrder'
import useGetDeepBookOpenOrders from '@/hooks/deepbook/useGetDeepBookOpenOrders'
import useDeepBookStore from '@/store/deepbook'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import MobileOrderList, { MobileOrderListField } from '../MobileOrderList'

export default function OpenOrdersTableBlock({
  cancelAllOrder,
  isShowCancelAll,
  sideType,
  setSideType,
  instrumentType,
  setInstrumentType,
  orderType
}: {
  cancelAllOrder: () => void
  isShowCancelAll: boolean
  sideType: string
  setSideType: (val: string) => void
  instrumentType: string
  setInstrumentType: (val: string) => void
  orderType: 'spot' | 'margin'
}) {
  // ===== Stores & Hooks =====
  const {
    deepBookOpenOrders,
    cancelOrderLoading,
    modifyOrderLoading,
    orderListLoading,
    currentDeepBookPool,
    isCheckedAllMarkets,
    setDeepBookOpenOrders
  } = useDeepBookStore()
  const { cancelOrder } = useDeepBookOrderActions()
  const { currentAccount, onWalletModal } = useAccountStore()
  const { type, handleTypeChangeDirect, filterOrders } = useSideFilter()
  const { isApp } = useWindowWidth()
  const { getDeepBookOpenOrders, getDeepBookAllOpenOrders } = useGetDeepBookOpenOrders()
  const { refreshDataAfterOrder } = useMarginOrderActions()
  // 在 H5 下使用父组件传递的筛选状态
  const effectiveType = isApp ? sideType : type
  const effectiveSetType = isApp ? setSideType : handleTypeChangeDirect

  // ===== State =====
  // const [instrumentType, setInstrumentType] = useState('All')
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [errorTipPosition, setErrorTipPosition] = useState<{ top: number; right: number } | null>(null)
  const [isMobileEditDrawerOpen, setMobileEditDrawerOpen] = useState(false)

  const editInputRef = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const scrollContainerRef = useRef<HTMLDivElement>(null) // 滚动容器引用

  // ===== data source =====
  const dataSource = useMemo(() => {
    let list = [...deepBookOpenOrders]

    if (instrumentType && !instrumentType.split(',').includes('All')) {
      const instruments = instrumentType.split(',')
      list = list.filter((order: any) => instruments.includes(order.instrument))
    }

    if (effectiveType && !effectiveType.split(',').includes('All')) {
      const types = effectiveType.split(',')
      list = list.filter((order: any) => types.includes(order.side))
    }

    return list.sort((a: any, b: any) => b.expireTimestamp - a.expireTimestamp)
  }, [deepBookOpenOrders, instrumentType, effectiveType])

  // ===== 使用通用的加载更多 hook =====
  // const PAGE_SIZE = 20 // 统一的分页大小（与 API 默认 limit 一致）
  // const { loadMoreRef, isLoadingMore, cursor, hasMore, setCursor, setHasMore } = useLoadMore({
  //   onLoadMore: async () => {
  //     let result
  //     if (isCheckedAllMarkets) {
  //       result = await getDeepBookAllOpenOrders(false, cursor || undefined, true, orderType === 'margin')
  //     } else {
  //       // getDeepBookOpenOrders 支持 cursor 参数，用于加载更多
  //       // 参数顺序：poolInfo, account, isMarginPool, isRefresh, eventCursor, isLoadMore
  //       result = await getDeepBookOpenOrders(currentDeepBookPool, undefined, orderType === 'margin', false, cursor || undefined, true)
  //     }

  //     if (result && result.list && result.list.length > 0) {
  //       setDeepBookOpenOrders([...deepBookOpenOrders, ...result.list])
  //       setCursor(result.cursor || null)
  //       setHasMore(result.hasMore !== false)
  //     } else {
  //       setHasMore(false)
  //     }
  //   },
  //   enabled: true,
  //   dataLength: dataSource?.length || 0,
  //   isInitialLoading: orderListLoading,
  //   scrollContainerRef
  // })

  // 当 orderType 变化时，重置 cursor 和 hasMore 状态（数据获取由父组件统一处理）
  const prevOrderTypeRef = useRef<'spot' | 'margin'>(orderType)
  const prevDataLengthRef = useRef<number>(deepBookOpenOrders?.length || 0)

  // useEffect(() => {
  //   if (prevOrderTypeRef.current !== orderType) {
  //     prevOrderTypeRef.current = orderType
  //     setCursor(null)
  //     setHasMore(true)
  //   }
  // }, [orderType, setCursor, setHasMore])

  // 当数据被清空时（比如切换 tab），重置 cursor
  // useEffect(() => {
  //   const currentLength = deepBookOpenOrders?.length || 0
  //   if (prevDataLengthRef.current > 0 && currentLength === 0) {
  //     // 数据被清空，重置 cursor
  //     setCursor(null)
  //     setHasMore(true)
  //   }
  //   prevDataLengthRef.current = currentLength
  // }, [deepBookOpenOrders?.length, setCursor, setHasMore])

  // 监听账号切换，清除编辑状态
  useEffect(() => {
    // 切换账号时清除编辑状态
    setEditingOrderId(null)
    setEditValue('')
    setErrorTipPosition(null)
    setMobileEditDrawerOpen(false)
  }, [currentAccount?.address])

  // 初始化 cursor
  // useInitCursor(deepBookOpenOrders, cursor, setCursor, setHasMore, 'OpenOrders', PAGE_SIZE)

  // ===== edit validation =====
  const editingOrder = useMemo<any>(
    () => deepBookOpenOrders.find((order: any) => order.orderId === editingOrderId),
    [deepBookOpenOrders, editingOrderId]
  )

  const editValidation = useMemo(() => {
    if (!editingOrderId) {
      return { minQuantity: '0', maxQuantity: '0', isValidQuantity: false, decimals: 0, minSize: '0', baseSymbol: '', errorMessage: '' }
    }

    if (!editingOrder) {
      return { minQuantity: '0', maxQuantity: '0', isValidQuantity: false, decimals: 0, minSize: '0', baseSymbol: '', errorMessage: '' }
    }

    const lotSize = editingOrder.lotSize || 0
    const min = d(editingOrder.filledQuantity || 0)
    const max = d(editingOrder.originalQuantity || 0)
    const decimals = editingOrder?.amountDecimals ?? 0
    const minSize = d(editingOrder?.minSize || '0')
    const baseSymbol = editingOrder?.baseAssets?.symbol || editingOrder?.baseAsset || ''

    const useMin = min.lte(minSize) ? minSize : min

    let isValid = false
    let errorMessage = ''

    if (editValue !== '') {
      try {
        const editAmount = d(editValue)

        // 优先检查是否满足最小订单数量限制（合约限制）
        if (minSize.gt(0) && editAmount.lt(minSize)) {
          errorMessage = `Order volume must be greater than ${formatNumber(minSize.toString())} ${baseSymbol}`
        }
        // 检查是否大于已填充数量
        else if (editAmount.lt(useMin)) {
          errorMessage = `Modify quantity between ${formatNumber(useMin.toString())} - ${formatNumber(max.toString())}`
        }
        // 检查是否小于等于原始数量
        else if (editAmount.gt(max)) {
          errorMessage = `Modify quantity between ${formatNumber(useMin.toString())} - ${formatNumber(max.toString())}`
        }
        //输入数量必须得是lot size倍数
        else if (d(editAmount || '0').gt('0') && Number(editAmount) % Number(lotSize) !== 0 && Number(lotSize) >= 10) {
          errorMessage = `Amount must be a multiple of ${lotSize}, for example ${d(
            formatNumberWithDown(
              d(editAmount || '0')
                .div(d(lotSize))
                .toString(),
              0,
              true
            )
          )
            .mul(lotSize)
            .toString()} ${baseSymbol}`
        }
        // 所有检查通过
        else {
          isValid = editAmount.gte(useMin) && editAmount.lte(max) && (minSize.isZero() || editAmount.gte(minSize))
        }
      } catch (error) {
        isValid = false
        errorMessage = `Modify quantity between ${formatNumber(useMin.toString())} - ${formatNumber(max.toString())}`
      }
    }

    return {
      minQuantity: formatNumber(useMin.toString()),
      maxQuantity: formatNumber(max.toString()),
      isValidQuantity: isValid,
      decimals,
      minSize: minSize.toString(),
      baseSymbol,
      errorMessage
    }
  }, [editingOrderId, editValue, editingOrder])

  // ===== update error tip position =====
  useEffect(() => {
    if (!editingOrderId || editValidation.isValidQuantity) {
      setErrorTipPosition(null)
      return
    }

    const updatePosition = () => {
      const element = editInputRef.current[editingOrderId]
      if (element) {
        const rect = element.getBoundingClientRect()
        setErrorTipPosition({
          top: rect.top - 40,
          right: window.innerWidth - rect.right
        })
      }
    }

    setTimeout(updatePosition, 0)
    window.addEventListener('scroll', updatePosition, true)
    window.addEventListener('resize', updatePosition)

    return () => {
      window.removeEventListener('scroll', updatePosition, true)
      window.removeEventListener('resize', updatePosition)
    }
  }, [editingOrderId, editValidation.isValidQuantity])

  // ===== edit operation =====
  const handleEditClick = useCallback(
    (order: any) => {
      setEditingOrderId(order.orderId)
      const decimals = order?.amountDecimals ?? 0
      const formattedValue = formatNumberWithDown(order?.originalQuantity ?? '0', decimals, true)
      setEditValue(formattedValue)
      setErrorTipPosition(null)
      if (isApp) {
        setMobileEditDrawerOpen(true)
      }
    },
    [isApp]
  )

  const { modifyOrder } = useDeepbookModifyOrder()

  const handleConfirmEdit = useCallback(
    async (item: any) => {
      const decimals = item?.amountDecimals ?? 0
      const normalizedValue = formatNumberWithDown(editValue || '0', decimals, true)
      const originalValue = formatNumberWithDown(item?.originalQuantity ?? '0', decimals, true)

      if (normalizedValue === originalValue) {
        setEditingOrderId(null)
        setEditValue('')
        setErrorTipPosition(null)
        setMobileEditDrawerOpen(false)
        return
      }

      await modifyOrder(
        {
          address: item.address,
          baseAssets: item.baseAssets,
          quoteAssets: item.quoteAssets
        },
        item.orderId,
        editValue,
        orderType
      )
      if (orderType === 'margin') {
        await refreshDataAfterOrder()
      }

      setEditingOrderId(null)
      setEditValue('')
      setErrorTipPosition(null)
      setMobileEditDrawerOpen(false)
    },
    [editValue, modifyOrder, refreshDataAfterOrder]
  )

  const handleCancelEdit = useCallback(() => {
    setEditingOrderId(null)
    setEditValue('')
    setErrorTipPosition(null)
    setMobileEditDrawerOpen(false)
  }, [])

  // ===== Mobile fields configuration =====
  const mobileFields: MobileOrderListField[] = useMemo(
    () => [
      {
        key: 'instrumentType',
        label: 'Instrument',
        render: (item: any) => (
          <Box
            borderRadius={'4px'}
            bg="primary_opacity.10"
            p="0 8px"
            color="primary"
            height={'20px'}
            lineHeight={'20px'}
            display={'inline-block'}
            sx={{
              ...(item?.instrument === 'Margin' && {
                background: 'linear-gradient( 270deg, rgba(104,255,216,0.1) 0%, rgba(255,80,115,0.1) 99.99%) !important'
              })
            }}
          >
            <Text
              fontSize="12px"
              sx={{
                ...(item?.instrument === 'Margin'
                  ? {
                      background: 'linear-gradient( 270deg, rgba(104,255,216,1) 0%, rgba(255,80,115,1) 99.99%) !important',
                      '-webkit-background-clip': 'text !important',
                      '-webkit-text-fill-color': 'transparent !important'
                    }
                  : {
                      color: 'primary'
                    })
              }}
            >
              {item?.instrument}
            </Text>
          </Box>
        )
      },
      {
        key: 'price',
        label: 'Price',
        render: (item: any) => (
          <HStack justify="flex-end" gap="4px">
            <Text fontSize="12px" color="text_caption">
              {formatNumber(item?.price)}
            </Text>
            <Text fontSize="12px" color="text_caption">
              {item?.quoteAssets?.symbol || ''}
            </Text>
          </HStack>
        )
      },
      {
        key: 'filled',
        label: 'Filled',
        render: (item: any) => {
          return (
            <Box position="relative" w="100%" display="flex" justifyContent="flex-end">
              <Text fontSize="12px" color="text_caption">
                {formatNumber(item?.filledQuantity)}
              </Text>
            </Box>
          )
        }
      },
      {
        key: 'quantity',
        label: 'Quantity',
        render: (item: any) => {
          const isEditing = editingOrderId === item.orderId
          const amountDecimals = item?.amountDecimals ?? 0
          // 检测reduce-only模式（从池子数据中获取）
          const isReduceOnlyMode = currentDeepBookPool?.isReduceOnly || false
          // 在reduce-only模式下禁用编辑功能
          const canEditQuantity = isReduceOnlyMode ? false : item?.minSize ? d(item.originalQuantity || 0).gte(item.minSize) : true

          if (isApp) {
            return (
              <Box position="relative" w="100%" display="flex" justifyContent="flex-end">
                <HStack justify="flex-end" gap="4px">
                  <Text fontSize={'12px'} color="text_caption">
                    {formatNumber(item?.originalQuantity)}
                  </Text>
                  {canEditQuantity && (
                    <Icon
                      xlinkHref="#icon-icon_edit1"
                      svgFill="text_paragraph"
                      svgHover="text_paragraph"
                      fontSize="16px"
                      ml="2px"
                      onClick={() => handleEditClick(item)}
                      showHover={false}
                    />
                  )}
                </HStack>
              </Box>
            )
          }

          return (
            <Box position="relative" w="100%" display="flex" justifyContent="flex-end">
              {isEditing ? (
                <Box
                  position="relative"
                  zIndex={999}
                  ref={el => {
                    editInputRef.current[item.orderId] = el
                  }}
                >
                  <HStack justify="flex-end" gap="4px">
                    <NumericFormatInput
                      value={editValue}
                      onChange={value => {
                        setEditValue(value)
                      }}
                      decimals={amountDecimals}
                      autoFocus
                      style={{
                        width: '88px',
                        height: '24px',
                        fontSize: '12px',
                        padding: '0 8px',
                        borderRadius: '4px',
                        border: `1px solid ${editValidation.isValidQuantity ? 'var(--chakra-colors-primary)' : 'var(--chakra-colors-primary_red)'}`,
                        background: 'var(--chakra-colors-primary_opacity-20)',
                        color: 'var(--chakra-colors-text_caption)',
                        textAlign: 'right',
                        outline: 'none'
                      }}
                    />
                    <Icon
                      xlinkHref="#icon-icon_close"
                      svgFill="text_paragraph"
                      svgHover="text_paragraph"
                      fontSize="16px"
                      ml="2px"
                      onClick={handleCancelEdit}
                      showHover={false}
                    />
                    <Icon
                      xlinkHref="#icon-icon_check"
                      svgFill={editValidation.isValidQuantity && !modifyOrderLoading ? 'primary' : 'text_paragraph'}
                      svgHover={editValidation.isValidQuantity && !modifyOrderLoading ? 'primary' : 'text_paragraph'}
                      fontSize="16px"
                      onClick={editValidation.isValidQuantity && !modifyOrderLoading ? () => handleConfirmEdit(item) : undefined}
                      showHover={editValidation.isValidQuantity && !modifyOrderLoading}
                      cursor={editValidation.isValidQuantity && !modifyOrderLoading ? 'pointer' : 'not-allowed'}
                      opacity={editValidation.isValidQuantity && !modifyOrderLoading ? 1 : 0.6}
                    />
                  </HStack>
                </Box>
              ) : (
                <HStack justify="flex-end" gap="4px">
                  <Text fontSize={'12px'} color="text_caption">
                    {formatNumber(item?.originalQuantity)}
                  </Text>
                  {canEditQuantity && (
                    <Icon
                      xlinkHref="#icon-icon_edit1"
                      svgFill="text_paragraph"
                      svgHover="text_paragraph"
                      fontSize="16px"
                      ml="2px"
                      onClick={() => handleEditClick(item)}
                      showHover={false}
                    />
                  )}
                </HStack>
              )}
            </Box>
          )
        }
      }
    ],
    [editingOrderId, editValue, editValidation, modifyOrderLoading, handleEditClick, handleConfirmEdit, handleCancelEdit, isApp]
  )

  // ===== Render Mobile or Desktop =====
  if (isApp) {
    return (
      <>
        <MobileOrderList
          dataSource={dataSource}
          fields={mobileFields}
          loading={!currentAccount?.address ? false : orderListLoading}
          noDataText="No open orders in the last 3 months"
          noDataType={!currentAccount?.address ? 'nowallet' : 'nodata'}
          onWalletConnect={() => onWalletModal(true)}
          showProgress={true}
          actions={(item: any) => (
            <Button
              variant="outline"
              borderRadius="6px"
              p="2px 6px"
              h={'24px'}
              fontSize="12px"
              color="text_paragraph"
              onClick={() => cancelOrder(item, item.orderId, item.instrument == 'Margin' ? 'margin' : 'spot')}
              isLoading={cancelOrderLoading === item.orderId}
            >
              Cancel
            </Button>
          )}
        />

        {/* 加载更多指示器 - 移动端 */}
        {/* <LoadMoreIndicator ref={loadMoreRef} isLoadingMore={isLoadingMore} hasMore={hasMore} dataLength={dataSource?.length || 0} /> */}

        {isApp && editingOrder && (
          <VaulDrawer
            key={`drawer-bottom-edit-${editingOrder?.orderId ?? 'none'}`}
            isOpen={isMobileEditDrawerOpen}
            onClose={handleCancelEdit}
            placement="bottom"
            wrapStyle={{
              pb: '24px',
              minH: 'auto'
            }}
          >
            <Box display="flex" flexDirection="column" gap="16px">
              <Box>
                <Text fontSize="14px" fontWeight="500" color="white" mb="12px">
                  Quantity
                </Text>
                <NumericFormatInput
                  value={editValue}
                  onChange={value => {
                    setEditValue(value)
                  }}
                  decimals={editingOrder?.amountDecimals ?? 0}
                  autoFocus
                  style={{
                    width: '100%',
                    height: '36px',
                    fontSize: '12px',
                    padding: '0 12px',
                    borderRadius: '8px',
                    border: `1px solid ${editValidation.isValidQuantity ? 'var(--chakra-colors-primary)' : 'var(--chakra-colors-primary_red)'}`,
                    background: 'var(--chakra-colors-primary_opacity-10)',
                    color: 'var(--chakra-colors-text_caption)',
                    textAlign: 'left',
                    outline: 'none'
                  }}
                />
                {!editValidation.isValidQuantity && editValidation.errorMessage && (
                  <Text color="primary_red" fontSize="12px" mt="4px">
                    {editValidation.errorMessage}
                  </Text>
                )}
              </Box>
              <Button
                variant="solid"
                w="100%"
                h="38px"
                borderRadius="6px"
                fontSize="14px"
                isDisabled={!editValidation.isValidQuantity || modifyOrderLoading || !editingOrder}
                isLoading={modifyOrderLoading}
                onClick={() => {
                  if (editingOrder && editValidation.isValidQuantity && !modifyOrderLoading) {
                    handleConfirmEdit(editingOrder)
                  }
                }}
              >
                Confirm
              </Button>
            </Box>
          </VaulDrawer>
        )}
      </>
    )
  }

  return (
    <>
      <Box ref={scrollContainerRef} w="100%" h="100%" display="flex" flexDirection="column" overflow="auto">
        <Table
          dataSource={dataSource}
          columns={getColumns({
            instrumentType,
            handleInstrumentTypeChange: setInstrumentType,
            type: effectiveType,
            handleTypeChange: effectiveSetType,
            cancelOrder,
            cancelOrderLoading,
            modifyOrderLoading,
            editingOrderId,
            editValue,
            setEditValue,
            handleEditClick,
            handleConfirmEdit,
            handleCancelEdit,
            editInputRef,
            isShowCancelAll,
            cancelAllOrder,
            editValidation,
            orderType
          })}
          loading={!currentAccount?.address ? false : orderListLoading}
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
            ) : dataSource?.length === 0 ? (
              <NoData imgSize="100px" type="nodata" text="No open orders in the last 3 months" noBorder bg="none" />
            ) : undefined
          }
          // loadMoreIndicator={{ loadMoreRef, isLoadingMore, hasMore, cursor, dataSource }}
        />

        {/* 加载更多指示器 - 桌面端 */}
        {/* {hasMore && <LoadMoreIndicator ref={loadMoreRef} isLoadingMore={isLoadingMore} hasMore={hasMore} dataLength={dataSource?.length || 0} />} */}
      </Box>

      {editingOrderId && errorTipPosition && !editValidation.isValidQuantity && (
        <Portal>
          <Box
            position="fixed"
            top={`${errorTipPosition.top}px`}
            right={`${errorTipPosition.right}px`}
            zIndex={99999}
            h="32px"
            lineHeight="32px"
            textAlign="center"
            borderRadius="8px"
            bg="bg_secondary"
            border="1px solid"
            borderColor="border"
            px="12px"
            whiteSpace="nowrap"
          >
            <Text color="primary_red" fontSize="12px">
              {editValidation.errorMessage || `Modify quantity between ${editValidation.minQuantity} - ${editValidation.maxQuantity}`}
            </Text>
          </Box>
        </Portal>
      )}
    </>
  )
}

interface GetColumnsParams {
  instrumentType: string
  handleInstrumentTypeChange: (val: string) => void
  type: string
  handleTypeChange: (val: string) => void
  cancelOrder: (poolInfo: any, orderId: string, orderType: 'spot' | 'margin') => void | Promise<void>
  cancelOrderLoading: string | null
  modifyOrderLoading: boolean
  editingOrderId: string | null
  editValue: string
  setEditValue: (val: string) => void
  handleEditClick: (order: any) => void
  handleConfirmEdit: (item: any) => void
  handleCancelEdit: () => void
  editInputRef: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>
  isShowCancelAll: boolean
  cancelAllOrder: () => void
  editValidation: {
    minQuantity: string
    maxQuantity: string
    isValidQuantity: boolean
    decimals: number
    minSize: string
    baseSymbol: string
    errorMessage: string
  }
  orderType: 'spot' | 'margin'
}

const getColumns = ({
  instrumentType,
  handleInstrumentTypeChange,
  type,
  handleTypeChange,
  cancelOrder,
  cancelOrderLoading,
  modifyOrderLoading,
  editingOrderId,
  editValue,
  setEditValue,
  handleEditClick,
  handleConfirmEdit,
  handleCancelEdit,
  editInputRef,
  isShowCancelAll,
  cancelAllOrder,
  editValidation,
  orderType
}: GetColumnsParams) => {
  const { isApp } = useWindowWidth()
  const { currentDeepBookPool } = useDeepBookStore()
  return [
    {
      title: (
        <Text fontSize="12px" fontWeight="500">
          Market
        </Text>
      ),
      key: '#',
      thConfig: {
        w: '30%'
      },
      render: (item: any, index?: number) => {
        return (
          <HStack h="32px">
            <CoinPairInfo
              poolInfo={{
                displayTokenA: item?.baseAssets,
                displayTokenB: item?.quoteAssets,
                // poolAddress: item?.poolId
                poolAddress: item?.address
              }}
              symbolFontSize="12px"
              imgStyle={{
                w: '20px',
                h: '20px'
              }}
              showFee={false}
              // coinPairInfoWrapStyle={{
              //   p: '0px'
              // }}
            />
          </HStack>
        )
      }
    },

    {
      title: (
        <HStack justifyContent="flex-start" height="24px" fontWeight="500" gap="0px">
          <Text color="text_paragraph" fontSize="12px" fontWeight="500">
            Instrument
          </Text>
          <CombinedFilter
            filterGroups={[
              {
                label: 'Instrument',
                type: instrumentType,
                setType: handleInstrumentTypeChange,
                filterList: ['All', 'Spot', 'Margin'],
                singleSelect: true
              }
            ]}
            hideLabel={true}
            autoApply={true}
            keepOpenOnSelect={!isApp}
          />
        </HStack>
      ),
      key: 'instrument',
      thConfig: {
        w: '15%'
      },
      tdConfig: {
        textAlign: 'left !important' as const,
        justifyContent: 'flex-start'
      },
      render: (item: any) => (
        <Box
          borderRadius={'4px'}
          bg="primary_opacity.10"
          p="0 8px"
          color="primary"
          height={'20px'}
          lineHeight={'20px'}
          display={'inline-block'}
          sx={{
            ...(item?.instrument === 'Margin' && {
              background: 'linear-gradient( 270deg, rgba(104,255,216,0.1) 0%, rgba(255,80,115,0.1) 99.99%) !important'
            })
          }}
        >
          <Text
            fontSize="12px"
            sx={{
              ...(item?.instrument === 'Margin'
                ? {
                    background: 'linear-gradient( 270deg, rgba(104,255,216,1) 0%, rgba(255,80,115,1) 99.99%) !important',
                    '-webkit-background-clip': 'text !important',
                    '-webkit-text-fill-color': 'transparent !important'
                  }
                : {
                    color: 'primary'
                  })
            }}
          >
            {item?.instrument}
          </Text>
        </Box>
      )
    },

    {
      title: (
        <HStack justifyContent="flex-start" height="24px" fontWeight="500" gap="0px">
          <Text color="text_paragraph" fontSize="12px" fontWeight="500">
            Side
          </Text>
          <CombinedFilter
            filterGroups={[
              {
                label: 'Side',
                type,
                setType: handleTypeChange,
                // filterList: orderType === 'margin' ? ['Long', 'Short', 'All'] : ['Buy', 'Sell', 'All'],
                filterList: ['All', 'Buy', 'Sell'],
                singleSelect: true
              }
            ]}
            hideLabel={true}
            autoApply={true}
            keepOpenOnSelect={!isApp}
            // placement={'bottom-start'}
          />
        </HStack>
      ),
      key: 'side',
      thConfig: {
        w: '15%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => <SideBadge side={item?.side} />
    },

    {
      title: (
        <Text color="text_paragraph" fontSize="12px" textAlign="left" fontWeight="500">
          Price
        </Text>
      ),
      key: 'price',
      thConfig: {
        w: '15%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => (
        <HStack w="100%" justify="flex-start" gap="4px">
          <Text fontSize="12px" color="text_caption">
            {formatNumber(item?.price)}
          </Text>
          <Text fontSize="12px">{item?.quoteAssets?.symbol || '--'}</Text>
        </HStack>
      )
    },
    {
      title: (
        <Text color="text_paragraph" fontSize="12px" textAlign="left" fontWeight="500">
          Filled %
        </Text>
      ),
      key: 'filledPercentage',
      thConfig: {
        w: '15%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => {
        const filledQuantity = Number(item?.filledQuantity) || 0
        const originalQuantity = Number(item?.originalQuantity) || 0
        const percentage = originalQuantity > 0 ? (filledQuantity / originalQuantity) * 100 : 0
        const displayPercentage = formatNumber(percentage, 2)

        return (
          <HStack justifyContent="left" gap="4px">
            <Text color="text_caption" fontSize="12px">
              {displayPercentage}%
            </Text>
            <Progress
              w={'40px'}
              h="4px"
              value={percentage}
              bg="#282828"
              sx={{
                'div[role="progressbar"]': {
                  bg: 'primary'
                }
              }}
            />
          </HStack>
        )
      }
    },
    {
      title: (
        <HStack justifyContent="flex-start" alignItems="center" gap="4px" height="24px" fontWeight="500">
          <Text color="text_paragraph" fontSize="12px" fontWeight="500">
            Filled/Quantity
          </Text>
          <CetusTooltip
            tooltip={
              <Text fontSize="12px" lineHeight="20px">
                You can modify the order quantity. The new quantity must not exceed the current order quantity, and must be no less than the filled
                amount (or the pool’s min order size, whichever is higher)
              </Text>
            }
          >
            <Icon xlinkHref="#icon-icon_tips" svgFill="text_paragraph" fontSize="16px" />
          </CetusTooltip>
        </HStack>
      ),
      key: 'filled',
      thConfig: {
        w: '15%'
      },
      tdConfig: {
        textAlign: 'left' as const
      },
      render: (item: any) => {
        const isEditing = editingOrderId === item.orderId
        const amountDecimals = item?.amountDecimals ?? 0
        // 检测reduce-only模式（从池子数据中获取）
        const isReduceOnlyMode = currentDeepBookPool?.reduceOnly || false
        // 在reduce-only模式下禁用编辑功能
        const canEditQuantity = isReduceOnlyMode ? false : item?.minSize ? d(item.originalQuantity || 0).gte(item.minSize) : true
        return (
          <Box position="relative" w="100%" display="flex" justifyContent="flex-start">
            <HStack w="100%" justify="flex-start" gap="4px" p="4px 0px" borderRadius="4px">
              <Text color="primary">{formatNumber(item?.filledQuantity)}</Text>
              <Text>/</Text>
              {isEditing ? (
                <Box
                  position="relative"
                  zIndex={999}
                  ref={el => {
                    editInputRef.current[item.orderId] = el
                  }}
                >
                  {/* 编辑框 */}
                  <HStack justify="flex-end" gap="4px">
                    <NumericFormatInput
                      value={editValue}
                      onChange={value => {
                        setEditValue(value)
                      }}
                      decimals={amountDecimals}
                      autoFocus
                      style={{
                        width: '88px',
                        height: '24px',
                        fontSize: '12px',
                        padding: '0 8px',
                        borderRadius: '4px',
                        border: `1px solid ${editValidation.isValidQuantity ? 'var(--chakra-colors-primary)' : 'var(--chakra-colors-primary_red)'}`,
                        background: 'var(--chakra-colors-primary_opacity-20)',
                        color: 'var(--chakra-colors-text_caption)',
                        textAlign: 'right',
                        outline: 'none'
                      }}
                    />
                    <Icon
                      xlinkHref="#icon-icon_close"
                      svgFill="text_paragraph"
                      svgHover="text_paragraph"
                      fontSize="16px"
                      ml="2px"
                      onClick={handleCancelEdit}
                      showHover={false}
                    />
                    <Icon
                      xlinkHref="#icon-icon_check"
                      svgFill={editValidation.isValidQuantity && !modifyOrderLoading ? 'primary' : 'text_paragraph'}
                      svgHover={editValidation.isValidQuantity && !modifyOrderLoading ? 'primary' : 'text_paragraph'}
                      fontSize="16px"
                      onClick={editValidation.isValidQuantity && !modifyOrderLoading ? () => handleConfirmEdit(item) : undefined}
                      showHover={editValidation.isValidQuantity && !modifyOrderLoading}
                      cursor={editValidation.isValidQuantity && !modifyOrderLoading ? 'pointer' : 'not-allowed'}
                      opacity={editValidation.isValidQuantity && !modifyOrderLoading ? 1 : 0.6}
                    />
                  </HStack>
                </Box>
              ) : (
                <>
                  <Text color="text_caption">{formatNumber(item?.originalQuantity)}</Text>
                  {canEditQuantity && (
                    <Icon
                      xlinkHref="#icon-icon_edit1"
                      svgFill="text_paragraph"
                      svgHover="text_paragraph"
                      fontSize="16px"
                      ml="2px"
                      onClick={() => handleEditClick(item)}
                      showHover={false}
                    />
                  )}
                </>
              )}
            </HStack>
          </Box>
        )
      }
    },
    {
      title: (
        <Box>
          {isShowCancelAll && (
            <Text
              border="1px solid"
              borderColor="border"
              display={'inline-block'}
              whiteSpace="nowrap"
              fontSize="12px"
              _hover={{ cursor: 'pointer', color: 'primary' }}
              onClick={() => cancelAllOrder()}
              color={'text_paragraph'}
              p={'3px 6px'}
              borderRadius={'6px'}
              position={'relative'}
              top={'1px'}
            >
              Cancel All
            </Text>
          )}
        </Box>
        // <Text fontSize="12px"  fontWeight="500">
        //   Action
        // </Text>
      ),
      key: 'action',
      thConfig: {
        w: '10%'
      },
      render: (item: any) => (
        <HStack w="100%" justify="flex-end">
          <Button
            variant="outline"
            h="24px"
            borderRadius="6px"
            fontSize="12px"
            color="text_paragraph"
            p={'3px 6px'}
            onClick={() => cancelOrder(item, item.orderId, item.instrument == 'Margin' ? 'margin' : 'spot')}
            isLoading={cancelOrderLoading === item.orderId}
            _hover={{ cursor: 'pointer', color: 'primary' }}
          >
            Cancel
          </Button>
        </HStack>
      )
    }
  ]
}
