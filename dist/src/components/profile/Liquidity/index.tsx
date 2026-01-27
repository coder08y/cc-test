import PositionTypeAndCollapse from '@/components/position/common/PositionTypeAndCollapse'
import usePositionList from '@/hooks/position/usePositionList'
import usePoolsStore from '@/store/pool'
import usePositionStore from '@/store/position'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { d } from '@cetus/utils'
import { HStack, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import ProfileMenus from '../ProfileMenus'
import ProfilePosition from './ProfilePosition'
import ProfileVaults from './ProfileVaults'

function ProfileLiquidity() {
  const { currentAccount } = useAccountStore()
  const { vaultsPositionLoading } = useVaultsPositionStore()
  const { showPosListLength, posBaseListLoading, setShowPosListLength } = usePositionStore()
  const { showVaultsListLength } = useVaultsPositionStore()
  const { isExpendPositionMap, clearIsExpendPositionMap } = usePoolsStore()
  const [selectCoinList, setSelectCoinList] = useState<Token[]>([])
  const { getPositionBaseList } = usePositionList()

  const handleGetPositionList = async (walletAddress: string) => {
    await getPositionBaseList(walletAddress)
  }
  const onClickSelectCoinList = (tokenInfo: Token) => {
    setSelectCoinList(prev => [...prev, tokenInfo])
  }
  const onDeleteSelectCoinList = (tokenInfo: Token) => {
    setSelectCoinList(prev => prev.filter(ele => ele?.coin_type !== tokenInfo?.coin_type))
  }

  useEffect(() => {
    if (currentAccount?.address) {
      handleGetPositionList(currentAccount?.address)
    } else {
      setShowPosListLength({})
    }
  }, [currentAccount?.address])

  useEffect(() => {
    // 组件卸载时 列表条数重置
    return () => {
      setShowPosListLength({})
    }
  }, [])

  const [currentTab, setCurrentTab] = useState('positions')

  const totalPositionLength = useMemo(() => {
    if (!posBaseListLoading) {
      return (
        d(showPosListLength?.clmm_position_count ?? 0)
          .plus(showPosListLength?.dlmm_position_count ?? 0)
          .toString() || ''
      )
    }
    return ''
  }, [posBaseListLoading, showPosListLength, selectCoinList])

  const vaultsPositionLength = useMemo(() => {
    if (!vaultsPositionLoading) {
      return Number(showVaultsListLength) > 0 ? showVaultsListLength : ''
    }
    return ''
  }, [vaultsPositionLoading, showVaultsListLength, selectCoinList])

  const tabList = useMemo(() => {
    return [
      {
        label: 'Positions',
        value: 'positions',
        num: totalPositionLength
      },
      {
        label: 'Vaults',
        value: 'vaults',
        num: vaultsPositionLength
      }
    ]
  }, [selectCoinList, totalPositionLength, vaultsPositionLength])

  const [showPosListGroupByPool, setShowPosListGroupByPool] = useState<any>([])
  const changeShowPosListGroupByPool = (val: any) => {
    setShowPosListGroupByPool(val)
  }

  const { isApp } = useWindowWidth()

  const [vaultCurrentTab, setVaultCurrentTab] = useState({
    label: 'All',
    value: 'all'
  })

  const { vaultsTokenList } = useVaultsListV2Store()

  useEffect(() => {
    return () => {
      clearIsExpendPositionMap()
    }
  }, [])

  return (
    <Block
      borderRadius="16px"
      p={{ base: '0', lg: '0px 0px 16px' }}
      bg={{ base: 'none', lg: 'none' }}
      backdropFilter={{ base: 'none', lg: 'blur(20px)' }}
      border="none"
      mt={{ base: '-12px', lg: '-6px' }}
    >
      <VStack gap={{ base: '8px', lg: '16px' }} w="100%">
        <HStack w="100%" gap="12px" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }}>
          <ProfileMenus
            type="tab"
            currentTab={currentTab}
            tabs={tabList}
            menuHeight={isApp ? '48px' : '60px'}
            // haveActiveLine={false}
            onTabChange={tab => {
              setSelectCoinList([])
              setCurrentTab(tab.value)
            }}
            textStyle={{
              fontSize: '16px'
            }}
            wrapStyle={{
              bg: 'none'
            }}
          />
          <HStack w={{ base: '100%', lg: 'unset' }}>
            <PositionTypeAndCollapse
              isProfile={true}
              isVaults={currentTab == 'vaults'}
              currentTab={vaultCurrentTab}
              setCurrentTab={setVaultCurrentTab}
              whiteTokenList={currentTab == 'vaults' ? vaultsTokenList : undefined}
              isShowChildren={currentTab !== 'vaults' && d(totalPositionLength).gt(0)}
              handleRefresh={() => {}}
              selectCoinList={selectCoinList}
              onClickSelectCoinList={onClickSelectCoinList}
              onDeleteSelectCoinList={onDeleteSelectCoinList}
              showPosListGroupByPool={showPosListGroupByPool}
              changeShowPosListGroupByPool={changeShowPosListGroupByPool}
            />
          </HStack>
        </HStack>
        {/* {!isApp && <Box h="1px" w="100%" bg="border" mt="-16px" />} */}
        {currentTab === 'positions' && <ProfilePosition showPosListGroupByPool={showPosListGroupByPool} />}
        {currentTab === 'vaults' && <ProfileVaults selectCoinList={selectCoinList} currentTab={vaultCurrentTab} setCurrentTab={setVaultCurrentTab} />}
      </VStack>
    </Block>
  )
}

export default ProfileLiquidity
