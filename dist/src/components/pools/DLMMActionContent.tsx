import useFavoriteDlmmPool from '@/hooks/pool/useFavoriteDlmmPool'
import useDlmmPoolsStore from '@/store/pool/useDlmmPoolStore'
import useSwapWidgetStore from '@/store/swap-widget/swapWidget'
import useSwapWidgetConfigStore from '@/store/swap-widget/swapWidgetConfig'
import useWebConfigStore from '@cetus/stores/src/useWebConfigStore'
import { Icon } from '@cetus/ui-kit'
import { cancelBubble } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

export default function DLMMActionContent({ poolInfo, changeAnalyticsModal }: { poolInfo: any; changeAnalyticsModal: (isOpen: boolean) => void }) {
  const navigate = useNavigate()
  const { addFavorites, removeFavorites } = useFavoriteDlmmPool()
  const { dlmmPoolFavoriteIds } = useDlmmPoolsStore()

  const isFavoritesPool: boolean = useMemo(() => {
    return dlmmPoolFavoriteIds?.includes(poolInfo?.poolId || '')
  }, [JSON.stringify(dlmmPoolFavoriteIds), poolInfo?.poolId])
  const { isSwapWidgetDisplay } = useWebConfigStore()
  const { setFromCoin, setToCoin } = useSwapWidgetStore()
  const { setIsOpen } = useSwapWidgetConfigStore()
  return (
    <VStack align="flex-start" padding="8px">
      <IconText
        text="Analytics"
        xlinkHref="#icon-icon_kline"
        onClick={() => {
          changeAnalyticsModal(true)
          // navigate(`/dlmm?tab=analytics&poolId=${poolInfo?.poolId}`)
        }}
      />
      <IconText
        text="Swap"
        xlinkHref="#icon-icon_swap1"
        onClick={() => {
          if (isSwapWidgetDisplay) {
            setFromCoin(poolInfo?.displayTokenA)
            setToCoin(poolInfo?.displayTokenB)
            setIsOpen(true)
          } else {
            navigate(`/swap/${poolInfo?.tokenA?.coinType}/${poolInfo?.tokenB?.coinType}`)
          }
        }}
      />
      <IconText
        text="Add to Watchlist"
        xlinkHref={isFavoritesPool ? '#icon-icon_star_sel' : '#icon-icon_star'}
        svgFill={isFavoritesPool ? 'primary' : 'text_paragraph'}
        onClick={() => {
          if (isFavoritesPool) {
            removeFavorites(poolInfo?.poolId)
          } else {
            addFavorites(poolInfo?.poolId)
          }
        }}
      />
      {/* <IconText
        text="Add Incentive"
        xlinkHref="#icon-add_incentive"
        onClick={() => {
          navigate(`/incentive?poolAddress=${poolInfo?.poolAddress}`)
        }}
      /> */}
    </VStack>
  )
}

const IconText = ({
  text,
  xlinkHref,
  svgFill = 'text_paragraph',
  onClick
}: {
  text: string
  xlinkHref: string
  onClick: () => void
  svgFill?: string
}) => {
  return (
    <HStack
      w="100%"
      cursor="pointer"
      bg="menu_item_bg"
      borderRadius="8px"
      padding="11px"
      _hover={{
        svg: {
          fill: 'primary'
        },
        p: {
          color: 'primary'
        }
      }}
      onClick={(e: any) => {
        cancelBubble(e)
        onClick()
      }}
    >
      <Icon
        svgFill={svgFill}
        xlinkHref={xlinkHref}
        svgHover="primary"
        svgW={text == 'Add to Watchlist' ? '22px' : '20px'}
        svgH={text == 'Add to Watchlist' ? '22px' : '20px'}
        minW={text == 'Add to Watchlist' ? '22px' : '20px'}
        minH={text == 'Add to Watchlist' ? '22px' : '20px'}
        ml={text == 'Add to Watchlist' ? '-2px' : '0px'}
      />
      <Text fontSize="13px">{text}</Text>
    </HStack>
  )
}
