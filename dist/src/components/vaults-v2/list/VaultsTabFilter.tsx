import SearchInputBlock from '@/components/pools/SearchInputBlock'
import { Block } from '@cetus/design'
import { SortDropType } from '@cetus/design/src/components/common/SortDropBlock'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { Token } from '@cetus/types'
import { CheckBox, RefreshButton } from '@cetus/ui-kit'
import { Box, HStack, Switch, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import VaultsPcTab from './common/VaultsPcTab'
export type sortRule = 'desc' | 'asc'
export type TabFilterProps = {
  sortByList: SortDropType[]
  currSortType: SortDropType
  sortRule: sortRule
  isYourHoldings: boolean
  selectCoinList: Token[]
  whiteTokenList: Token[]
  onSortByChange: (type: SortDropType) => void
  handleChangeSortRule: (sortRule: sortRule) => void
  handleRefresh: () => void
  onClickSelectCoinList: (tokenInfo: Token) => void
  onDeleteSelectCoinList: (tokenInfo: Token) => void
  onClickIsYourHoldings: () => void
  showSkeletonLoading: boolean
  onClickVaultsTab: (vaule: string) => void
  currentTab: any
  vaultsTabList: any[]
  currentStatus: string
  onStatusChange: (status: string) => void
  vaultPoolStatusObj: Record<string, SortDropType>
  vaultPoolStatusList: SortDropType[]
  isIncentivizedOnly: boolean
  handleChangeIsIncentivizedOnly: (value: boolean) => void
}

export function VaultsTabFilter(props: TabFilterProps) {
  const {
    sortByList,
    // tabList,
    // handleChangeTab,
    currSortType,
    onSortByChange,
    sortRule,
    handleRefresh,
    handleChangeSortRule,
    selectCoinList,
    onClickSelectCoinList,
    onDeleteSelectCoinList,
    isYourHoldings,
    onClickIsYourHoldings,
    whiteTokenList,
    showSkeletonLoading,
    onClickVaultsTab,
    currentTab,
    vaultPoolStatusList,
    currentStatus,
    onStatusChange,
    vaultPoolStatusObj,
    isIncentivizedOnly,
    handleChangeIsIncentivizedOnly
  } = props
  const { isApp } = useWindowWidth()
  const { currentAccount } = useAccountStore()
  const [isSmall, setIsSmall] = useState(false)
  // useEffect(() => {
  //   if (selectCoinList.length == 0) {
  //     setIsSmall(true)
  //   }
  // }, [selectCoinList])

  return (
    <VStack w="100%" mt={{ base: '20px', lg: '28px' }} justify="space-between">
      <HStack w="100%" justify="space-between" flexWrap="wrap">
        {/* 切换Tab */}
        <VaultsPcTab currentTab={currentTab} onClickVaultsTab={value => onClickVaultsTab(value)} showSkeletonLoading={showSkeletonLoading} />

        {!isApp && currentAccount?.address && (
          <HStack>
            <Block
              w={{
                base: '65%',
                lg: 'unset'
              }}
              borderRadius="12px"
              p={isApp ? '0 6px 0 8px' : '0px 12px'}
              h="40px"
            >
              <HStack h="100%" justify="space-between" gap={isApp ? '4px' : '8px'}>
                <Text color={isIncentivizedOnly ? 'text_caption' : 'text_paragraph'}>{isApp ? 'Incentivized' : 'Incentivized Only'}</Text>
                <Switch isChecked={isIncentivizedOnly} onChange={() => handleChangeIsIncentivizedOnly(!isIncentivizedOnly)} />
              </HStack>
            </Block>
            <Block
              w={{
                base: '100%',
                lg: 'unset'
              }}
              borderRadius="12px"
              p="0px 12px"
              h="40px"
            >
              <HStack h="100%" justify="space-between">
                <CheckBox checked={isYourHoldings} onClick={onClickIsYourHoldings} />
                <Text color={isYourHoldings ? 'text_caption' : 'text_paragraph'}>Your Holdings</Text>
              </HStack>
            </Block>
          </HStack>
        )}
      </HStack>
      <HStack w="100%" justify="space-between" flexDirection={{ base: 'column', lg: 'row' }}>
        {!isApp && (
          <Box
            w={{
              base: '100%',
              lg: 'unset'
            }}
            sx={{
              '> button': {
                minW: '100% !important'
              }
            }}
          >
            <SearchInputBlock
              selectCoinList={selectCoinList}
              onClickSelectCoinList={onClickSelectCoinList}
              onDeleteSelectCoinList={onDeleteSelectCoinList}
              whiteTokenList={whiteTokenList}
              isVault={false}
            />
          </Box>
        )}

        <HStack>
          {/* {isSmall && (
            <SortDropBlock
              sortText={!isApp ? 'Status' : ''}
              sortTextStyle={{
                color: 'primary_gray'
              }}
              minW={isApp ? 'calc(100vw - 112px)' : '150px'}
              currentSort={vaultPoolStatusObj[currentStatus]}
              sortByList={vaultPoolStatusList}
              onSortByChange={onStatusChange}
              boxStyle={{
                borderRadius: { base: '12px', lg: '12px' }
              }}
              wrapStyle={{
                borderRadius: { base: '8px', lg: '12px' }
              }}
              sortLabelTextStyle={{
                fontSize: { base: '14px', lg: '14px' }
              }}
            />
          )} */}

          {isApp && (
            <Box
              w={{
                base: isSmall ? '40px' : 'calc(100vw - 64px)'
              }}
              sx={{
                '> button': {
                  minW: '100% !important'
                }
              }}
            >
              <SearchInputBlock
                selectCoinList={selectCoinList}
                onClickSelectCoinList={onClickSelectCoinList}
                onDeleteSelectCoinList={onDeleteSelectCoinList}
                whiteTokenList={whiteTokenList}
                isSmall={isSmall}
                isVault={false}
                // setIsSmall={setIsSmall}
                // wrapStyle={{
                //   width: {
                //     base: isSmall ? '40px' : '100%',
                //     lg: '292px'
                //   },
                // }}
              />
            </Box>
          )}

          <RefreshButton
            handleRefresh={() => {
              if (!showSkeletonLoading) {
                handleRefresh()
              }
            }}
            borderRadius={{ base: '12px', lg: '12px' }}
            minW="40px"
            minH="40px"
          />
        </HStack>
      </HStack>
      {isApp && (
        <HStack w="100%" justify="space-between">
          <Text w="100%" fontSize="20px" color="text_caption">
            Vaults
          </Text>

          <Block
            w={{
              base: '65%',
              lg: 'unset'
            }}
            borderRadius="12px"
            p={isApp ? '0 6px 0 8px' : '0px 12px'}
            h="40px"
          >
            <HStack h="100%" justify="space-between" gap={isApp ? '4px' : '8px'}>
              <Text color={isIncentivizedOnly ? 'text_caption' : 'text_paragraph'}>{isApp ? 'Incentivized' : 'Incentivized Only'}</Text>
              <Switch isChecked={isIncentivizedOnly} onChange={() => handleChangeIsIncentivizedOnly(!isIncentivizedOnly)} />
            </HStack>
          </Block>
          {currentAccount?.address && (
            <Block
              w={{
                base: '70%',
                lg: 'unset'
              }}
              borderRadius="12px"
              p="0px 12px"
              h="40px"
            >
              <HStack h="100%" justify="space-between">
                <CheckBox checked={isYourHoldings} onClick={onClickIsYourHoldings} />
                <Text color={isYourHoldings ? 'text_caption' : 'text_paragraph'} whiteSpace="nowrap">
                  Your Holdings
                </Text>
              </HStack>
            </Block>
          )}
        </HStack>
      )}
    </VStack>
  )
}
