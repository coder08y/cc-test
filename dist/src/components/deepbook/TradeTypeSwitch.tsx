import NewPic from '@/assets/images/icon_beta@2x.png'
import useDeepBookStore from '@/store/deepbook'
import useDeepBookMarginStore from '@/store/deepbook/margin'
import { HStack, Image, Text } from '@chakra-ui/react'
import { useEffect, useMemo, useRef } from 'react'
import EnableMarginTradingModal from './Margin/EnableMarginTradingModal'
import { TabItem } from './Margin/TabItem'

export default function TradeTypeSwitch() {
  const currentDeepBookPool = useDeepBookStore(state => state.currentDeepBookPool)
  const setCurrentDeepBookPool = useDeepBookStore(state => state.setCurrentDeepBookPool)
  const tradeTypeByPool = useDeepBookStore(state => {
    return state.tradeTypeByPool
  })
  const getTradeType = useDeepBookStore(state => state.getTradeType)
  const setTradeType = useDeepBookStore(state => state.setTradeType)
  const { marginTradingEnabled, setEnableMarginTradingModalOpen } = useDeepBookMarginStore()
  const prevAddressRef = useRef<string | undefined>(undefined)

  const poolAddress = useMemo(() => {
    return currentDeepBookPool?.address
  }, [currentDeepBookPool?.address])
  const tradeType = useMemo(() => {
    return poolAddress ? tradeTypeByPool[poolAddress] || 'Spot' : 'Spot'
  }, [poolAddress, tradeTypeByPool])

  const prevTradeTypeRef = useRef<'Spot' | 'Margin' | undefined>(undefined)

  // 当切换池子时，根据保存的 tradeType 设置 isMarginPool
  useEffect(() => {
    if (poolAddress && prevAddressRef.current !== poolAddress) {
      prevAddressRef.current = poolAddress
      const savedTradeType = getTradeType(poolAddress)
      const shouldBeMargin = savedTradeType === 'Margin'
      // 更新 prevTradeTypeRef 为当前池子的 tradeType
      prevTradeTypeRef.current = savedTradeType
      // 根据保存的 tradeType 设置 isMarginPool
      if (currentDeepBookPool.isMarginPool !== shouldBeMargin) {
        setCurrentDeepBookPool({
          ...currentDeepBookPool,
          isMarginPool: true
        })
      }
    }
  }, [poolAddress, currentDeepBookPool?.address, getTradeType, setCurrentDeepBookPool])

  // 当 tradeType 变化时（用户切换标签），同步更新 currentDeepBookPool.isMarginPool
  useEffect(() => {
    if (poolAddress && prevTradeTypeRef.current !== undefined && prevTradeTypeRef.current !== tradeType) {
      prevTradeTypeRef.current = tradeType
      const shouldBeMargin = tradeType === 'Margin'
      if (currentDeepBookPool.isMarginPool !== shouldBeMargin) {
        setCurrentDeepBookPool({
          ...currentDeepBookPool,
          isMarginPool: shouldBeMargin
        })
      }
    }
  }, [tradeType, poolAddress, currentDeepBookPool, setCurrentDeepBookPool])

  const handleTabChange = (tab: 'Spot' | 'Margin') => {
    if (poolAddress) {
      // 如果切换到 Margin 且 marginTradingEnabled 为 false，阻止切换并显示风险确认模态框
      if (tab === 'Margin' && !marginTradingEnabled) {
        setEnableMarginTradingModalOpen(true)
        return
      }
      setTradeType(poolAddress, tab)
    }
  }

  return !!currentDeepBookPool.enabled ? (
    <>
      <HStack
        justifyContent="space-between"
        w={{ base: 'auto', lg: '100%' }}
        bg={{ base: 'transparent', lg: 'bg_secondary' }}
        p={{ base: '0 12px 0 0', lg: '12px' }}
        borderRadius={{ base: '0', lg: '8px 8px 0 0' }}
        borderBottom={{ base: 'none', lg: '1px solid' }}
        borderColor={{ base: 'transparent', lg: 'border' }}
      >
        <Text display={{ base: 'none', lg: 'block' }} fontSize="16px" lineHeight="24px" fontWeight="500" color="text_caption">
          Trade
        </Text>
        <HStack
          border={{ base: 'none', lg: '1px solid' }}
          borderColor={{ base: 'transparent', lg: 'border' }}
          borderRadius={{ base: '0', lg: '8px' }}
          p="4px"
          gap="4px"
        >
          {['Spot', 'Margin'].map(tab => (
            <TabItem key={tab} active={tradeType === tab} onClick={() => handleTabChange(tab as 'Spot' | 'Margin')}>
              <HStack gap="4px">
                <Text fontSize="14px" lineHeight="16px" color={tradeType === tab ? 'primary' : 'text_paragraph'} _hover={{ color: 'primary' }}>
                  {tab}
                </Text>
                {tab === 'Margin' && <Image src={NewPic} alt="new" width="28px" height="12px" />}
              </HStack>
            </TabItem>
          ))}
        </HStack>
      </HStack>
      <EnableMarginTradingModal />
    </>
  ) : null
}
