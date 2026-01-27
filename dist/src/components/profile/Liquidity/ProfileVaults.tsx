import CoinPairInfo from '@/components/common/CoinPairInfo'
import VaultsTableAction from '@/components/vaults-v2/common/ProfileActions'
import FarmingModal from '@/components/vaults-v2/farming/FarmingModal'
import VaultsHoldings from '@/components/vaults-v2/list/common/VaultsHoldings'
import VaultsPcTab from '@/components/vaults-v2/list/common/VaultsPcTab'
import { VaultsProvider } from '@/components/vaults-v2/list/common/VaultsProvider'
import VaultModal from '@/components/vaults-v2/modal'
import useGetPythTokenPrice from '@/hooks/vault-v2/pyth-price/useGetPythTokenPrice'
import useVaultList from '@/hooks/vault-v2/useVaultList'
import useActiveOrdersStore from '@/store/profile/activeOrders'
import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import useVaultsPythPriceStore from '@/store/vaults-v2/useVaultsPythPrice'
import { CetusTooltip, SortDropBlock, TableSortTh } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { H5MapTable, NoData, SingleCoinImage, Table } from '@cetus/ui-kit'
import { d, formatCurrency, formatNumber, isAvailableObject, symbolDataDisplayProcessing } from '@cetus/utils'
import { Box, Center, HStack, Image, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import HiddenDotted from '../HiddenDotted'

function ProfileVaults({
  selectCoinList = [],
  currentTab,
  setCurrentTab
}: {
  selectCoinList: any
  currentTab: any
  setCurrentTab: (data: any) => void
}) {
  const { vaultsPositionObj } = useVaultsPositionStore()
  const { vaultPageList, vaultListLoading, setVaultListLoading, setVaultPageList } = useVaultsListV2Store()
  const { filterVaultList } = useVaultList()
  const { profileActionTab, isProfileOpenVaultModal, setIsProfileOpenVaultModal, setProfilePoolInfo, profilePoolInfo, setCurrTab } =
    useVaultsActionStore()
  const { coinPriceObj } = useTokenPriceStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { getTokenAmountValueByPyth } = useGetPythTokenPrice()
  const { pythPriceMap } = useVaultsPythPriceStore()
  const { isAutoRefresh } = useActiveOrdersStore()
  const { isApp } = useWindowWidth()

  const [pageList, setPageList] = useState([])
  const [sortRule, setSortRule] = useState<'desc' | 'asc'>('desc')
  const [sortBy, setSortBy] = useState({ label: '', value: '' })

  const isYourHoldings = true
  const queryOptions: any = { sortRule: 'desc', sortType: 'tvl' }

  const sortByList = [
    { label: 'Your Holdings', value: 'holdings' },
    { label: 'Share of Pool', value: 'shareOfPool' }
  ]
  const sortByObject = Object.fromEntries(sortByList.map(item => [item.value, item]))

  const getAmountValue = (vault: any, coinType: string, amount: string) => {
    return vault.category === 'haedal' ? getTokenAmountValueByPyth(coinType, amount) : getTokenAmountValue(coinType, amount, '--')
  }

  useEffect(() => {
    console.log('🚀🚀🚀 ~ ProfileVaults.tsx:67 ~ useEffect ~ vaultPageList:', vaultPageList, !sortBy.value)
    if (!sortBy.value) setPageList(vaultPageList)
  }, [vaultPageList])

  useEffect(() => {
    if (isAvailableObject(vaultsPositionObj)) {
      filterVaultList({ sortOptions: queryOptions, currentTab: currentTab.value, isYourHoldings, selectCoinList }, undefined)
    }
  }, [vaultsPositionObj, selectCoinList.length, currentTab.value])

  useEffect(() => {
    if (sortBy.value) {
      const sorted = vaultPageList
        .map((vault: any) => {
          const position = vaultsPositionObj[vault?.vaultId] || {}
          const valueA = getAmountValue(vault, position.displayCoinTypeA, position.displayAmountA)
          const valueB = getAmountValue(vault, position.displayCoinTypeB, position.displayAmountB)
          const holdingAmount =
            valueA === '--' || valueB === '--'
              ? '0'
              : d(valueA)
                  .plus(valueB || 0)
                  .toString()
          return {
            ...vault,
            sharePoolRate: position?.sharePoolRate,
            holdingAmount: parseFloat(holdingAmount || '0'),
            holdingAmountDisplay: symbolDataDisplayProcessing(holdingAmount, '$')
          }
        })
        .sort((a: any, b: any) =>
          sortRule === 'asc'
            ? sortBy.value === 'holdings'
              ? a.holdingAmount - b.holdingAmount
              : a.sharePoolRate - b.sharePoolRate
            : sortBy.value === 'holdings'
              ? b.holdingAmount - a.holdingAmount
              : b.sharePoolRate - a.sharePoolRate
        )
      console.log('🚀🚀🚀 ~ ProfileVaults.tsx:86 ~ useEffect ~ sorted:', sorted)

      setPageList(sorted)
    }
  }, [vaultPageList.length, sortBy.value, sortRule, coinPriceObj, pythPriceMap])

  const clickSort = (item: any) => {
    if (item?.value !== sortBy?.value) {
      setSortBy(item)
      setSortRule('desc')
    } else if (!isApp) {
      setSortRule(prev => (prev === 'desc' ? 'asc' : 'desc'))
    }
  }

  const { vaultsFarmObj } = useVaultsFarmingStore()

  const columns = getColumns({
    isShowPowered: false,
    vaultsPositionObj,
    getAmountValue,
    sortRule,
    sortBy,
    sortByObject,
    clickSort,
    vaultsFarmObj,
    isApp
  })

  const { currentAccount } = useAccountStore()

  useEffect(() => {
    setPageList([])
    // toDo: 这里去掉的原因是如果vaults 列表数据已准备好，切换到vauls tab还是会成为Loading状态，需要等自动更新触发并成功后才能结束Loading，这样是不合理的
    // setVaultListLoading(true)
    if (!currentAccount?.address) {
      setVaultPageList([])
    }
  }, [currentAccount?.address])

  const handleVaultsTab = (data: any) => {
    console.log('🚀🚀🚀 ~ ProfileVaults.tsx:135 ~ handleVaultsTab ~ data:', data)
    setCurrentTab(data)
    filterVaultList({ sortOptions: queryOptions, currentTab: data.value, isYourHoldings, selectCoinList })
  }

  const [isOpenFarmingModal, setIsOpenFarmingModal] = useState(false)
  const [farmingModalAction, setFarmingModalAction] = useState('Stake')

  return (
    <VStack w="100%" align="flex-start">
      {isApp && (
        <Box zIndex="3">
          <SortDropBlock
            sortText="Sort by"
            minW="calc(100vw - 88px)"
            currentSort={sortBy}
            sortByList={sortByList}
            onSortByChange={clickSort}
            xlinkHref={sortRule === 'desc' ? '#icon-icon_sort2' : '#icon-icon_sort_asc1'}
            iconOnClick={() => setSortRule(prev => (prev === 'desc' ? 'asc' : 'desc'))}
            showArrow
          />
        </Box>
      )}
      {/* <SelectTab<any, any>
        type="outlineTab"
        tabList={tabList}
        currentTab={currentTab}
        // handleChangeTab={tab => setCurrentTab(tab?.value)}
        handleChangeTab={tab => handleTabChange(tab?.value)}
        isActive={(current, tab) => current === tab.value}
        wrapStyle={{
          h: '32px',
          p: '3px',
          border: '1px solid',
          borderColor: 'border',
          borderRadius: '8px',
          gap: '4px',
          zIndex: '2'
        }}
        itemStyle={{
          h: '24px',
          p: '4px 8px',
          borderRadius: '4px',
          gap: '4px'
        }}
      /> */}
      {!isApp && <VaultsPcTab currentTab={currentTab} onClickVaultsTab={value => handleVaultsTab(value)} />}

      <VStack w="100%" gap="20px">
        {(isAutoRefresh || !vaultListLoading) && pageList.length === 0 ? (
          <NoData type="nodata" text="No vaults found" noBorder />
        ) : isApp ? (
          <H5MapTable
            rowKey="clmmPoolAddress"
            columns={columns}
            dataSource={pageList}
            loading={!isAutoRefresh && vaultListLoading}
            itemSkeletonLength={5}
            itemHeight="30px"
            haveDividingLine={false}
            rowStyle={() => ({ borderRadius: '12px', border: '1px solid', borderColor: 'border', bg: 'bg_secondary', p: '12px 8px' })}
          />
        ) : (
          <Table
            rowKey="clmmPoolAddress"
            columns={columns}
            dataSource={pageList}
            loading={!isAutoRefresh && vaultListLoading}
            rowStyle={{ h: '80px', cursor: 'pointer' }}
            onRowClick={item => {
              setCurrTab('Deposit')
              setIsProfileOpenVaultModal(true)
              setProfilePoolInfo(item)
            }}
          />
        )}
      </VStack>
      {isProfileOpenVaultModal && (
        <VaultModal
          key={profilePoolInfo.vaultId}
          isOpen={isProfileOpenVaultModal}
          setIsOpenFarmingModal={setIsOpenFarmingModal}
          setFarmingModalAction={setFarmingModalAction}
          setIsOpen={setIsProfileOpenVaultModal}
          {...profilePoolInfo}
          vaultId={profilePoolInfo.vaultId}
          onClose={() => {
            setIsProfileOpenVaultModal(false)
          }}
        />
      )}

      {isOpenFarmingModal && (
        <FarmingModal
          isOpen={isOpenFarmingModal}
          setIsOpen={setIsOpenFarmingModal}
          setIsOpenPre={setIsProfileOpenVaultModal}
          onClose={() => setIsOpenFarmingModal(false)}
          farmingModalAction={farmingModalAction}
          vaultsId={profilePoolInfo?.vaultId}
          isDetail={false}
        />
      )}
    </VStack>
  )
}

const getColumns = ({
  isShowPowered,
  vaultsPositionObj,
  getAmountValue,
  sortRule,
  sortBy,
  sortByObject,
  clickSort,
  vaultsFarmObj,
  isApp
}: {
  isShowPowered: boolean
  vaultsPositionObj: any
  getAmountValue: (record: any, coin_type: string, amount: string) => void
  sortRule: 'asc' | 'desc'
  sortBy: any
  sortByObject: any
  clickSort: (value: any) => void
  vaultsFarmObj: any
  isApp?: boolean
}) => [
  {
    title: <Text>Pools</Text>,
    key: 'pools',
    showLabel: false,
    thConfig: {
      pl: '0px !important'
    },
    render: (record: any) => {
      const isVaultsFarming = vaultsFarmObj[record?.vaultId]?.isActiveVaultsFarming

      return (
        <CoinPairInfo
          poolInfo={{ ...record, poolAddress: record?.vaultId, poolType: record?.category !== 'haevault_v2' ? 'clmm' : '' }}
          isShowPowered={isShowPowered && record?.category !== 'cetus'}
          isShowVaultsFarmIcon={isVaultsFarming}
          symbolFontSize="15px"
          type="column"
          status={record?.status}
          showPoolTypeTag={record?.category === 'haevault_v2' ? false : true}
          showFee={record?.category === 'haevault_v2' ? false : true}
          poolType={record?.category !== 'haevault_v2' ? 'clmm' : 'dlmm'}
        />
      )
    }
  },
  {
    title: <Text textAlign="right">Provider</Text>,
    key: 'curator	',
    render: (record: any) => {
      return !isApp ? (
        <VaultsProvider category={record.category} version={record?.version} />
      ) : (
        <HStack gap="2px" width="max-content">
          <Image
            src={record?.category === 'cetus' ? '/images/cetus-logo@2x.png' : '/images/haedal-logo@2x.png'}
            w={record?.category === 'cetus' ? '20px' : '18px'}
            h={record?.category === 'cetus' ? '20px' : '18px'}
          />
          <Text color="text_caption" whiteSpace="nowrap">
            {record?.category === 'cetus' ? 'Cetus ' : `Haedal  ${record?.version === 'V1' ? 'v1' : 'v2'}`}
          </Text>
        </HStack>
      )
    }
  },
  {
    title: (
      <TableSortTh
        labelInfo={sortByObject['holdings']}
        defaultShowSortIcon={true}
        sortBy={sortBy}
        sortRule={sortRule}
        clickSort={(value: any) => clickSort(value)}
      />
    ),
    key: 'holdings',
    render: (record: any) => {
      const vaultsPosition = vaultsPositionObj[record?.vaultId] || {}
      const amountValueA = getAmountValue(record, record?.displayTokenA?.coin_type, vaultsPosition?.displayAmountA)
      const amountValueB = getAmountValue(record, record?.displayTokenB?.coin_type, vaultsPosition?.displayAmountB)
      return (
        <CetusTooltip
          placement="top"
          triggerStyle={{
            as: 'button'
          }}
          tooltip={
            <VStack gap="8px" align="flex-start" minW="200px">
              <HStack w="100%" gap="12px" justify="space-between">
                <HStack>
                  <SingleCoinImage imageUrl={record?.displayTokenA?.logo_url} imgBoxStyle={{ w: '20px', h: '20px' }} />
                  <Text color="text_caption" fontSize="12px">
                    {record?.displayTokenA?.symbol}
                  </Text>
                </HStack>
                <HiddenDotted>
                  <VStack align="flex-end">
                    <Text color="text_caption" fontSize="12px">
                      {formatNumber(vaultsPosition?.displayAmountA)}
                    </Text>
                    <Text fontSize="12px">{!amountValueA || amountValueA == '--' ? '$--' : formatCurrency(amountValueA, 2)}</Text>
                  </VStack>
                </HiddenDotted>
              </HStack>
              <Box w="100%" height="1px" bg="border" />
              <HStack w="100%" gap="12px" justify="space-between">
                <HStack>
                  <SingleCoinImage imageUrl={record?.displayTokenB?.logo_url} imgBoxStyle={{ w: '20px', h: '20px' }} />
                  <Text color="text_caption" fontSize="12px">
                    {record?.displayTokenB?.symbol}
                  </Text>
                </HStack>
                <HiddenDotted>
                  <VStack align="flex-end">
                    <Text color="text_caption" fontSize="12px">
                      {formatNumber(vaultsPosition?.displayAmountB)}
                    </Text>
                    <Text fontSize="12px">{!amountValueB || amountValueB == '--' ? '$--' : formatCurrency(amountValueB, 2)}</Text>
                  </VStack>
                </HiddenDotted>
              </HStack>
            </VStack>
          }
        >
          <Center as="button" ml="4px">
            <HiddenDotted>
              <HStack justifyContent="flex-end" gap="0">
                <Text
                  color="text_caption"
                  mr="2px"
                  textDecoration="underline dotted"
                  textDecorationColor="text_paragraph"
                  textUnderlineOffset="3px"
                  whiteSpace="nowrap"
                >
                  {`${vaultsPosition?.balanceDisplay || '0'} LP`}
                </Text>
                <Text>(</Text>
                <VaultsHoldings color="text_paragraph" vaultId={record.vaultId} category={record.category} />
                <Text>)</Text>
              </HStack>
            </HiddenDotted>
          </Center>
        </CetusTooltip>
      )
    }
  },
  {
    title: (
      <TableSortTh
        labelInfo={sortByObject['shareOfPool']}
        defaultShowSortIcon={true}
        sortBy={sortBy}
        sortRule={sortRule}
        clickSort={(value: any) => clickSort(value)}
      />
    ),
    key: 'shareOfPool',
    render: (record: any) => {
      const vaultsPosition = vaultsPositionObj[record?.vaultId] || {}
      return (
        <HStack justify="flex-end">
          <HiddenDotted>
            <Text color="text_caption" whiteSpace="nowrap">
              {' '}
              {vaultsPosition?.shartOfPoolDisplay}
            </Text>
          </HiddenDotted>
        </HStack>
      )
    }
  },
  {
    title: <Text textAlign="right">Actions</Text>,
    key: 'actions',
    showLabel: false,
    render: (record: any) => {
      return <VaultsTableAction poolInfo={record} />
    }
  }
]

export default ProfileVaults
