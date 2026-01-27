import useGetApiData from '@/hooks/pro/useGetApiData'
import useProHelper from '@/hooks/pro/useProHelper'
import useProStore from '@/store/pro'
import useProListStore from '@/store/pro/list'
import { CetusTooltip, useTokenSelect } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useTokenSelectStore from '@cetus/stores/src/useTokenSelectStore'
import { Icon } from '@cetus/ui-kit'
import { isAvailableObject } from '@cetus/utils'
import { Box, Center, HStack, Image, Text } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// 从右向左滚动
const scroll = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`

const limit = 20
export const trendingCarouselParams = {
  date_type: 'hour24',
  desc: false,
  limit: 20,
  liqidity_max: '',
  liqidity_min: '',
  market_cap_max: '',
  market_cap_min: '',
  offset: 0,
  sorted_by: 'rank',
  tag: 'trending',
  text: '',
  volume_max: '',
  volume_min: ''
}

export default function CarouselBlock({ containerProps }: { containerProps?: any }) {
  const { getProCoinList, getProCoinListWithCoins } = useGetApiData()
  const { userCollectObj } = useTokenSelectStore()
  const { quickCoin, currentCarouselTab, setCurrentCarouselTab, setProListParams, setCurrentProTab } = useProListStore()
  const { isProMode } = useProStore()
  const [data, setData] = useState<any>()
  const { goToken } = useProHelper()
  const { isApp, windowWidth } = useWindowWidth()
  const { pathname } = useLocation()

  const firstPathPart = pathname.split('/').filter(Boolean)[0]

  const navigate = useNavigate()
  const { getUserCollectList, getImportTokenList } = useTokenSelect()

  const [shouldScroll, setShouldScroll] = useState(false)
  const [animationDuration, setAnimationDuration] = useState<string | undefined>(undefined)

  const isShowTrending = useMemo(() => {
    return isProMode || firstPathPart === 'pro'
  }, [isProMode, firstPathPart])

  useEffect(() => {
    if (!isShowTrending) {
      setCurrentCarouselTab('Watchlist')
    }
  }, [isShowTrending])

  const tabs = useMemo(() => {
    return isShowTrending
      ? [
          { iconSel: '/images/icon_watchlist_sel@2x.png', iconNor: '/images/icon_watchlist_nor@2x.png', label: 'Watchlist' },
          { iconSel: '/images/icon_trending_sel@2x.png', iconNor: '/images/icon_trending_nor@2x.png', label: 'Trending' }
        ]
      : [{ iconSel: '/images/icon_watchlist_sel@2x.png', iconNor: '/images/icon_watchlist_nor@2x.png', label: 'Watchlist' }]
  }, [isShowTrending])

  // 获取trending列表
  const fetchProData = async () => {
    try {
      const res = await getProCoinList({ ...trendingCarouselParams, limit })
      console.log('🚀 ~ fetchProData ~ res.list:', res.list)
      setTimeout(() => {
        setData(res.list && res.list?.length > 15 ? res.list.slice(0, 15) : res.list)
      }, 100)
    } catch (err) {
      console.log('🚀 ~ fetchProData ~ err:', err)
    }
  }

  // 获取收藏列表
  const fetchWatchList = async () => {
    const coins = Object.keys(userCollectObj || {})
    const res = await getProCoinListWithCoins(coins, trendingCarouselParams?.date_type, '')
    console.log('🚀 ~ fetchWatchList ~ res:', res)
    setTimeout(() => {
      setData(res)
    }, 100)
  }

  const trackRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (currentCarouselTab === 'Trending' && isShowTrending) {
      setData([])
      setShouldScroll(false)
      fetchProData()

      // 1分钟自动刷新
      const intervalId = setInterval(() => fetchProData(), 60 * 1000)
      return () => clearInterval(intervalId)
    }
  }, [currentCarouselTab, isShowTrending])

  useEffect(() => {
    // setData([])
    setShouldScroll(false)
    setData(prev => (prev ? [...prev] : prev))
  }, [windowWidth])

  useEffect(() => {
    if (currentCarouselTab === 'Watchlist') {
      setData([])
      setShouldScroll(false)
      if (isAvailableObject(userCollectObj)) {
        fetchWatchList()
      }

      // 1分钟自动刷新
      const intervalId = setInterval(() => {
        if (isAvailableObject(userCollectObj)) {
          fetchWatchList()
        }
      }, 60 * 1000)
      return () => clearInterval(intervalId)
    }
  }, [userCollectObj, currentCarouselTab])

  const [isMounted, setIsMounted] = useState(false)
  useEffect(() => {
    setIsMounted(true)
  }, [])
  useEffect(() => {
    if (isMounted) {
      getUserCollectList()
      getImportTokenList()
    }
  }, [isMounted])

  useEffect(() => {
    if (!trackRef.current || !containerRef.current || data?.length == 0) return

    const containerWidth = containerRef.current.offsetWidth
    const trackWidth = trackRef.current.scrollWidth

    const canScroll = trackWidth > containerWidth

    if (canScroll) {
      const speed = 80 // px/s
      const duration = shouldScroll ? trackWidth / 2 / speed : trackWidth / speed

      console.log('🚀 ~ CarouselBlock ~ duration:', duration)
      setAnimationDuration(`${duration}s`)
      setShouldScroll(true)
    } else {
      setShouldScroll(false)
    }
  }, [data])

  const renderData = shouldScroll ? [...data, ...data] : data
  return (
    <HStack
      w="100%"
      justify="flex-end"
      h={{ base: '80px', lg: '41px' }}
      position="sticky"
      top={{ base: '48px', lg: '80px' }}
      bg="bg_primary"
      zIndex="99"
      mb={{ base: '4px', lg: '0' }}
      pl={{ base: '12px', lg: '20px' }}
      pt={{ base: '24px', lg: '0px' }}
      pb={{ base: '12px', lg: '0px' }}
      {...containerProps}
    >
      <HStack
        w={{ base: tabs?.length == 1 ? '72px' : '88px', lg: tabs?.length == 1 ? '104px' : '146px' }}
        flexDirection={{ base: 'column', lg: 'row' }}
        align={{ base: 'flex-start', lg: 'center' }}
        gap={{ base: '2px', lg: '8px' }}
        pb="9px"
      >
        {((tabs?.length == 1 && !isApp) || tabs?.length > 1) && (
          <HStack
            gap="0"
            h="28px"
            p={tabs?.length == 1 ? '2px 0' : '2px'}
            borderRadius="8px"
            border={tabs?.length == 1 ? 'none' : '1px solid'}
            borderColor="border"
            bg={tabs?.length == 1 ? 'none' : 'bg_secondary'}
          >
            {tabs.map(tab => (
              <Center
                key={tab.label}
                cursor="pointer"
                onClick={() => setCurrentCarouselTab(tab.label as 'Watchlist' | 'Trending')}
                h="100%"
                w="24px"
                bg={currentCarouselTab === tab.label && tabs?.length > 1 ? 'primary_opacity.10' : 'none'}
                borderRadius="6px"
              >
                <Image src={currentCarouselTab === tab.label ? tab.iconSel : tab.iconNor} w="16px" h="16px" />
              </Center>
            ))}
          </HStack>
        )}

        <CetusTooltip
          showTooltip={isApp || currentCarouselTab == 'Watchlist' ? false : true}
          placement="top"
          tooltip={<Text fontSize="12px">Tokens trending over the past 24h.</Text>}
        >
          <HStack gap="0" ml={tabs?.length == 1 ? '-8px' : '0'}>
            <Text
              color={(tabs?.length == 1 && !isApp) || tabs?.length > 1 ? 'text_caption' : 'primary_gray'}
              w="62px"
              cursor="pointer"
              _hover={{ color: isApp ? 'text_caption' : 'primary' }}
              onClick={() => {
                setCurrentProTab(currentCarouselTab)
                if (firstPathPart !== 'pro') {
                  navigate(`/pro`)
                } else {
                  if (currentCarouselTab == 'Trending') {
                    setProListParams(trendingCarouselParams)
                  }
                }
              }}
            >
              {currentCarouselTab}
            </Text>
            <Icon xlinkHref="#icon-detail" svgW="12px" svgH="12px" />
          </HStack>
        </CetusTooltip>
      </HStack>
      <Box
        overflow="hidden"
        ref={containerRef}
        whiteSpace="nowrap"
        width={{
          base: tabs?.length == 1 ? 'calc(100% - 72px)' : 'calc(100% - 88px)',
          lg: tabs?.length == 1 ? 'calc(100% - 104px)' : 'calc(100% - 146px)'
        }}
        position="relative"
        p="0px 0 9px"
        _hover={{
          '& > .carousel-track': {
            animationPlayState: 'paused'
          }
        }}
      >
        {data && data?.length > 0 && (
          <HStack
            className="carousel-track"
            // minW="200%" // 确保重复内容后滚动 50% 正好轮一遍
            gap="12px"
            ref={trackRef}
            animation={shouldScroll && animationDuration ? `${scroll} ${animationDuration} linear infinite` : 'none'}
            willChange="transform"
            minW="fit-content"
          >
            {renderData?.map((item: any, index: number) => (
              <HStack
                key={`${item?.coin_type}-${index}`}
                h="32px"
                borderRadius="8px"
                bg="card_bg"
                cursor="pointer"
                p="0 8px"
                gap="4px"
                _hover={{ bg: '#2B3742' }}
                onClick={() => goToken(quickCoin?.coin_type, item?.coin_type)}
              >
                {currentCarouselTab == 'Trending' && (
                  <Text fontSize="12px" color="text_caption">
                    #{(index % data?.length) + 1}
                  </Text>
                )}
                <SingleTokenInfo
                  warningIcon={{ isNeedShow: false, iconW: '12px', iconH: '12px' }}
                  token={item}
                  haveName={false}
                  imgBoxStyle={{ w: '20px', h: '20px' }}
                />
                <Text fontSize="12px" color="text_caption" ml="12px">
                  {item?.price}
                </Text>
                <Text
                  fontSize="12px"
                  color={
                    item?.priceChange == '--' || Number(item?.priceChange) === 0
                      ? 'text_caption'
                      : item?.priceChange?.includes('-')
                        ? 'primary_red'
                        : 'primary_green'
                  }
                >
                  {item?.priceChange}
                </Text>
              </HStack>
            ))}
          </HStack>
        )}
        {/* 左侧渐变遮罩 */}
        {shouldScroll && (
          <Box
            position="absolute"
            left="0"
            top="0"
            bottom="0"
            w={{ base: '28px', lg: '60px' }}
            pointerEvents="none"
            bgGradient="linear(to-r, #161616, transparent)"
          />
        )}
      </Box>
    </HStack>
  )
}
