import useCompensationStore from '@/store/compensation'
import SelectTab, { Tab } from '@cetus/design/src/components/common/SelectTab'
import { useAccountStore } from '@cetus/stores'
import { haedalVaultVestConfig } from '@cetus/types'
import { NoData } from '@cetus/ui-kit'
import { VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import CompensationListLoading from './CompensationListLoading'
import CompensationPoolItem from './CompensationPoolItem'

export default function CompensationVault() {
  const { vaultPositionLoading, vaultPosGroupByPool, vaultPositionList } = useCompensationStore()
  const { currentAccount, onWalletModal } = useAccountStore()
  const [currentTab, setCurrentTab] = useState('all')

  const showVaultListGroupByPool = useMemo(() => {
    if (currentTab == 'all') {
      return vaultPosGroupByPool
    } else {
      return Object.values(vaultPosGroupByPool).filter(item => item.category == currentTab)
    }
  }, [currentTab, vaultPosGroupByPool])

  const tabList: Tab[] = useMemo(() => {
    const cetusLength = !vaultPositionLoading && currentAccount?.address ? vaultPositionList.filter(item => item.category == 'cetus').length : ''
    const haedalLength = !vaultPositionLoading && currentAccount?.address ? vaultPositionList.filter(item => item.category == 'haedal').length : ''
    return [
      {
        label: 'All Vaults',
        value: 'all',
        key: 'all',
        num: !vaultPositionLoading && currentAccount?.address && vaultPositionList.length > 0 ? vaultPositionList.length : ''
      },
      {
        label: 'Cetus',
        value: 'cetus',
        key: 'cetus',
        num: cetusLength > 0 ? cetusLength : ''
      },
      {
        label: 'Haedal',
        value: 'haedal',
        key: 'haedal',
        num: haedalLength > 0 ? haedalLength : '',
        comingSoon: haedalVaultVestConfig !== 'open'
      }
    ]
  }, [currentTab, vaultPosGroupByPool, vaultPositionLoading, currentAccount?.address])

  return (
    <VStack w="100%" gap={{ base: '20px', lg: '12px' }} alignItems="flex-start" mt={{ base: '4px', lg: '0' }}>
      {haedalVaultVestConfig == 'open' && (
        <SelectTab
          type="outlineTab"
          wrapStyle={{
            w: {
              base: '100%',
              lg: '496px'
            },
            h: '42px',
            borderRadius: { base: '8px', lg: '12px' },
            padding: '4px'
          }}
          itemStyle={{
            w: '50%',
            fontSize: '16px',
            borderRadius: '8px'
          }}
          tabList={tabList}
          currentTab={currentTab}
          handleChangeTab={tab => {
            setCurrentTab(tab.value)
          }}
        />
      )}
      {!currentAccount?.address ? (
        <NoData type="nowallet" onboard={() => onWalletModal(true)} />
      ) : vaultPositionLoading ? (
        [{}, {}, {}].map((item, index) => {
          return <CompensationListLoading key={index} />
        })
      ) : Object.values(showVaultListGroupByPool)?.length > 0 ? (
        Object.values(showVaultListGroupByPool).map((item, index) => {
          return <CompensationPoolItem key={index} isVault={true} poolInfo={item} isShowPowered={item.category == 'haedal'} />
        })
      ) : (
        <NoData type="nodata" text="No compensation data" />
      )}
    </VStack>
  )
}
