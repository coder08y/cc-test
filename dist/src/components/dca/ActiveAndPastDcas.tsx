import useDcaActions from '@/hooks/dca/useDcaActions'
import { Block, SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Icon, NoData, Pagination, RefreshButton } from '@cetus/ui-kit'
import { d } from '@cetus/utils'
import { Button, Center, HStack, Skeleton, SkeletonCircle, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import DcaItem from './DcaItem'

export default function ActiveAndPastDcas({
  handleRefresh,
  activeList,
  pastList,
  isOrderLoading
}: {
  handleRefresh: (isLoading: boolean) => void
  activeList: any
  pastList: any
  isOrderLoading: boolean
}) {
  const pageSize = 10
  const [pageList, setPageList] = useState([])
  const [paginationList, setPaginationList] = useState([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)

  const { currentAccount, onWalletModal } = useAccountStore()
  const [currentTab, setCurrentTab] = useState<Tab>({
    label: 'Active DCAs',
    value: 'active'
  })

  const tabList: Tab[] = useMemo(
    () => [
      {
        label: 'Active DCAs',
        value: 'active',
        num: activeList?.length > 0 ? activeList?.length : undefined
      },
      {
        label: 'Past DCAs',
        value: 'past',
        num: pastList?.length > 0 ? pastList?.length : undefined
      }
    ],
    [currentTab?.value, activeList, pastList]
  )

  const handleChangeTab = (item: Tab) => {
    setCurrentPage(1)
    setCurrentTab(item)
  }

  useEffect(() => {
    const currentList = currentTab?.value === 'active' ? activeList : pastList
    setPageList(currentList)
    setTotal(currentList?.length)
  }, [currentTab?.value, activeList, pastList])

  useEffect(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    setPaginationList(pageList?.slice(start, end))
  }, [currentPage, pageList, currentTab?.value])

  const totalClaimNum = useMemo(() => {
    if (currentTab?.value === 'past' || pageList?.length === 0) return 0
    return pageList?.reduce((sum, orderInfo: any) => d(sum).plus(orderInfo?.outBalance as string), d(0)).toString()
  }, [currentTab?.value, pageList])

  const { closeAll, claimAll, isClaimAllLoading, isCloseAllLoading } = useDcaActions()

  const { isApp } = useWindowWidth()

  return (
    <VStack w="100%">
      <HStack w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }}>
        <HStack w={{ base: '100%', lg: 'unset' }} justify="space-between">
          <SelectTab
            type="borderTab"
            wrapStyle={{
              w: { base: '100%', lg: '300px' },
              h: '52px',
              gap: '32px',
              bg: 'none',
              border: 'none',
              mb: '8px'
            }}
            itemStyle={{ fontSize: '16px' }}
            tabList={tabList}
            currentTab={currentTab.label}
            handleChangeTab={handleChangeTab}
          />
          {isApp && <RefreshButton handleRefresh={handleRefresh} w="28px" h="28px" innerStyle={{ bg: 'none' }} />}
        </HStack>
        <HStack w={{ base: '100%', lg: 'unset' }}>
          {currentTab.value === 'active' && pageList?.length > 0 && currentAccount?.address && (
            <Button
              w={{ base: '50%', lg: 'unset' }}
              h="28px"
              minH="unset"
              p="0 10px"
              fontSize="14px"
              borderRadius="8px"
              variant="outline"
              color="primary_gray"
              _hover={{
                color: 'text_caption'
              }}
              isLoading={isClaimAllLoading}
              isDisabled={Number(totalClaimNum) === 0 || isClaimAllLoading}
              onClick={() => claimAll(pageList)}
              leftIcon={<Icon xlinkHref="#icon-icon_incentive" svgFill="primary" mr="-4px" ml="-4px" />}
            >
              Claim all
            </Button>
          )}
          {currentTab.value === 'active' && pageList?.length > 0 && currentAccount?.address && (
            <Button
              w={{ base: '50%', lg: 'unset' }}
              isLoading={isCloseAllLoading}
              isDisabled={pageList?.length == 0 || isCloseAllLoading}
              h="28px"
              borderRadius="8px"
              minH="unset"
              p="0 12px"
              fontSize="14px"
              variant="outline"
              color="primary_gray"
              _hover={{
                color: 'text_caption'
              }}
              onClick={() => closeAll(pageList)}
            >
              Close All
            </Button>
          )}
          {!isApp && <RefreshButton handleRefresh={handleRefresh} w="28px" h="28px" innerStyle={{ bg: 'none' }} />}
        </HStack>
      </HStack>
      {!currentAccount?.address ? (
        <NoData type="nowallet" onboard={() => onWalletModal(true)} />
      ) : isOrderLoading ? (
        <Block>
          <VStack
            gap="16px"
            sx={{ '>div': { borderBottom: '1px solid', borderColor: 'border', pb: '16px', _last: { borderBottom: 'none', pb: '0px' } } }}
          >
            {[{}, {}].map((item, index) => (
              <OrderLoading key={index} />
            ))}
          </VStack>
        </Block>
      ) : pageList?.length === 0 ? (
        <NoData type="nodata" text={currentTab?.value === 'active' ? 'No active orders' : 'No closed orders'} />
      ) : (
        <Block h={paginationList?.length > 8 ? '927px' : 'unset'} overflowY="auto" p={{ base: '12px', lg: '20px 16px' }}>
          <VStack
            gap="16px"
            sx={{ '>div': { borderBottom: '1px solid', borderColor: 'border', pb: '16px', _last: { borderBottom: 'none', pb: '0px' } } }}
          >
            {paginationList?.map((item: any) => (
              <DcaItem key={item?.orderID} currentTabVal={currentTab.value} orderInfo={item} />
            ))}
          </VStack>
          {!isOrderLoading && pageList?.length > pageSize && (
            <Center mt="28px">
              <Pagination total={total} size={pageSize} currentPage={currentPage} onChange={setCurrentPage} />
            </Center>
          )}
        </Block>
      )}
    </VStack>
  )
}

const OrderLoading = () => (
  <VStack w="100%" gap="16px" align="flex-start">
    <HStack w="100%" gap="0" justify="space-between">
      <HStack gap="0">
        <HStack gap="0px" mr="8px" align="flex-start">
          <SkeletonCircle size="8" />
          <SkeletonCircle size="8" />
        </HStack>
        <Skeleton height="4" width="100px" />
      </HStack>
      <Skeleton height="4" width="150px" />
    </HStack>
    <Skeleton height="4" width="180px" />
  </VStack>
)
