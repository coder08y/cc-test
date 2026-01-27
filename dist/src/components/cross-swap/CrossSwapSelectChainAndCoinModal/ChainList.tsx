import { Loading } from '@cetus/design'
import { NoData } from '@cetus/ui-kit'
import { Chain } from '@cetusprotocol/cross-swap-sdk'
import { Box, HStack, Image, Text, VStack } from '@chakra-ui/react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useMemo, useRef } from 'react'
import { chainPlaceholderImg } from '../ChainCoinSelect'

type ChainListProps = {
  chainList: Chain[]
  currentChain: Chain
  isLoading: boolean
  onChangeChain: (chain: any) => void
}

export default function ChainList(props: ChainListProps) {
  const { chainList, currentChain, onChangeChain, isLoading } = props
  const isVirtualList = useMemo(() => {
    return chainList.length > 20
  }, [chainList?.length])

  const ChainItem = ({ chain }: { chain: any }) => {
    const handleSelect = () => {
      onChangeChain(chain)
    }
    return (
      <HStack
        w="100%"
        padding="8px"
        borderRadius="8px"
        justifyContent="space-between"
        alignItems="center"
        cursor="pointer"
        _hover={{
          bg: 'primary_opacity.10'
        }}
        onMouseDown={handleSelect}
      >
        <HStack>
          <Image key={chain.id} src={chain.logo_url} w="32px" h="32px" loading="lazy" fallbackSrc={chainPlaceholderImg} borderRadius="16px" />
          <Text ml="4px" color="text_caption">
            {chain.chain_name}
          </Text>
        </HStack>
        {currentChain == chain.chain_name && <Image w="20px" h="20px" src="/images/selected_chain@2x.png" />}
      </HStack>
    )
  }

  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: chainList.length, // 总项数
    getScrollElement: () => parentRef.current, // 获取滚动容器的元素
    estimateSize: () => 56, // 每项的默认高度（估算值）
    overscan: 10 // 预先渲染的项数（提高滚动流畅性）
  })

  return (
    <HStack width="100%" gap="8px" mt="20px">
      {isLoading ? (
        <Box w="100%" height="400px" position="relative" borderRadius="16px" overflow="hidden">
          <Loading positionStyle="absolute" />
        </Box>
      ) : chainList.length > 0 ? (
        isVirtualList ? (
          <div
            ref={parentRef}
            style={{
              width: '100%',
              height: '500px', // 列表的可见区域高度
              overflowY: 'auto', // 启用垂直滚动
              padding: '0 16px'
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
                  key={chainList[virtualRow.index].id}
                  style={{
                    position: 'absolute',
                    top: virtualRow.start,
                    left: 0,
                    width: '100%',
                    height: virtualRow.size
                  }}
                >
                  <ChainItem chain={chainList[virtualRow.index]} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <VStack w="100%" maxH="500px" overflowY="auto" p="0 16px">
            {chainList.map(chain => (
              <ChainItem chain={chain} key={chain.id} />
            ))}
          </VStack>
        )
      ) : (
        <NoData type="nodata" text="No chain found" background="none" noBorder={true} />
      )}
    </HStack>
  )
}
