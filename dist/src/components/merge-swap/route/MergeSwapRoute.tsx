import useMergeSwapStore from '@/store/merge-swap/useMergeSwapStore'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { MergeSwapRouterData } from '@cetusprotocol/aggregator-sdk'
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { MergeSwapRouteItem } from './MergeSwapRouteItem'

type MergeSwapRouteProps = {
  routerData?: MergeSwapRouterData
  findRouterLoading: boolean
}

export function MergeSwapRoute(props: MergeSwapRouteProps) {
  const { routerData, findRouterLoading } = props
  const [localData, setLocalData] = useState<MergeSwapRouterData | undefined>(routerData)
  const { windowWidth } = useWindowWidth()
  const { setIsOpenRoutePathModal, setSelectedRoutePathIndex } = useMergeSwapStore(state => ({
    setIsOpenRoutePathModal: state.setIsOpenRoutePathModal,
    setSelectedRoutePathIndex: state.setSelectedRoutePathIndex
  }))

  const showData = useMemo(() => {
    if (routerData) {
      setLocalData(routerData)
      return routerData
    }
    // 返回上一次记录数据，保证在routerData 为空的情况下，动画消失过程中，有数据占位
    return localData
  }, [localData?.quoteID, routerData?.quoteID])

  return (
    <VStack gap="12px" alignItems="start" mt={{ base: '20px', lg: '144px' }} w={{ base: '100%', lg: '470px' }}>
      <Text mt="0px" fontSize="13px" color="text_caption">
        Route
      </Text>

      <VStack bg="block_color_opacity.10" p="12px" w="100%" gap="8px" borderRadius="12px" border="1px solid" borderColor="border">
        {(!showData || findRouterLoading) && <RouterItemSkeleton data={showData} />}
        {showData &&
          !findRouterLoading &&
          showData?.allRoutes.map((route, index) => (
            <MergeSwapRouteItem
              key={index + route.amountIn.toString() + route?.amountOut.toString()}
              route={route}
              index={index}
              openRoutesModal={index => {
                setIsOpenRoutePathModal(true)
                setSelectedRoutePathIndex(index)
              }}
            />
          ))}
      </VStack>
    </VStack>
  )
}

export function RouterItemSkeleton({ data }: { data?: MergeSwapRouterData }) {
  const allRoutes = data?.allRoutes || [1, 2, 3]
  return (
    <VStack w="100%" gap="16px">
      {allRoutes.map((_, idx) => (
        <VStack
          key={idx}
          width="100%"
          bg="bg_primary"
          position="relative"
          alignItems="flex-start"
          padding="16px"
          borderRadius="8px"
          border="1px solid"
          borderColor="border"
          gap="12px"
        >
          {/* Header骨架 */}
          <HStack w="100%" justifyContent="space-between">
            <HStack>
              <Skeleton boxSize="32px" borderRadius="50%" />
              <Icon xlinkHref="#icon-icon_double_arrow_left" svgW="12px" svgH="12px" iconCursor="default" showHover={false} />
              <Skeleton boxSize="32px" borderRadius="50%" />
            </HStack>

            <VStack alignItems="flex-end">
              <Skeleton height="20px" width="100px" />
              <Skeleton height="16px" width="100px" />
            </VStack>
          </HStack>

          {/* Footer骨架 */}
          <VStack w="100%" gap="8px">
            <HStack w="100%" justifyContent="space-between">
              <HStack>
                <Skeleton height="16px" width="100px" />
              </HStack>
              <Skeleton height="16px" width="100px" />
            </HStack>
            <HStack w="100%" justifyContent="space-between">
              <HStack>
                <Skeleton height="16px" width="100px" />
              </HStack>
              <Skeleton height="16px" width="100px" />
            </HStack>
          </VStack>
        </VStack>
      ))}
    </VStack>
  )
}
