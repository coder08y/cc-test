import CoinPairInfo from '@/components/common/CoinPairInfo'
import PoolTag from '@/components/common/PoolTag'
import VaultVersionTag from '@/components/common/VaultVersionTag'
import useVaultList from '@/hooks/vault-v2/useVaultList'
import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinPairImage, Icon, Table } from '@cetus/ui-kit'
import { Box, Button, HStack, Menu, MenuButton, MenuItem, MenuList, Text, VStack, useDisclosure } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VaultsAprBlock from '../list/common/VaultsAprBlock'
import VaultsTabList from '../list/common/VaultsTab'

type VaultsPoolTabProps = {
  apiVaultInfo: any
  isVaultsFarming: boolean
  vaultsList?: any
  setVaultCurrTab: (value: string) => void
}

export default function VaultsPoolSelect(props: VaultsPoolTabProps) {
  const { apiVaultInfo, vaultsList, setVaultCurrTab } = props
  const menuDisclosure = useDisclosure()
  const [currentTab, setCurrentTab] = useState({ label: 'All', value: 'all' })
  const navigate = useNavigate()
  const { vaultPageList, filterVaultList, setVaultPageList } = useVaultList()
  // const { isVaultsFarming } = useCurrentVaultsFarm(apiVaultInfo?.vaultId)
  const { vaultsFarmObj } = useVaultsFarmingStore()
  const { isApp } = useWindowWidth()
  const { setAssetAction, setIsCheckedZAP, setCurrTab, setFromToken, setToToken } = useVaultsActionStore()
  const { setVaultsFarmingStakeLoading, setVaultsFarmingRewardsLoading } = useVaultsFarmingStore()

  const [isHover, setIsHover] = useState(false)

  useEffect(() => {
    if (vaultsList?.length > 0) {
      filterVaultList({
        sortOptions: { sortRule: 'desc', sortType: 'tvl' },
        currentTab: 'all',
        isYourHoldings: false,
        selectCoinList: []
      })
    }
  }, [vaultsList?.length, setVaultPageList])

  const handleVaultsTab = (data: any) => {
    setCurrentTab(data)
    filterVaultList({
      sortOptions: { sortRule: 'desc', sortType: 'tvl' },
      currentTab: data.value,
      isYourHoldings: false,
      selectCoinList: []
    })
  }

  const columnsList = useMemo(() => {
    return [
      {
        title: (
          <Text color="primary_gray" fontSize="13px" pl="20px">
            Vault
          </Text>
        ),
        key: '#',
        thConfig: { w: '55%' }
      },
      !isApp && {
        title: (
          <Text color="primary_gray" fontSize="13px" textAlign="left">
            TVL
          </Text>
        ),
        key: 'tvl',
        thConfig: { minW: '22.5%' }
      },
      {
        title: (
          <Text color="primary_gray" fontSize="13px" textAlign="right" pr="20px">
            APY
          </Text>
        ),
        key: 'apr',
        thConfig: { minW: '22.5%' }
      }
    ]
  }, [isApp])

  const getColumns = () => [
    {
      title: '',
      key: '#',
      thConfig: { w: '55%' },
      render: (item: any) => (
        <HStack w="100%" justify={{ base: 'flex-start', lg: 'flex-start' }} pl={{ base: '12px', lg: '16px' }}>
          <CoinPairInfo
            versionBlockPosition="right"
            type="column"
            poolInfo={{
              ...item,
              poolAddress: item?.vaultId,
              poolType: item?.category === 'haevault_v2' ? '' : item?.dlmmPoolAddress?.length > 0 ? 'dlmm' : 'clmm'
            }}
            showPoolTypeTag={item?.category === 'haevault_v2' ? false : true}
            showFee={item?.category === 'haevault_v2' ? false : true}
            // isShowPowered={item?.category === 'haedal'}
            symbolFontSize="15px"
            coinPairInfoWrapStyle={{ gap: '4px', p: '4px 0' }}
            isShowVaultsFarmIcon={vaultsFarmObj[item.vaultId]?.isActiveVaultsFarming}
            zIndex="-1"
            needPortal={false}
            placement={vaultPageList?.length == 1 ? 'bottom-start' : 'top-start'}
            status={item?.status == 'sunsetSoon' ? '' : item?.status}
          />
        </HStack>
      )
    },
    !isApp && {
      title: '',
      key: 'tvl',
      thConfig: { w: '22.5%' },
      render: (item: any) => (
        <HStack w="100%" justify={{ base: 'flex-end', lg: 'flex-start' }}>
          <Text color="text_caption">{item.vaultsTvlDisplay}</Text>
        </HStack>
      )
    },
    {
      title: '',
      key: 'apy',
      thConfig: { w: '22.5%' },
      render: (item: any) => (
        <HStack pr={{ base: '12px', lg: '16px' }} justifyContent="flex-end">
          <VaultsAprBlock
            vaultId={item.vaultId}
            wrapStyle={{
              alignItems: 'flex-end'
            }}
            farmingTextStyle={{ p: '4px' }}
          />
        </HStack>
      )
    }
  ]

  return (
    <HStack
      w={{ base: '100%', lg: 'unset' }}
      position="relative"
      zIndex="99999"
      cursor="pointer"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <Menu isOpen={menuDisclosure.isOpen} onClose={menuDisclosure.onClose}>
        <MenuButton
          as={Button}
          bg={{ base: 'bg_secondary', lg: 'none' }}
          _hover={{ bg: { base: 'bg_secondary', lg: 'none' } }}
          _active={{ bg: { base: 'bg_secondary', lg: 'none' } }}
          p={{ base: '12px 16px', lg: '0' }}
          onClick={menuDisclosure.onOpen}
          w={{ base: '100%', lg: 'auto' }}
          mt="20px"
          h={{ base: '80px', lg: 'auto' }}
        >
          <HStack w={{ base: '100%', lg: 'unset' }} justifyContent="space-between">
            <HStack gap={{ base: '4px', lg: '8px' }}>
              <CoinPairImage
                coinACoinType={apiVaultInfo?.displayTokenA?.coin_type}
                coinBCoinType={apiVaultInfo?.displayTokenB?.coin_type}
                coinAIconUrl={apiVaultInfo?.displayTokenA?.logo_url}
                coinBIconUrl={apiVaultInfo?.displayTokenB?.logo_url}
                status={apiVaultInfo?.status}
              />
              <VStack
                alignItems="start"
                flexDirection={apiVaultInfo?.category === 'haedal' || apiVaultInfo?.category === 'haevault_v2' ? 'column' : 'row'}
                gap="2px"
              >
                <HStack alignItems={{ base: 'start', lg: 'start' }} flexDirection={{ base: 'column', lg: 'row' }} gap={{ base: '4px', lg: '8px' }}>
                  <HStack
                    alignItems={{ base: 'center', lg: 'start' }}
                    flexDirection={{ base: 'row ', lg: 'column' }}
                    gap={{ base: '4px', lg: '4px' }}
                  >
                    <Text fontSize="18px" color="text_caption" fontWeight="500">
                      {`${apiVaultInfo?.displayTokenA?.symbol || ''} - ${apiVaultInfo?.displayTokenB?.symbol || ''}`}
                    </Text>
                    {(apiVaultInfo?.status === 'sunset' || apiVaultInfo?.status === 'sunsetSoon') && (
                      <Text fontSize="12px" color="text_caption" bg="process_bg_gray" p="2px 4px" borderRadius="4px" lineHeight="1">
                        {apiVaultInfo?.status === 'sunset' ? 'Deprecated' : 'Deprecated Soon'}
                      </Text>
                    )}
                  </HStack>

                  {/* {!isApp && apiVaultInfo?.category && (
                    <PoolTag
                      poolType={apiVaultInfo?.category === 'haevault_v2' ? 'dlmm' : 'clmm'}
                      binStep={apiVaultInfo?.binStep}
                      displayFee={apiVaultInfo?.feeDisplay}
                    />
                  )} */}
                  {apiVaultInfo?.category !== 'haevault_v2' && apiVaultInfo?.poolCount === 1 && (
                    <PoolTag
                      wrapStyle={{ mt: '2px' }}
                      poolType={apiVaultInfo?.dlmmPoolAddress?.length > 0 ? 'dlmm' : 'clmm'}
                      binStep={apiVaultInfo?.binStep}
                      displayFee={apiVaultInfo?.feeDisplay}
                    />
                  )}
                </HStack>
              </VStack>
            </HStack>

            <HStack
              bg={{ base: 'bg_secondary', lg: 'bg_secondary' }}
              borderRadius="8px"
              border={{ base: 'none', lg: '1px solid #2B3239' }}
              p="8px"
              ml="6px"
            >
              <Icon
                fontSize="12px"
                xlinkHref="#icon-icon_arrow"
                transition="transform 0.5s"
                transform={menuDisclosure.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                svgFill={isHover ? 'text_caption' : 'text_paragraph'}
              />
            </HStack>
          </HStack>
        </MenuButton>
        <MenuList w={{ base: 'calc(100vw - 24px)', lg: 'unset' }} p="0" mt="0">
          <MenuItem closeOnSelect={false} p="0" w="100%">
            <VStack w={{ base: '100%', lg: '540px' }} p="16px 0px 0px" gap={{ base: '12px', lg: '16px' }}>
              <HStack w="100%" p={{ base: '0 12px', lg: '0 16px' }}>
                <VaultsTabList
                  currentTab={currentTab}
                  onClickVaultsTab={handleVaultsTab}
                  vaultsTabWrapStyle={{
                    flexWrap: { base: 'wrap' },
                    gap: { base: '8px', lg: '8px' }
                  }}
                  vaultsTabItemStyle={{
                    width: { base: 'auto', lg: '' },
                    p: { base: '6px 10px', lg: '10px 12px' },
                    border: '1px solid',
                    borderColor: 'border'
                  }}
                />
              </HStack>
              <Box h="32px" bg="bg_secondary" p="0 4px 4px" w="100%" zIndex="9999">
                <Table
                  rowKey="vaults1"
                  columns={columnsList}
                  dataSource={null}
                  skeletonLength={3}
                  loading={false}
                  isFlexStart={false}
                  trPadding="0px"
                />
              </Box>
              <Box w="100%" maxH="475px" overflowY="auto" p="0 4px 4px" mt="-30px">
                <Table
                  rowKey="vaults"
                  columns={getColumns()}
                  dataSource={vaultPageList?.filter((item: any) => item.status !== 'sunset')}
                  skeletonLength={3}
                  loading={false}
                  isFlexStart={true}
                  trPadding="0px"
                  tableContainerWrapStyle={{
                    minH: '200px'
                  }}
                  onRowClick={(item: any) => {
                    menuDisclosure.onClose()
                    setCurrTab('Deposit')
                    setAssetAction('both')
                    setIsCheckedZAP(false)
                    setVaultCurrTab('Overview')
                    setFromToken(item.displayTokenA)
                    setToToken(item.displayTokenB)
                    // setVaultsFarmingStakeLoading(true)
                    // setVaultsFarmingRewardsLoading(true)
                    navigate(`/vaults/${item.vaultId}`)
                  }}
                  rowStyle={{
                    h: '70px',
                    cursor: 'pointer',
                    _hover: { bg: 'primary_opacity.10)' }
                  }}
                />
              </Box>
            </VStack>
          </MenuItem>
        </MenuList>
      </Menu>
    </HStack>
  )
}
