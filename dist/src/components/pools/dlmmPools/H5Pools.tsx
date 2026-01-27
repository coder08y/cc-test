import useDlmmGroupItemInteraction from '@/hooks/pool/useDlmmGroupItemInteraction'
import useDlmmGroupListInteraction from '@/hooks/pool/useDlmmGroupListInteraction'
import useCommonGlobalStore from '@/store/common/global'
import usePoolsStore from '@/store/pool'
import { DLMMPoolApiInfo } from '@/types'
import { DlmmApiPoolGroupItem } from '@/types/dlmm'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { H5MapTable, H5MapTableItem } from '@cetus/ui-kit'
import { transColumns2H5 } from '@cetus/ui-kit/src/components/H5MapTable/util'
import Pagination, { PaginationProps } from '@cetus/ui-kit/src/components/Pagination'
import { ColumnsType } from '@cetus/ui-kit/src/components/Table'
import { d } from '@cetus/utils'
import { Box, Center, FlexboxProps, StackProps, VStack } from '@chakra-ui/react'
import { useEffect, useRef, useState } from 'react'

function H5PoolsCard<T>({
  item,
  columns,
  goLiquidity,
  isOpen = false,
  onOpen,
  loading,
  itemSkeletonLength,
  itemHeight,
  index
}: {
  item: DlmmApiPoolGroupItem
  columns: any[]
  goLiquidity: (url: string, poolApiInfo: any) => void
  isOpen?: boolean
  onOpen: (groupId: string, isOpen: boolean) => void
  loading: boolean
  itemSkeletonLength?: number
  itemHeight?: FlexboxProps['flexBasis']
  index?: number
}) {
  const { allData, lessData, onExpand, isOnlyOneData, onClick, onPoolItemClick } = useDlmmGroupItemInteraction({
    data: item,
    isOpen,
    onOpen,
    goLiquidity,
    pageSize: 3
  })
  const { hasLoadMore, list, onLoadMore, containerRef, parentHeaderRef, onLoadLess } = useDlmmGroupListInteraction(allData || [], 3, isOpen, item.id)
  const { isApp } = useWindowWidth()
  const { showFilterButton } = usePoolsStore()

  // 用于存储最后一个子项的ref，以便计算垂直线高度
  const lastItemRef = useRef<HTMLDivElement>(null)
  const [verticalLineHeight, setVerticalLineHeight] = useState<number>(0)

  // 用于存储展开前的滚动位置
  const savedScrollPositionRef = useRef<number | null>(null)
  const groupElementRef = useRef<HTMLDivElement>(null)

  // 计算初始3个池子的高度（使用allData的前3个，而不是list）
  const initialList = allData?.slice(0, 3) || []
  const startingHeight =
    initialList
      ?.map((l, index) => transColumns2H5<T>(columns, { ...l, hasFee: true }, index))
      ?.reduce(
        (acc, current) =>
          d(acc)
            .plus((current?.filter(i => !i?.hidden)?.length - 1) * 16)
            .plus(22)
            .plus((current?.filter(i => !i?.hidden)?.length - 1) * 8)
            .toNumber(),
        0
      ) +
    initialList?.length * 24 +
    (hasLoadMore && allData?.length > 3 ? 32 : 0) // Show More按钮的高度

  const parentData = loading
    ? []
    : transColumns2H5<T>(columns, {
        ...item,
        hasFee: isOnlyOneData,
        isParent: true,
        isOpen,
        onExpand: onClick,
        ...(isOnlyOneData ? allData?.[0] : {})
      } as any)

  // 滚动监听，当表头滑出屏幕时自动收起
  // 使用ref来跟踪是否刚刚展开，避免冲突
  const isJustOpenedRef = useRef(false)

  // 保存和恢复滚动位置
  useEffect(() => {
    if (isOpen) {
      // 展开时保存当前滚动位置
      if (groupElementRef.current) {
        const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
        if (scrollContainer) {
          savedScrollPositionRef.current = scrollContainer.scrollTop
        } else {
          savedScrollPositionRef.current = window.scrollY || window.pageYOffset || document.documentElement.scrollTop
        }
      }
      isJustOpenedRef.current = true
      // 延迟重置标志，避免在展开时立即触发
      const timer = setTimeout(() => {
        isJustOpenedRef.current = false
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      // 关闭时滚动到池子元素位置，确保用户能看到原来的池子
      if (groupElementRef.current && savedScrollPositionRef.current !== null) {
        // 等待 DOM 更新完成（内容高度变化）
        const timer = setTimeout(() => {
          if (groupElementRef.current) {
            const scrollContainer = document.querySelector('.scroll-container') as HTMLElement
            const fixedHeaderHeight = 196 // 顶部固定元素高度：137 + 48

            if (scrollContainer) {
              // 计算元素相对于滚动容器的位置
              const rect = groupElementRef.current.getBoundingClientRect()
              const containerRect = scrollContainer.getBoundingClientRect()
              const elementTop = rect.top - containerRect.top + scrollContainer.scrollTop

              // 滚动到元素位置，减去固定头部高度
              scrollContainer.scrollTo({
                top: elementTop - fixedHeaderHeight,
                behavior: 'smooth'
              })
            } else {
              // 如果没有找到滚动容器，使用 window 滚动
              const rect = groupElementRef.current.getBoundingClientRect()
              const elementTop = rect.top + window.scrollY

              window.scrollTo({
                top: elementTop - fixedHeaderHeight,
                behavior: 'smooth'
              })
            }
          }
          savedScrollPositionRef.current = null
        }, 150) // 延迟以确保 DOM 完全更新（内容高度变化）

        return () => clearTimeout(timer)
      }
    }
  }, [isOpen])

  // 计算垂直线高度：延伸到最后一个子项的水平连接线位置
  useEffect(() => {
    if (isOpen && !isOnlyOneData && lastItemRef.current) {
      const updateLineHeight = () => {
        if (lastItemRef.current) {
          // 获取最后一个子项的offsetTop，再加上水平连接线的位置(10px)
          const height = lastItemRef.current.offsetTop + 10
          setVerticalLineHeight(height)
        }
      }

      // 延迟执行以确保DOM已渲染
      const timer = setTimeout(updateLineHeight, 100)

      return () => clearTimeout(timer)
    }
  }, [isOpen, isOnlyOneData, list])

  useEffect(() => {
    if (!isOpen || isOnlyOneData || !parentHeaderRef?.current) return

    // 延迟启动监听，避免在展开时立即触发
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(
        entries => {
          const entry = entries[0]
          // 如果表头完全滑出视口，且不是刚刚展开的状态，自动收起
          if (!isJustOpenedRef.current && !entry.isIntersecting && entry.boundingClientRect.bottom < 0) {
            onOpen(item.id, false)
          }
        },
        {
          root: null, // 使用视口作为根
          rootMargin: '0px',
          threshold: 0
        }
      )

      if (parentHeaderRef?.current) {
        observer.observe(parentHeaderRef?.current)
      }

      return () => {
        observer.disconnect()
      }
    }, 500) // 延迟500ms启动监听

    return () => {
      clearTimeout(timer)
    }
  }, [isOpen, isOnlyOneData, item.id, onOpen])

  return (
    <VStack ref={groupElementRef} gap="0" bg={isOpen ? 'bg_secondary' : 'transparent'} w="100%" position="relative" id={`pool-group-${item.id}`}>
      <Box
        ref={parentHeaderRef}
        position={isOpen && !isOnlyOneData ? 'sticky' : 'relative'}
        top={isOpen && !isOnlyOneData ? '196px' : 'auto'}
        zIndex={isOpen && !isOnlyOneData ? 10 : 'auto'}
        w="100%"
        bg={isOpen ? 'bg_secondary' : 'transparent'}
        transition="all 0.2s"
      >
        <H5MapTableItem
          data={isOpen && parentData.length > 0 ? [parentData[0]] : parentData}
          loading={loading}
          skeletonLength={itemSkeletonLength}
          onClick={onClick}
          itemHeight={itemHeight}
          style={{
            w: '100%',
            p: '16px 12px',
            bg: isOpen ? 'text_highlight_opacity.10' : 'transparent',
            gap: '12px',
            ...(isOpen && {
              h: '52px'
            })
          }}
        />
      </Box>
      {!isOnlyOneData && isOpen && (
        <>
          <Box
            as="div"
            w="100%"
            ref={containerRef}
            position="relative"
            h={`${startingHeight}px`}
            overflowY="auto"
            sx={{
              '&::-webkit-scrollbar': { display: 'none' }
            }}
          >
            <VStack w="100%" p="12px" gap="24px" position="relative" pl="12px">
              {/* 垂直连接线 - 只延伸到最后一个子项的水平线位置 */}
              <Box
                position="absolute"
                left="22px"
                top="0"
                h={verticalLineHeight > 0 ? `${verticalLineHeight}px` : '0'}
                w="1px"
                bg="border"
                zIndex={0}
              />
              {Array.isArray(allData) &&
                allData?.length > 0 &&
                allData?.map((i, index) => {
                  const isLastItem = index === allData.length - 1
                  return (
                    <Box key={i?.poolId} w="100%" position="relative" pl="27px" ref={isLastItem ? lastItemRef : undefined}>
                      {/* 每个子列表项第一项的水平连接线 */}
                      <Box position="absolute" left="11px" top="10px" w="8px" h="1px" bg="border" zIndex={1} />
                      <H5MapTableItem
                        data={loading ? [] : transColumns2H5<T>(columns, { ...i, hasFee: true }, index)}
                        loading={loading}
                        skeletonLength={itemSkeletonLength}
                        onClick={() => {
                          onPoolItemClick(i, i)
                        }}
                        itemHeight={itemHeight}
                      />
                    </Box>
                  )
                })}
              {/* {hasLoadMore ? (
                <Center h='20px' mt='4px'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={onLoadMore}
                    color='text_paragraph'
                    h='20px'
                    borderRadius={'10px'}
                    fontSize='10px'
                    bg='transparent'
                    _hover={{ bg: 'transparent' }}
                    _active={{ bg: 'transparent' }}
                    gap='2px'
                  >
                    Show More
                    <Icon xlinkHref='#icon-detail' fontSize='10px' transform='rotate(90deg)' />
                  </Button>
                </Center>
              ) : list?.length > 3 ? (
                <Center h='20px' mt='4px'>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={onLoadLess}
                    color='text_paragraph'
                    h='20px'
                    borderRadius={'10px'}
                    fontSize='10px'
                    bg='transparent'
                    _hover={{ bg: 'transparent' }}
                    _active={{ bg: 'transparent' }}
                    gap='2px'
                  >
                    Show Less
                    <Icon xlinkHref='#icon-detail' fontSize='10px' transform='rotate(270deg)' />
                  </Button>
                </Center>
              ) : null} */}
            </VStack>
          </Box>
        </>
      )}
    </VStack>
  )
}
interface H5PoolsProps<T> {
  dataSource: T[]
  itemSkeletonLength?: number
  skeletonLength?: number
  columns: ColumnsType<T>[]
  rowKey?: string | ((record: T) => string)
  onBodyHover?: () => void
  onBodyLeave?: () => void
  loading: boolean
  haveDividingLine?: boolean
  pagination?: PaginationProps
  wrapStyle?: StackProps
  itemHeight?: FlexboxProps['flexBasis']
  isShowBorder?: boolean
  isWatch?: boolean
  openPoolsGroup: Record<string, boolean> | undefined
  goLiquidity: (url: string, poolApiInfo: any) => void
  onOpenPoolsGroup: (groupId: string, isOpen: boolean) => void
}

function H5Pools<T>({
  dataSource,
  columns,
  itemSkeletonLength,
  skeletonLength = 3,
  rowKey,
  loading,
  pagination,
  wrapStyle,
  onBodyHover,
  onBodyLeave,
  itemHeight,
  isShowBorder = true,
  haveDividingLine = true,
  openPoolsGroup,
  goLiquidity,
  isWatch,
  onOpenPoolsGroup
}: H5PoolsProps<T>) {
  const skeletonData = new Array(skeletonLength).fill(0)
  const { setBackUrl } = useCommonGlobalStore()
  return isWatch ? (
    <VStack w="100%" gap="4px" px="12px">
      <H5MapTable<DLMMPoolApiInfo>
        rowKey="poolAddress"
        dataSource={dataSource}
        columns={columns}
        loading={loading}
        itemSkeletonLength={7}
        itemHeight="16px"
        wrapStyle={{
          gap: '16px',
          sx: {
            '& > div > div': {
              gap: '12px'
            }
          }
        }}
        // itemHeight='30px'
        rowStyle={(_, index) => ({
          w: '100%',
          p: '0px',
          mt: '0px'
        })}
        onRowClick={item => {
          setBackUrl('/pools')
          // console.log(item, 'item')
          // navigate(`/liquidity?poolAddress=${item.poolAddress}`)
          goLiquidity(`/dlmm?poolId=${item.poolId}`, item)
        }}
      />
    </VStack>
  ) : (
    <VStack
      w="100%"
      gap="0"
      {...(wrapStyle || {})}
      onMouseEnter={() => onBodyHover && onBodyHover()}
      onMouseLeave={() => onBodyLeave && onBodyLeave()}
      // border="1px solid"
      // borderColor="border"
      // borderRadius="12px"
    >
      {(dataSource && dataSource?.length && !loading ? dataSource : skeletonData)?.map((item, index) => (
        <VStack
          gap="0px"
          w="100%"
          key={loading ? index : typeof rowKey === 'function' ? rowKey(item) : rowKey ? (item as unknown as any)[rowKey] : index}
        >
          <H5PoolsCard
            key={item?.id}
            item={item}
            columns={columns}
            loading={loading}
            isOpen={openPoolsGroup?.[item?.id]}
            onOpen={onOpenPoolsGroup}
            goLiquidity={goLiquidity}
            itemSkeletonLength={itemSkeletonLength}
            itemHeight={itemHeight}
            index={index}
          />
          {isShowBorder && haveDividingLine && index !== dataSource?.length - 1 && (
            <Box w={{ base: 'calc(100% - 24px)', lg: '100%' }} h="1px" bg="border" />
          )}
        </VStack>
      ))}
      {pagination && pagination?.total > pagination?.size && (
        <Center mt="16px">
          <Pagination {...pagination} />
        </Center>
      )}
    </VStack>
  )
}
export default H5Pools
