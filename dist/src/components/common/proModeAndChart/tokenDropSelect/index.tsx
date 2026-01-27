import { trendingCarouselParams } from '@/components/pro/CarouselBlock'
import useGetApiData from '@/hooks/pro/useGetApiData'
import useProStore from '@/store/pro'
import { SelectTab } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import { useDebounceFunction } from '@cetus/hooks'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useTokenSelectStore from '@cetus/stores/src/useTokenSelectStore'
import { Token } from '@cetus/types'
import { NoData, SearchInput } from '@cetus/ui-kit'
import Icon from '@cetus/ui-kit/src/components/Icon'
import { Box, Center, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import FilterTable from './FilterTable'

interface TokenDropSelectProps {
  children: ReactNode
  onCoinSelect: (item: any) => void
  whiteTokenList?: any
  selectCoin?: any
}
const tabList = [
  {
    label: 'Watchlist',
    value: 'watchlist'
  },
  {
    label: 'Trending',
    value: 'trending'
  },
  {
    label: 'Imported',
    value: 'Imported'
  }
  // {
  //   label: 'Top Gainers',
  //   value: 'topGainers'
  // }
]
export default function TokenDropSelectBlock({ children, selectCoin, whiteTokenList, onCoinSelect }: TokenDropSelectProps) {
  const { isApp } = useWindowWidth()
  const firstItemRef = useRef(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [currentTab, setCurrentTab] = useState('Trending')

  const [isLoading, setIsLoading] = useState(true)

  const { recentSearchTokens, proTokenMap, setClearRecentSearchTokens, setRecentSearchTokens } = useProStore()

  const { getProCoinList, getProCoinListWithCoins } = useGetApiData()
  const [inputValue, setInputValue] = useState('')
  const [tokenList, setTokenList] = useState<any>()
  const { userCollectObj, importTokenList } = useTokenSelectStore()

  const [watchList, setWatchList] = useState([])

  const showList = useMemo(() => {
    if ((currentTab === 'Watchlist' || currentTab === 'Imported') && !inputValue) {
      return watchList
    }
    return tokenList
  }, [currentTab, watchList, tokenList, inputValue])

  // 获取trending列表
  const fetchProData = async (params: any, isLoading = true) => {
    setIsLoading(isLoading)
    try {
      const res = await getProCoinList(params)
      setTokenList(res.list)
      setIsLoading(false)
    } catch (err) {
      console.log('🚀 ~ fetchProData ~ err:', err)
      setIsLoading(false)
    }
  }
  const getWatchList = async (text?: string, isLoading = true, tab = currentTab) => {
    setIsLoading(isLoading)
    const coins = tab === 'Watchlist' ? Object?.keys(userCollectObj) || [] : importTokenList?.map((item: any) => item?.coin_type) || []

    console.log('🚀 ~ getWatchList ~ coins:', coins)
    if (coins?.length == 0) {
      setWatchList([])
    } else {
      const list: any = await getProCoinListWithCoins(coins, 'hour24', text)
      setWatchList(list)
    }
    setIsLoading(false)
  }

  const handleClose = () => {
    setInputValue('')
    setTokenList([])
    setWatchList([])
    setIsLoading(true)
    onClose()
  }

  useEffect(() => {
    console.log('TokenDropSelectBlock isOpen###', isOpen)
    if (isOpen) {
      // getUserCollectList() carouselBlock有调用
      setInputValue('')
      setCurrentTab('Trending')
      fetchProData(trendingCarouselParams)
    }
  }, [isOpen])

  const handleRefresh = () => {
    console.log('🚀 ~ handleRefresh ~ currentTab:', currentTab)
    if (inputValue) {
      debouncedFilter(inputValue, false)
    } else {
      if (currentTab === 'Trending') {
        fetchProData(trendingCarouselParams, false)
      } else {
        getWatchList('', false)
      }
    }
  }
  // 1分钟自动刷新
  useEffect(() => {
    const intervalId = setInterval(handleRefresh, 60 * 1000)
    return () => clearInterval(intervalId)
  }, [currentTab, inputValue])

  useEffect(() => {
    if (currentTab === 'Watchlist') {
      getWatchList()
    }
  }, [userCollectObj])

  useEffect(() => {
    if (currentTab === 'Imported') {
      getWatchList()
    }
  }, [importTokenList])

  // 监听全局点击，关闭 Popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        // onClose()
        handleClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  const handleInputChange = (value: string) => {
    const regValue = value.replace(/[^[a-zA-Z0-9\s]+$/g, '')
    setInputValue(regValue)
    debouncedFilter(regValue)
  }

  const debouncedFilter = useDebounceFunction((value: string, isLoading = true) => {
    console.log('🚀 ~ debouncedFilter ~ result:', value)
    fetchProData({ text: value }, isLoading)
  }, 500)

  const handleCurrentTab = (label: string) => {
    setIsLoading(true)
    setWatchList([])
    setCurrentTab(label)
    if (label == 'Trending') {
      fetchProData(trendingCarouselParams)
    } else {
      getWatchList('', true, label)
    }
  }

  const [hoverIconIndex, setHoverIconIndex] = useState(-1)
  return (
    <div ref={popoverRef}>
      <Popover
        isLazy
        placement="bottom-end"
        modifiers={[
          {
            name: 'flip',
            enabled: false // Disable automatic flip
          },
          {
            name: 'shift',
            enabled: false // Disable automatic shift
          }
        ]}
        initialFocusRef={firstItemRef}
        isOpen={isOpen}
        trigger="click"
        // onClose={onClose}
        onClose={handleClose}
        onOpen={onOpen}
      >
        <PopoverTrigger>
          <Center
            sx={{
              '.singleTokenInfoBox': {
                '.arrow_icon': {
                  transition: 'transform 0.5s',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }
              }
            }}
            ref={firstItemRef}
            as="button"
            onClick={() => onOpen()}
          >
            {children}
          </Center>
        </PopoverTrigger>
        {isOpen && (
          <PopoverContent
            ml={{ base: '12px', lg: '20px' }}
            w={{
              base: 'calc(100vw - 24px)',
              lg: '340px'
            }}
          >
            <PopoverBody p="0px">
              <VStack align="flex-start" w="100%" p="8px" borderRadius="12px">
                <Box
                  w="100%"
                  // mb="8px"
                  sx={{
                    input: {
                      borderRadius: '8px',
                      fontSize: '14px'
                    }
                  }}
                >
                  <SearchInput placeholder="Search tokens" searchText={inputValue} onChange={(value: string) => handleInputChange(value)} />
                </Box>
                {recentSearchTokens && recentSearchTokens?.length > 0 && (
                  <VStack w="100%" align="flex-start" gap="8px">
                    <HStack w="100%" justify="space-between">
                      <Text fontSize="12px" color="text_caption" m="4px 0">
                        Recent Searches
                      </Text>
                      <Text _hover={{ color: 'text_caption' }} fontSize="12px" cursor="pointer" onClick={() => setClearRecentSearchTokens()}>
                        Clear all
                      </Text>
                    </HStack>
                    <HStack gap="8px" flexWrap="wrap">
                      {recentSearchTokens?.toReversed()?.map((token: Token, index) => {
                        return (
                          <HStack
                            key={token.coin_type}
                            w="auto"
                            p={{ base: '6px 8px', lg: '6px 12px' }}
                            align="center"
                            borderRadius="8px"
                            background="bg_secondary"
                            borderStyle="solid"
                            border="1px"
                            borderColor="border"
                            cursor="pointer"
                            position="relative"
                            userSelect="none"
                            _hover={{
                              background: 'primary_opacity.10'
                            }}
                            onClick={() => {
                              onCoinSelect(token)
                              handleClose()
                            }}
                            onMouseEnter={() => setHoverIconIndex(index)}
                            onMouseLeave={() => setHoverIconIndex(-1)}
                          >
                            <SingleTokenInfo
                              haveVerified
                              token={token}
                              imgBoxStyle={{ w: '20px', h: '20px' }}
                              symbolFontSize="14px"
                              haveName={false}
                              warningIcon={{ iconW: '10px', iconH: '10px' }}
                            />
                            {hoverIconIndex == index ? (
                              <Icon
                                xlinkHref="#icon-icon_close"
                                variant="round"
                                position="absolute"
                                boxW="20px"
                                boxH="20px"
                                top="-8px"
                                right="-8px"
                                onClick={e => {
                                  e.stopPropagation()
                                  setRecentSearchTokens(token, true)
                                }}
                              />
                            ) : null}
                          </HStack>
                        )
                      })}
                    </HStack>
                  </VStack>
                )}
                {!inputValue && (
                  <SelectTab
                    type="outlineTab"
                    wrapStyle={{
                      w: {
                        base: '100%'
                      },
                      gap: '0',
                      borderRadius: '8px',
                      p: '4px'
                    }}
                    itemStyle={{
                      w: 'calc(100% / 3)',
                      fontSize: '12px',
                      h: '28px',
                      p: '8px 0px'
                    }}
                    tabList={tabList}
                    currentTab={currentTab}
                    handleChangeTab={item => handleCurrentTab(item.label)}
                  />
                )}
                {showList?.length == 0 && !isLoading ? (
                  <Center w="100%" sx={{ p: { color: 'primary_gray', fontSize: '12px' } }}>
                    <NoData
                      type="nodata"
                      p="12px"
                      text={currentTab == 'Watchlist' ? 'No tokens in your watchlist.' : currentTab == 'Imported' ? 'No Imported Tokens' : 'No Data'}
                      noBorder
                    />
                  </Center>
                ) : (
                  <Box w="100%" maxH="310px" overflow="auto">
                    <FilterTable
                      isShowDelete={currentTab === 'Imported'}
                      isLoading={isLoading}
                      data={showList}
                      onRowClick={(item: any) => {
                        const tokenInfo = item?.coin_type ? item : proTokenMap?.get(item?.coinType)
                        onCoinSelect({ ...item, ...tokenInfo })
                        setRecentSearchTokens({ ...item, ...tokenInfo })
                        // onClose()
                        handleClose()
                      }}
                    />
                  </Box>
                )}
              </VStack>
            </PopoverBody>
          </PopoverContent>
        )}
      </Popover>
    </div>
  )
}
