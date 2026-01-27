import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Center, VStack } from '@chakra-ui/react'
import TopTabs from '../TopTabs'
import { HistoryTable } from './HistoryTable'
import MarginPoolFilter from './MarginPoolFilter'
import { MarginPoolTable } from './MarginPoolTable'
import TopShowData from './TopShowData'

export default function MarginPool() {
  const currentPageTab = useDeepBookMarginPoolStore(state => state.currentPageTab)
  const poolsSort = useDeepBookMarginPoolStore(state => state.poolsSort)
  const setPoolsSort = useDeepBookMarginPoolStore(state => state.setPoolsSort)
  const { isApp } = useWindowWidth()

  const sortByList = [
    { label: 'Total Supply', value: 'supply' },
    { label: 'Supply APY', value: 'apy' },
    { label: 'Your Holdings', value: 'holdings' }
  ]

  const clickSort = (item: any) => {
    let sort: any
    if (isApp) {
      if (item?.value !== poolsSort?.sortBy?.value) {
        sort = {
          sortBy: item,
          sortRule: 'desc'
        }
      }
    } else {
      if (item?.value == poolsSort?.sortBy?.value) {
        const rule = poolsSort?.sortRule == 'desc' ? 'asc' : 'desc'
        sort = {
          sortBy: item,
          sortRule: rule
        }
      } else {
        sort = {
          sortBy: item,
          sortRule: 'desc'
        }
      }
    }
    setPoolsSort(sort)
  }
  return (
    <VStack w="100%" gap="0">
      <Center
        w={{ base: '100%', lg: 'calc(100% + 40px)' }}
        borderBottom="1px solid"
        borderColor="border"
        sx={isApp ? {} : { '>div': { bg: 'transparent', justifyContent: 'center' } }}
      >
        <TopTabs />
      </Center>
      <VStack p={{ base: '0 12px', lg: 'unset' }} gap="0" w={{ base: '100%', lg: '1200px' }}>
        <Block bg="transparent" p="0px" borderRadius="8px" border="none" overflow="visible">
          <VStack>
            <TopShowData />
          </VStack>
        </Block>
        <MarginPoolFilter sortByList={sortByList} clickSort={clickSort} />
        {currentPageTab == 'Pools' && <MarginPoolTable sortByList={sortByList} clickSort={clickSort} />}
        {currentPageTab == 'History' && <HistoryTable />}
      </VStack>
    </VStack>
  )
}
