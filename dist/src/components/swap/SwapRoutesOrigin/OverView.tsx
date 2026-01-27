import { AggregatorDexMap } from '@/config/aggregator'
import { SwapRouterFormat } from '@/types'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinType } from '@cetus/types'
import { SingleCoinImage } from '@cetus/ui-kit'
import { Box, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Skeleton, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

const OverView = ({
  data,
  children,
  loading,
  isSwapWidget
}: {
  data?: SwapRouterFormat
  children?: React.ReactNode
  loading?: boolean
  isSwapWidget?: boolean
}) => {
  const { getTokenListInfo } = useGetToken()
  const { isApp } = useWindowWidth()
  const [tokenMap, setTokenMap] = useState<Map<string, any>>(new Map())
  const fetchTokenInfo = async () => {
    if (data && data?.routers && data?.routers?.length > 0) {
      const coinTypeList: string[] = []
      data?.routers[0]?.paths?.forEach((item: any) => {
        coinTypeList.push(item?.from_type)
        coinTypeList.push(item?.to_type)
      })

      const res = await getTokenListInfo(coinTypeList as CoinType[])
      if (res) {
        setTokenMap(res)
      }
    }
  }
  useEffect(() => {
    fetchTokenInfo()
  }, [data?.routers])
  return (
    data?.providers && (
      <Skeleton isLoaded={!loading} minW="128px" minH="20px" lineHeight="20px">
        <HStack w="100%" gap="4px" align="center" justify="flex-end" wrap="wrap">
          {data?.router_summery !== '1 Streams' ? (
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
          )}
          {data?.providers?.map(item => {
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
                    <PopoverBody fontSize="12px">{AggregatorDexMap[item]?.name}</PopoverBody>
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
