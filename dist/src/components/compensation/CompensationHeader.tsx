import useCompensationPositionPage from '@/hooks/compensation/useCompensationPositionPage'
import useCompensationVaultPage from '@/hooks/compensation/useCompensationVaultPage'
import useCompensationStore from '@/store/compensation'
import { SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import { useAccountStore } from '@cetus/stores'
import { RefreshButton } from '@cetus/ui-kit'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
// import HighlightText from '@cetus/design/src/components/common/HighlightText'

export default function CompensationHaedar({
  currentTab,
  setCurrentTab,
  setRefreshCount
}: {
  currentTab: string
  setCurrentTab: (tab: string) => void
  setRefreshCount: (value: number) => void
}) {
  const { handleGetPositionList } = useCompensationPositionPage()
  const { handleGetVaultList } = useCompensationVaultPage()
  const { currentAccount } = useAccountStore()
  const { posBaseList, vaultPositionList, posBaseListLoading, vaultPositionLoading } = useCompensationStore()

  const tabList: Tab[] = useMemo(() => {
    const posNum = currentAccount?.address && posBaseList?.length > 0 ? posBaseList.length : ''
    const vaultNum = currentAccount?.address && vaultPositionList?.length > 0 ? vaultPositionList?.length : ''

    return [
      {
        label: 'Liquidity Positions',
        value: 'positions',
        key: 'positions',
        num: posNum
      },
      {
        label: 'Vault',
        value: 'vault',
        key: 'vault',
        num: vaultNum
      }
    ]
  }, [posBaseList.length, vaultPositionList?.length, currentTab, currentAccount?.address, posBaseListLoading, vaultPositionLoading])

  return (
    <HStack
      w="100%"
      pos="absolute"
      top="0"
      minH={{ base: '204px', lg: '174px' }}
      bg="compensation_header_bg"
      p={{ base: '32px 8px 0', lg: '32px  0 0' }}
      justifyContent="center"
      alignItems="flex-start"
    >
      <VStack width={{ base: '100%', lg: '1160px' }} justifyContent="flex-start" alignItems="flex-start" gap="12px">
        <Text fontSize="20px" color="caption" fontWeight="500">
          Compensation
        </Text>
        {/* <HighlightText
          text_color="primary_gray"
          text_size="14px"
          text={`Claim your CETUS compensation here for exposed positions and vaults.  Learn more >`}
          keywords={['Learn more >']}
          keywordsHoverColor="primary"
          clickOnlyKeyword={true}
          text_highlight_color="primary_gray"
          onKeywordClick={() => {
            window.open('https://cetus-1.gitbook.io/cetus-docs/tokenomics/xcetus', '_blank')
          }}
        /> */}
        {/* <HighlightText
          text_color="primary_gray"
          text_size="14px"
          text={`Claim your CETUS compensation here for exposed positions and vaults.  Learn more >`}
          keywords={['Learn more >']}
          keywordsHoverColor="primary"
          clickOnlyKeyword={true}
          text_highlight_color="primary_gray"
          onKeywordClick={() => {
            window.open('https://cetus-1.gitbook.io/cetus-docs/tokenomics/xcetus', '_blank')
          }}
        /> */}
        <Text color="primary_gray" fontSize="14px">
          Claim your CETUS compensation here for exposed positions and vaults.
        </Text>
        <HStack w="100%" justifyContent="space-between" alignItems="center" mt="20px">
          <SelectTab
            type="borderTab"
            wrapStyle={{
              w: {
                base: '100%',
                lg: '395px'
              },
              h: '48px',
              bg: 'none',
              border: 'none'
            }}
            itemStyle={{
              marginRight: {
                base: '24px',
                lg: '40px'
              },
              fontSize: '16px',
              position: 'relative'
            }}
            tabList={tabList}
            currentTab={currentTab}
            handleChangeTab={item => {
              setCurrentTab(item.value as string)
            }}
          />
          <RefreshButton
            maxW="32px"
            minW="32px"
            h="32px"
            iconStyle={{
              w: '16px',
              h: '16px'
            }}
            handleRefresh={() => {
              setRefreshCount(20000)
              if (currentTab == 'positions') {
                handleGetPositionList(currentAccount?.address)
              } else {
                handleGetVaultList(currentAccount?.address)
              }
            }}
            borderRadius={{ base: '8px', lg: '8px' }}
          />
        </HStack>
      </VStack>
    </HStack>
  )
}
