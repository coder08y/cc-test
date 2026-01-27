import { useGetChainLink } from '@/hooks/cross-swap/useCrossHelper'
import { WarpTokenBalance } from '@/types/cross_swap'
import { AddressCopyLink, Loading } from '@cetus/design'
import { NoData } from '@cetus/ui-kit'
import { formatCurrency, symbolDataDisplayProcessing, textEllipses } from '@cetus/utils'
import { CrossSwapPlatform, CrossSwapToken } from '@cetusprotocol/cross-swap-sdk'
import { Box, HStack, Image, Skeleton, StackProps, Text, VStack } from '@chakra-ui/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef, useState } from 'react'

const placeholderImg =
  'data:image/png;base64,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'

type CoinListProps = {
  coinList: WarpTokenBalance[]
  selectCoin: (coin: CrossSwapToken) => void
  isLoading: boolean
  isBalanceLoading: boolean
  crossPlatform: CrossSwapPlatform
}

const loadErrorImgMap: Record<string, string> = {}
loadErrorImgMap['0xf00eb7ab086967a33c04a853ad960e5c6b0955ef5a47d50b376d83856dc1215e::axol::AXOL'] = '/images/chain/axol.png'
export default function CoinList(props: CoinListProps) {
  const { coinList, selectCoin, isLoading, isBalanceLoading, crossPlatform } = props

  const isVirtualList = useMemo(() => {
    return coinList.length > 20
  }, [coinList?.length])

  const CoinItem = ({ coin, wrapStyle }: { coin: WarpTokenBalance; wrapStyle: StackProps }) => {
    // 获取代币余额
    const balanceFormatted = coin.balance?.balance_formatted
    const balanceUsd = coin.balance?.balance_usd
    const [imgSrc, setImgSrc] = useState(coin.logo_url || placeholderImg)

    const { chainLink } = useGetChainLink(coin.address, crossPlatform, coin.chain_id, 'coin')

    return (
      <HStack
        w="100%"
        padding="8px"
        minH="64px"
        borderRadius="8px"
        justifyContent="space-between"
        alignItems="center"
        cursor="pointer"
        {...wrapStyle}
        _hover={{
          bg: 'primary_opacity.10'
        }}
        onClick={() => {
          selectCoin(coin)
        }}
      >
        <HStack position="relative">
          <Image
            key={coin.address}
            src={loadErrorImgMap[coin.address] || imgSrc}
            w="32px"
            h="32px"
            loading="lazy"
            fallbackSrc={placeholderImg}
            borderRadius="16px"
            onError={() => {
              setImgSrc(placeholderImg)
              loadErrorImgMap[coin.address] = placeholderImg
            }}
          />
          <VStack alignItems="flex-start" gap="2px">
            <Text color="text_caption" lineHeight="20px" fontWeight="600">
              {textEllipses(coin.symbol, 10)}
            </Text>
            <Text fontSize="12px">{textEllipses(coin.name, 28)}</Text>
            <AddressCopyLink address={coin?.address} onClickLink={() => window.open(chainLink, '_blank')} showLink={false} />
          </VStack>
        </HStack>
        {isBalanceLoading && (
          <VStack alignItems="flex-end">
            <Skeleton w="50px" h="12px" />
            <Skeleton w="40px" h="12px" />
          </VStack>
        )}
        {!isBalanceLoading && (
          <VStack alignItems="flex-end">
            <Text color="text_caption">
              {balanceFormatted && +balanceFormatted > 0 ? symbolDataDisplayProcessing(balanceFormatted, '', coin.decimals) : ''}
            </Text>

            <Text fontSize="12px">{balanceUsd ? `${formatCurrency(balanceUsd, 2)}` : ''}</Text>
          </VStack>
        )}
      </HStack>
    )
  }

  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: coinList.length, // 总项数
    getScrollElement: () => parentRef.current, // 获取滚动容器的元素
    estimateSize: () => 74, // 每项的默认高度（估算值）
    overscan: 10 // 预先渲染的项数（提高滚动流畅性）
  })

  return (
    <HStack width="100%" gap="8px" mt="12px">
      {isLoading ? (
        <Box w="100%" height="400px" position="relative" borderRadius="16px" overflow="hidden">
          <Loading positionStyle="absolute" />
        </Box>
      ) : coinList.length > 0 ? (
        isVirtualList ? (
          <div
            ref={parentRef}
            style={{
              width: '100%',
              height: '500px', // 列表的可见区域高度
              overflowY: 'auto', // 启用垂直滚动
              padding: '0 12px 16px 16px'
            }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`, // 所有项目的总高度
                position: 'relative'
              }}
            >
              {rowVirtualizer.getVirtualItems().map(virtualRow => (
                <div
                  key={coinList[virtualRow.index].address}
                  style={{
                    position: 'absolute',
                    top: virtualRow.start,
                    left: 0,
                    width: '100%',
                    height: virtualRow.size
                  }}
                >
                  <CoinItem coin={coinList[virtualRow.index]} wrapStyle={{}} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <VStack gap="0px" w="100%" maxH="500px" overflowY="auto" p="0 16px">
            {coinList.map(coin => (
              <CoinItem coin={coin} key={coin.address} wrapStyle={{}} />
            ))}
          </VStack>
        )
      ) : (
        <NoData type="nodata" text="No coin found" background="none" noBorder={true} />
      )}
    </HStack>
  )
}
