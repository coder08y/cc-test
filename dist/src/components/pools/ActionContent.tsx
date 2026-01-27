import useNavigateToLiquidity from '@/hooks/clmm/useNavigateToLiquidity'
import useFavoritePool from '@/hooks/pool/useFavoritePool'
import useGlobalStore from '@/store/common/global'
import usePoolsStore from '@/store/pool'
import useSwapWidgetStore from '@/store/swap-widget/swapWidget'
import useSwapWidgetConfigStore from '@/store/swap-widget/swapWidgetConfig'
import useWebConfigStore from '@cetus/stores/src/useWebConfigStore'
import { VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { IconText } from '../common/IconText'

export default function ActionContent({ poolInfo, changeAnalyticsModal }: { poolInfo: any; changeAnalyticsModal: (isOpen: boolean) => void }) {
  const navigate = useNavigate()
  const { addFavorites, removeFavorites } = useFavoritePool()
  const { poolFavoriteIds } = usePoolsStore()
  const { goLiquidity } = useNavigateToLiquidity()
  const { setBackUrl } = useGlobalStore()
  const isFavoritesPool: boolean = useMemo(() => {
    return poolFavoriteIds?.includes(poolInfo?.poolAddress || '')
  }, [JSON.stringify(poolFavoriteIds), poolInfo?.poolAddress])
  const { setIsOpen } = useSwapWidgetConfigStore()
  const { setFromCoin, setToCoin } = useSwapWidgetStore()

  const { isSwapWidgetDisplay } = useWebConfigStore()

  return (
    <VStack align="flex-start" padding="8px">
      <IconText
        text="Analytics"
        xlinkHref="#icon-icon_kline"
        onClick={() => {
          changeAnalyticsModal(true)
          // setBackUrl('/pools')
          // goLiquidity(`/liquidity?tab=analytics&poolAddress=${poolInfo?.poolAddress}`, poolInfo)
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
            navigate(`/swap/${poolInfo?.displayTokenA?.coin_type}/${poolInfo?.displayTokenB?.coin_type}`)
          }
        }}
      />
      <IconText
        text="Add to Watchlist"
        xlinkHref={isFavoritesPool ? '#icon-icon_star_sel' : '#icon-icon_star'}
        svgFill={isFavoritesPool ? 'primary' : 'text_paragraph'}
        svgSize="22px"
        svgMl="-2px"
        onClick={() => {
          if (isFavoritesPool) {
            removeFavorites(poolInfo?.poolAddress)
          } else {
            addFavorites(poolInfo?.poolAddress)
          }
        }}
      />
    </VStack>
  )
}
