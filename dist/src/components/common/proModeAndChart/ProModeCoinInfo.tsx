import useProStore from '@/store/pro'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import CoinAuditCheck from './CoinAuditCheck'
import CoinBaseData from './CoinBaseData'
import CoinDetailData from './CoinDetailData'
import CoinHeader from './CoinHeader'
import CoinProgressData from './CoinProgressData'

const ProModeCoinInfo = ({
  handleToggleDirect,
  whiteTokenList,
  onCoinSelect
}: {
  handleToggleDirect: () => void
  onCoinSelect: (item: any) => void
  whiteTokenList?: any
}) => {
  const { isApp } = useWindowWidth()
  const defaultTab = { label: '24H', value: '', labelValue: 'hour24' }
  const [currentTab, setCurrentTab] = useState(defaultTab)
  const { showTokenInfo, coinMarketData, coinMarketDataLoading, coinAuditCheckData, coinAuditCheckLoading } = useProStore()
  useEffect(() => {
    setCurrentTab(defaultTab)
  }, [showTokenInfo?.coin_type])
  const marketData = useMemo(() => {
    return coinMarketData?.market?.[currentTab?.labelValue] || {}
  }, [coinMarketData, currentTab?.labelValue])

  const getMarketData = (labelValue: string) => {
    return coinMarketData?.market?.[labelValue]
  }

  const tabList = [
    {
      label: '30M',
      labelValue: 'm30',
      value: '+2.12%'
    },
    {
      label: '1H',
      labelValue: 'hour1',
      value: '+2.12%'
    },
    {
      label: '4H',
      labelValue: 'hour4',
      value: '+2.12%'
    },
    {
      label: '24H',
      labelValue: 'hour24',
      value: '+2.12%'
    }
  ]
  return (
    <VStack w={{ base: '100%', lg: '340px' }} align="flex-start">
      <CoinHeader whiteTokenList={whiteTokenList} onCoinSelect={onCoinSelect} handleToggleDirect={handleToggleDirect} h5ShowIcon={false} />
      <CoinBaseData />
      <Box h="1px" w="100%" bg="border" m="12px 0" />
      <HStack gap="0" p="4px" justify="space-between" w="100%" bg="bg_secondary" borderRadius="12px" border="1px solid" borderColor="border">
        {tabList?.map((tab, index) => {
          const isActive = tab?.label == currentTab?.label
          const data = getMarketData(tab.labelValue)
          return (
            <VStack
              w="25%"
              borderRadius="8px"
              align="center"
              justify="center"
              key={`${tab.label}#${index}`}
              cursor="pointer"
              p="8px"
              bg={isActive ? 'card_bg' : 'none'}
              onClick={() => setCurrentTab(tab)}
            >
              <Text
                fontSize="12px"
                whiteSpace="nowrap"
                color={isActive ? 'text_caption' : 'primary_gray'}
                _hover={{ color: isApp ? 'none' : 'text_caption' }}
              >
                {tab.label}
              </Text>
              <Skeleton isLoaded={!coinMarketDataLoading} w="80%">
                <Text
                  whiteSpace="nowrap"
                  color={data?.priceChange?.includes('-') ? 'primary_red' : data?.priceChange === '0%' ? 'text_caption' : 'primary_green'}
                  textAlign="center"
                >
                  {data?.priceChange}
                </Text>
              </Skeleton>
            </VStack>
          )
        })}
      </HStack>
      <CoinProgressData marketData={marketData} />
      <Box h="1px" w="100%" bg="border" m="12px 0" />
      <CoinDetailData />
      <Box h="1px" w="100%" bg="border" m="12px 0" />
      <CoinAuditCheck coinAuditCheckData={coinAuditCheckData} coinAuditCheckLoading={coinAuditCheckLoading} />
    </VStack>
  )
}

export default ProModeCoinInfo
