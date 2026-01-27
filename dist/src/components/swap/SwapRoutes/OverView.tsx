import { AggregatorDexMap, findDisplayName, findGroupDex } from '@/config/aggregator'
import { AggregatorProvider } from '@/types/swap'
// import { useGetToken } from '@cetus/hooks/src/useToken'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
// import { CoinType } from '@cetus/types'
import { SingleCoinImage } from '@cetus/ui-kit'
import { Box, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Skeleton } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
// import { useEffect, useState } from 'react'

const OverView = ({
  allProviders,
  children,
  loading,
  isSwapWidget
}: {
  allProviders?: string[]
  children?: React.ReactNode
  loading?: boolean
  isSwapWidget?: boolean
}) => {
  const { isApp } = useWindowWidth()

  const [allProviderFilter, setAllProviderFilter] = useState<AggregatorProvider[]>([])

  useEffect(() => {
    const processedGroups = new Set<string>()
    const filteredProviders: AggregatorProvider[] = []

    allProviders?.forEach(item => {
      const groupDex = findGroupDex(item as AggregatorProvider)

      if (groupDex) {
        // 如果这个 provider 属于某个组
        if (!processedGroups.has(groupDex.groupName)) {
          // 如果这个组还没有被处理过，添加第一个遇到的该组 provider
          processedGroups.add(groupDex.groupName)
          filteredProviders.push(item as AggregatorProvider)
        }
        // 如果这个组已经被处理过，跳过（不添加到结果中）
      } else {
        // 如果这个 provider 不属于任何组，直接添加
        filteredProviders.push(item as AggregatorProvider)
      }
    })

    setAllProviderFilter(filteredProviders)
  }, [allProviders])

  return (
    allProviders && (
      <Skeleton isLoaded={!loading} minW="128px" minH="20px">
        <HStack w="100%" gap="4px" justify="flex-end" wrap="wrap" minH="20px" alignItems="center">
          {/* {data?.router_summery !== '1 Streams' ? (
            <Text color="text_caption" fontSize={isSwapWidget ? '12px' : '14px'} fontWeight="500" overflowWrap="break-word">
              {data?.router_summery}
            </Text>
          ) : (
            <>
              <Text color="text_caption" fontSize={isSwapWidget ? '12px' : '14px'} fontWeight="500" textAlign="right" overflowWrap="break-word">
                {data?.routers[0]?.paths
                  ?.map((path, index) => {
                    if (index === 0) {
                      return `${tokenMap?.get(path?.from_type)?.symbol} > ${tokenMap?.get(path?.to_type)?.symbol}`
                    }
                    return tokenMap?.get(path?.to_type)?.symbol
                  })
                  .join(' > ')}
              </Text>
            </>
          )} */}
          {allProviderFilter?.map(item => {
            return isApp && children ? (
              <SingleCoinImage w="16px" h="16px" imageUrl={AggregatorDexMap[item]?.logo} />
            ) : (
              <Popover isLazy key={item} trigger={isApp ? 'click' : 'hover'}>
                <PopoverTrigger>
                  <Box>
                    <SingleCoinImage w="16px" h="16px" imageUrl={AggregatorDexMap[item]?.logo} />
                  </Box>
                </PopoverTrigger>
                <Portal>
                  <PopoverContent w="unset">
                    <PopoverBody fontSize="12px">{findDisplayName(item)}</PopoverBody>
                  </PopoverContent>
                </Portal>
              </Popover>
            )
          })}
          {children}
        </HStack>
      </Skeleton>
    )
  )
}

export default OverView
