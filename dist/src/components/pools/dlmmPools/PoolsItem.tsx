import useDlmmGroupItemInteraction from '@/hooks/pool/useDlmmGroupItemInteraction'
import useDlmmGroupListInteraction from '@/hooks/pool/useDlmmGroupListInteraction'
import { DlmmApiPoolGroupItem, DlmmPoolData } from '@/types/dlmm'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { d } from '@cetus/utils'
import { Box, Flex, Spinner, Text, VStack } from '@chakra-ui/react'
import { useRafState } from 'ahooks'
import { useEffect, useMemo } from 'react'
const PoolsItem = ({
  item,
  columns,
  goLiquidity,
  isOpen = false,
  onOpen
}: {
  item: DlmmApiPoolGroupItem
  columns: any[]
  goLiquidity: (url: string, poolApiInfo: any) => void
  isOpen?: boolean
  onOpen: (groupId: string, isOpen: boolean) => void
}) => {
  const { allData, lessData, onClick, isOnlyOneData, onPoolItemClick } = useDlmmGroupItemInteraction({
    data: item,
    isOpen,
    onOpen,
    goLiquidity,
    pageSize: 10
  })

  // const onShowAll = (e: any) => {
  //   cancelBubble(e)
  //   setShowAll(!showAll)
  // }

  const [showMb, setShowMb] = useRafState<boolean>(false)

  const scrollHeight = useMemo(() => {
    return lessData?.length * 60
  }, [lessData?.length])

  const totalHeight = useMemo(() => {
    return allData?.length * 60
  }, [allData?.length])

  const { isApp } = useWindowWidth()

  useEffect(() => {
    if (isOpen) {
      setShowMb(true)
    } else {
      setShowMb(false)
    }
  }, [isOpen])

  return (
    <VStack
      w="100%"
      border="1px solid"
      borderColor={isOpen ? 'border' : 'transparent'}
      borderRadius="12px"
      gap="0"
      bg={isOpen ? 'bg_secondary' : 'transparent'}
      className="dlmm-tutorial-step-1"
      mb={showMb ? '8px' : '0'}
    >
      <Box
        pos="relative"
        onClick={onClick}
        cursor="pointer"
        _hover={{
          '.dlmm_action': {
            svg: { fill: 'text_caption' },
            p: { color: 'text_caption' }
          },
          bg: isApp ? 'auto' : 'primary_opacity.10',
          borderRadius: '12px',
          '.dlmm_fee_and_bin_step': {
            borderColor: 'token_inactive_border'
          },
          '.dlmm_action_pools': {
            borderColor: 'token_inactive_border'
          },
          '.dlmm_pools_arrow': {
            '.dlmm_pools_arrow_ani_4': {
              animationIterationCount: 1
            },
            '.dlmm_pools_arrow_ani_3': {
              animationIterationCount: 1
            },
            '.dlmm_pools_arrow_ani_2': {
              animationIterationCount: 1
            },
            '.dlmm_pools_arrow_ani_1': {
              animationIterationCount: 1
            }
          }
        }}
        as="div"
        display="grid"
        w="100%"
        h="76px"
        p="0 12px"
        borderRadius="12px 12px 0 0"
        columnGap="12px"
        bg={isOpen ? 'white_color_opacity.5' : 'transparent'}
        gridTemplateColumns="1fr 128px 128px 148px 90px 120px 158px"
      >
        {columns?.map((col, index) => (
          <Flex align="center" key={col.key} justify={index === 0 ? 'flex-start' : 'flex-end'}>
            {col?.render ? (
              col?.render({
                ...item,
                isOpen,
                list: item?.list,
                onExpand: onClick,
                hasFee: isOnlyOneData,
                isParent: true,
                ...(isOnlyOneData ? allData?.[0] : {})
              })
            ) : (
              <Text fontSize="14px" fontWeight="500" color="text_caption">
                {item?.[col?.key] || '--'}
              </Text>
            )}
          </Flex>
        ))}
      </Box>
      {!isOnlyOneData && isOpen && (
        <PoolList
          id={item?.id}
          columns={columns}
          isOpen={isOpen}
          allData={allData}
          scrollHeight={scrollHeight}
          onPoolItemClick={data => {
            onPoolItemClick(data, item)
          }}
        />
      )}
    </VStack>
  )
}
export default PoolsItem

const PoolList = ({
  columns,
  allData,
  onPoolItemClick,
  scrollHeight,
  id,
  isOpen
}: {
  columns: any[]
  allData: DlmmPoolData[]
  onPoolItemClick: (data: DlmmPoolData) => void
  scrollHeight: number
  id: string
  isOpen: boolean
}) => {
  const { hasLoadMore, loadMoreRef, list, isLoadMoreLoading, containerRef } = useDlmmGroupListInteraction(allData, 10, isOpen)

  return (
    <VStack w="100%" mb={isOpen && list?.length > 0 ? '12px' : '0'}>
      <Box
        as="div"
        w="100%"
        h={list?.length > 0 ? `${allData?.length > 10 ? scrollHeight - 1 : scrollHeight + 9}px` : '0px'}
        overflowY="auto"
        ref={containerRef}
      >
        <VStack w="100%" gap="0px" pos="relative">
          {list?.length > 0 && (
            <>
              <Box h="9px" />
              <Box
                position="absolute"
                top="0px"
                left="28px"
                h={`${d(60)
                  .mul(list?.length - 0.5)
                  .plus(9)
                  .toString()}px`}
                w="1px"
                bg="border"
              />
            </>
          )}

          {list?.map(data => {
            return <PoolItem key={data.poolId} data={data} columns={columns} onClick={() => onPoolItemClick(data)} />
          })}
          <Box ref={loadMoreRef} h={hasLoadMore && list?.length > 0 ? '24px' : '0px'} mt={hasLoadMore && list?.length > 0 ? '8px' : '0px'}>
            {isLoadMoreLoading ? (
              <Spinner size="sm" color="text_caption" />
            ) : hasLoadMore && list?.length > 0 ? (
              <Text color="primary" fontSize="12px">
                Load More
              </Text>
            ) : (
              ''
            )}
          </Box>
        </VStack>
      </Box>
    </VStack>
  )
}

const PoolItem = ({ data, onClick, columns }: { data: DlmmPoolData; onClick: () => void; columns: any[] }) => {
  return (
    <Box w="100%" p="0 8px" borderRadius="12px" pos="relative">
      <Box w="100%" h="60px" pl="32px">
        <Box
          h="100%"
          className="dlmm-tutorial-step-2"
          as="div"
          display="grid"
          w="100%"
          // bg="text_highlight_opacity.10"
          borderRadius="12px"
          p="0 6px"
          onClick={onClick}
          cursor="pointer"
          _hover={{
            bg: 'primary_opacity.10',
            '.dlmm_fee_and_bin_step': {
              borderColor: 'token_inactive_border'
            },
            '.dlmm_action_pools': {
              borderColor: 'token_inactive_border'
            }
          }}
          columnGap="12px"
          gridTemplateColumns="1fr 128px 148px 128px 90px 120px 158px"
        >
          {columns?.map((col, index) => (
            <Flex align="center" key={col.key} justify={index === 0 ? 'flex-start' : 'flex-end'}>
              {col?.render ? (
                col?.render({ ...data, hasFee: true })
              ) : (
                <Text fontSize="14px" fontWeight="500" color="text_caption">
                  {data?.[col?.key] || '--'}
                </Text>
              )}
            </Flex>
          ))}
        </Box>
      </Box>
      <Box pos="absolute" w="12px" h="1px" bg="border" top="50%" left="28px" />
    </Box>
  )
}
