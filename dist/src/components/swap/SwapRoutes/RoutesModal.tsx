import V3Router from '@/components/swap/V3Router'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { SingleCoinImage } from '@cetus/ui-kit'
import { addComma, bnToAmount } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Box, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import OverView from './OverView'

interface RoutesModalProps {
  isOpen: boolean
  onClose: () => void
  data?: any
  mergeSwapData?: {
    allRoutes: any
    currentIndex?: number
  }
  fromCoin?: Token
  toCoin?: Token
  fromAmount?: string
  toAmount?: string
  allProviders?: string[]
}

const RoutesModal = ({ isOpen, onClose, data, fromCoin, toCoin, fromAmount, toAmount, allProviders, mergeSwapData }: RoutesModalProps) => {
  const { isApp } = useWindowWidth()
  const { getTokenListInfo } = useGetToken()

  const allRoutes = mergeSwapData?.allRoutes
  const currentIndex = mergeSwapData?.currentIndex ?? 0
  const isMergeSwap = Boolean(allRoutes?.length)

  const [currentMergeSwapIndex, setCurrentMergeSwapIndex] = useState(currentIndex)
  const [mergeFromCoinList, setMergeFromCoinList] = useState<any[]>([])

  const stableAllRoutes = useMemo(() => allRoutes, [allRoutes])

  useEffect(() => {
    if (allRoutes?.length) {
      if (currentIndex >= allRoutes?.length) {
        setCurrentMergeSwapIndex(0)
      } else {
        setCurrentMergeSwapIndex(currentIndex)
      }
    }
  }, [currentIndex, allRoutes?.length])

  const handleChangeMergeSwapIndex = (coinType: string) => {
    const index = allRoutes?.findIndex((item: any) => fixCoinType(item.paths[0].from) === fixCoinType(coinType)) ?? -1
    if (index >= 0) {
      setCurrentMergeSwapIndex(index)
    }
  }

  const v3RouterData = useMemo(() => {
    if (isMergeSwap && stableAllRoutes?.[currentMergeSwapIndex]) {
      return { routerData: stableAllRoutes[currentMergeSwapIndex] }
    }
    return data
  }, [isMergeSwap, stableAllRoutes, currentMergeSwapIndex, data])

  const currentAllProviders = useMemo(() => {
    // if (isMergeSwap && stableAllRoutes?.[currentMergeSwapIndex]) {
    //   const providers = stableAllRoutes[currentMergeSwapIndex]?.paths.map((item: any) => item.provider) as string[]
    //   return [...new Set(providers)] // 去重
    // }
    return allProviders || []
  }, [isMergeSwap, stableAllRoutes, currentMergeSwapIndex, allProviders])

  const getTokenListInfoRef = useRef(getTokenListInfo)
  getTokenListInfoRef.current = getTokenListInfo

  const [mergeSwapToCoin, setMergeSwapToCoin] = useState(toCoin)

  useEffect(() => {
    if (!isMergeSwap || !stableAllRoutes?.length) return

    const fetchMergeFromCoinList = async () => {
      try {
        const coinTypeList = stableAllRoutes.map((item: any) => item.paths[0].from)
        const toCoinType = stableAllRoutes[0]?.paths[stableAllRoutes[0]?.paths.length - 1]?.target

        if (!toCoinType) return

        const res = await getTokenListInfoRef.current([...coinTypeList, toCoinType])
        if (!res) return

        const toCoin = res.get(toCoinType)

        setMergeSwapToCoin(toCoin)

        const coinListData = stableAllRoutes.map((item: any) => {
          const fromCoinType = item.paths[0].from
          const fromCoin = res.get(fromCoinType)

          return {
            ...fromCoin,
            amountIn: bnToAmount(item.amountIn?.toString(), fromCoin?.decimals || 0),
            amountOut: bnToAmount(item.amountOut?.toString(), toCoin?.decimals || 0)
          }
        })

        setMergeFromCoinList(coinListData)
      } catch (error) {
        console.error('Failed to get merge from coin list:', error)
      }
    }

    fetchMergeFromCoinList()
  }, [isMergeSwap, stableAllRoutes])

  const fromCoinType = useMemo(() => {
    if (isMergeSwap && mergeFromCoinList.length > 0 && currentMergeSwapIndex >= 0) {
      return mergeFromCoinList[currentMergeSwapIndex]?.coin_type
    }
    return fromCoin?.coin_type
  }, [isMergeSwap, mergeFromCoinList, currentMergeSwapIndex, fromCoin?.coin_type])

  const currentToCoin = useMemo(() => {
    if (isMergeSwap && mergeSwapToCoin?.coin_type) {
      return mergeSwapToCoin
    }
    return toCoin
  }, [isMergeSwap, mergeSwapToCoin?.coin_type, toCoin?.coin_type])

  const currentToAmount = useMemo(() => {
    if (isMergeSwap && mergeFromCoinList.length > 0 && currentMergeSwapIndex >= 0) {
      return mergeFromCoinList[currentMergeSwapIndex]?.amountOut
    }
    return toAmount
  }, [isMergeSwap, mergeFromCoinList, currentMergeSwapIndex, toAmount])

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="1200px" w={isApp ? 'calc(100vw - 32px)' : '910px'} bg="background">
        <ModalHeader mr="-10px">
          <HStack w="100%" gap="24px" justify="space-between" align="center">
            <Text fontSize="16px" fontWeight="500" color="text_caption">
              Route
            </Text>
            <HStack gap="0" align="center">
              <OverView allProviders={currentAllProviders} />
              <ModalCloseButton mt="0" position="static" />
            </HStack>
          </HStack>
        </ModalHeader>

        <ModalBody p={{ base: '8px 16px', lg: '16px' }}>
          <Box w="100%" overflowX={isApp ? 'auto' : 'hidden'}>
            <Box w="876px">
              <HStack w="100%" h="100%" justify="space-between" align="center" mb="16px">
                {isMergeSwap ? (
                  <FromCoinTabs list={mergeFromCoinList} defaultIndex={currentMergeSwapIndex} onChange={handleChangeMergeSwapIndex} />
                ) : (
                  <HStack>
                    <SingleCoinImage imageUrl={fromCoin?.logo_url} w="24px" h="24px" />
                    <Text fontSize="14px" fontWeight="500" color="text_caption">
                      {addComma(fromAmount || '0')}
                    </Text>
                    <Text fontSize="14px" fontWeight="500" color="primary_gray">
                      {fromCoin?.symbol}
                    </Text>
                  </HStack>
                )}
                <HStack>
                  <Text fontSize="14px" fontWeight="500" color="text_caption">
                    {addComma(currentToAmount || '0')}
                  </Text>
                  <Text fontSize="14px" fontWeight="500" color="primary_gray">
                    {currentToCoin?.symbol}
                  </Text>
                  <SingleCoinImage imageUrl={toCoin?.logo_url} w="24px" h="24px" />
                </HStack>
              </HStack>
              {fromCoinType && currentToCoin?.coin_type && (
                <V3Router data={v3RouterData} originFromCoinType={fromCoinType} originToCoinType={currentToCoin?.coin_type} />
              )}
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

function FromCoinTabs({ list, defaultIndex, onChange }: { list: any; defaultIndex: number; onChange: (coinType: string) => void }) {
  const currentCoinType = list[defaultIndex]?.coin_type

  const handleChangeCoinType = useCallback(
    (coinType: string) => {
      onChange(coinType)
    },
    [onChange]
  )

  return (
    <HStack gap="4px">
      {list.map((item: any) => (
        <FromCoinItem
          key={item.coin_type}
          coin={item}
          amount={item.amountIn}
          isActive={item.coin_type === currentCoinType}
          onClick={handleChangeCoinType}
        />
      ))}
    </HStack>
  )
}

function FromCoinItem({ coin, amount, isActive, onClick }: { coin: Token; amount: string; isActive: boolean; onClick: (coinType: string) => void }) {
  const handleClick = useCallback(() => {
    onClick(coin.coin_type)
  }, [onClick, coin.coin_type])

  return (
    <HStack
      gap="0px"
      borderRadius="16px"
      border="1px solid"
      borderColor={isActive ? 'primary' : '#262626'}
      h="32px"
      p="4px"
      bg={isActive ? 'primary_opacity.10' : 'transparent'}
      _hover={{
        borderColor: 'primary'
      }}
      cursor="pointer"
      onClick={handleClick}
    >
      <SingleCoinImage imageUrl={coin?.logo_url} w="24px" h="24px" borderRadius="12px" />
      {isActive && (
        <HStack gap="4px" p="0px 4px" pr="8px">
          <Text fontSize="14px" fontWeight="500" color="text_caption">
            {addComma(amount || '0')}
          </Text>
          <Text fontSize="14px" fontWeight="500" color="primary_gray">
            {coin?.symbol}
          </Text>
        </HStack>
      )}
    </HStack>
  )
}

export default RoutesModal
