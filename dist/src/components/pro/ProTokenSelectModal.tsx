import useGetApiData from '@/hooks/pro/useGetApiData'
import useProStore from '@/store/pro'
import { SelectTab, TooltipIcon } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import { useDebounceFunction } from '@cetus/hooks'
import useTokenSelectStore from '@cetus/stores/src/useTokenSelectStore'
import { Token } from '@cetus/types'
import { NoData, SearchInput } from '@cetus/ui-kit'
import Icon from '@cetus/ui-kit/src/components/Icon'
import {
  Box,
  Center,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
  useDisclosure
} from '@chakra-ui/react'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import FilterTable from '../common/proModeAndChart/tokenDropSelect/FilterTable'
import { trendingCarouselParams } from './CarouselBlock'

interface ProTokenSelectModalProps {
  children: ReactNode
  onCoinSelect: (item: any) => void
}

const tabList = [
  { label: 'Watchlist', value: 'watchlist' },
  { label: 'Trending', value: 'trending' },
  {
    label: 'Imported',
    value: 'Imported'
  }
  // { label: 'Top Gainers', value: 'topGainers' },
  // { label: '24H Volume', value: 'volume24h' }
]

export default function ProTokenSelectModal({ children, onCoinSelect }: ProTokenSelectModalProps) {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { recentSearchTokens, proTokenMap, setClearRecentSearchTokens, setRecentSearchTokens } = useProStore()
  const { getProCoinList, getProCoinListWithCoins } = useGetApiData()
  const { userCollectObj, importTokenList } = useTokenSelectStore()

  const [currentTab, setCurrentTab] = useState('Trending')
  const [isLoading, setIsLoading] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const [tokenList, setTokenList] = useState<any>()
  const [hoverIconIndex, setHoverIconIndex] = useState(-1)

  const [watchList, setWatchList] = useState([])

  const showList = useMemo(() => {
    if ((currentTab === 'Watchlist' || currentTab === 'Imported') && !inputValue) {
      return watchList
    }

    return tokenList
  }, [currentTab, watchList, tokenList, inputValue])

  // 获取trending列表
  const fetchProData = async (params: any) => {
    setIsLoading(true)
    try {
      const res = await getProCoinList(params)
      setTokenList(res.list)
      setIsLoading(false)
    } catch (err) {
      console.log('🚀 ~ fetchProData ~ err:', err)
      setIsLoading(false)
    }
  }
  const getWatchList = async (text?: string, tab = currentTab) => {
    setIsLoading(true)
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
    setIsLoading(true)
    onClose()
  }

  useEffect(() => {
    console.log('TokenDropSelectBlock isOpen###', isOpen)
    if (isOpen) {
      // getUserCollectList()
      setInputValue('')
      setCurrentTab('Trending')
      fetchProData(trendingCarouselParams)
    }
  }, [isOpen])

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

  const handleInputChange = (value: string) => {
    const regValue = value.replace(/[^[a-zA-Z0-9\s]+$/g, '')
    setInputValue(regValue)
    debouncedFilter(regValue)
  }

  const debouncedFilter = useDebounceFunction((value: string) => {
    console.log('🚀 ~ debouncedFilter ~ result:', value)
    fetchProData({ text: value })
  }, 500)

  const handleCurrentTab = (label: string) => {
    setIsLoading(true)
    setWatchList([])
    setCurrentTab(label)
    if (label == 'Trending') {
      fetchProData(trendingCarouselParams)
    } else {
      getWatchList('', label)
    }
  }

  return (
    <>
      <Box as="button" onClick={onOpen}>
        {children}
      </Box>

      <Modal isOpen={isOpen} onClose={handleClose} isCentered size="md">
        <ModalOverlay />
        <ModalContent p="0">
          <ModalHeader>Search Tokens</ModalHeader>
          <ModalCloseButton />
          <ModalBody p="0 16px 16px">
            <VStack align="flex-start" w="100%">
              <Box
                w="100%"
                sx={{
                  input: {
                    borderRadius: '8px',
                    fontSize: '14px'
                  }
                }}
              >
                <SearchInput
                  placeholder="Search by token or address"
                  searchText={inputValue}
                  onChange={(value: string) => handleInputChange(value)}
                />
              </Box>

              {recentSearchTokens && recentSearchTokens?.length > 0 && (
                <VStack w="100%" align="flex-start" gap="8px">
                  <HStack w="100%" justify="space-between">
                    <Text fontSize="12px" color="text_caption" m="8px 0">
                      Recent Searches
                    </Text>
                    <Text _hover={{ color: 'text_caption' }} fontSize="12px" cursor="pointer" onClick={() => setClearRecentSearchTokens()}>
                      Clear all
                    </Text>
                  </HStack>
                  <HStack gap="8px" flexWrap="wrap">
                    {recentSearchTokens?.toReversed().map((token: Token, index) => (
                      <HStack
                        key={token.coin_type}
                        p="6px 8px"
                        align="center"
                        borderRadius="8px"
                        background="bg_secondary"
                        border="1px solid"
                        borderColor="border"
                        cursor="pointer"
                        position="relative"
                        _hover={{ background: 'primary_opacity.10' }}
                        onClick={() => {
                          onCoinSelect(token)
                          handleClose()
                        }}
                        onMouseEnter={() => setHoverIconIndex(index)}
                        onMouseLeave={() => setHoverIconIndex(-1)}
                      >
                        <SingleTokenInfo
                          haveVerified
                          warningIcon={{ iconH: '12px', iconW: '12px' }}
                          token={token}
                          imgBoxStyle={{ w: '20px', h: '20px' }}
                          symbolFontSize="14px"
                          haveName={false}
                        />
                        {hoverIconIndex === index && (
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
                        )}
                      </HStack>
                    ))}
                  </HStack>
                </VStack>
              )}

              {!inputValue && (
                <SelectTab
                  type="outlineTab"
                  wrapStyle={{ w: '100%', gap: '0', borderRadius: '8px', p: '4px' }}
                  itemStyle={{ w: 'calc(100% / 3)', fontSize: '12px', h: '28px', p: '8px 0px' }}
                  tabList={tabList}
                  currentTab={currentTab}
                  handleChangeTab={item => handleCurrentTab(item.label)}
                />
              )}
              {showList?.length === 0 && !isLoading ? (
                <Center w="100%">
                  <VStack w="100%" alignItems="center" justify="center" gap="0px" my={'1rem'}>
                    <NoData type="nodata" text="No tokens found" noBorder bg="none" p="0" />
                    <HStack gap="0">
                      <Text fontSize="12px">Or you can enter Coin Type</Text>
                      <TooltipIcon tooltipCon="The unique id of coin" />
                    </HStack>
                  </VStack>
                </Center>
              ) : (
                // <Center w="100%" sx={{ p: { color: 'primary_gray', fontSize: '12px' } }}>
                //   <NoData
                //     type="nodata"
                //     p="12px"
                //     text={currentTab == 'Watchlist' ? 'No tokens in your watchlist.' : currentTab == 'Imported' ? 'No Imported Tokens' : 'No Data'}
                //     noBorder
                //   />
                // </Center>
                <Box w="100%" maxH="400px" overflowY="auto">
                  <FilterTable
                    isShowDelete={currentTab === 'Imported'}
                    isLoading={isLoading}
                    data={showList}
                    onRowClick={item => {
                      const tokenInfo = item?.coin_type ? item : proTokenMap?.get(item?.coinType)
                      onCoinSelect({ ...item, ...tokenInfo })
                      setRecentSearchTokens({ ...item, ...tokenInfo })
                      handleClose()
                    }}
                  />
                </Box>
              )}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}
