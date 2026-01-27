import usePoolsStore from '@/store/pool'
import useDlmmPoolsStore from '@/store/pool/useDlmmPoolStore'
import { Block } from '@cetus/design'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { CheckBox, Icon, RefreshButton } from '@cetus/ui-kit'
import { d } from '@cetusprotocol/common-sdk'
import { Box, Center, HStack, Switch, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VaultsH5Tab from '../vaults-v2/list/common/VaultsH5Tab'
import PoolsTabSelector from './PoolsTabSelector'
import SearchInputBlock from './SearchInputBlock'
interface FilterProps {
  handleIsDisplayChecked?: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleIsWatchList?: () => void
  onClickIncentiveTypes?: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleRefresh: () => void
  selectCoinList: Token[]
  onClickSelectCoinList: (tokenInfo: Token) => void
  onDeleteSelectCoinList: (tokenInfo: Token) => void
  onSetSelectCoinList?: (tokens: Token[]) => void
  isPools?: boolean
  isDlmmPools?: boolean
  isRefreshed?: boolean
  positionCountObj?: {
    clmm_position_count?: number
    dlmm_position_count?: number
  }
  handleChangePositionTab?: (tab: PositionTypes) => void
  isProfile?: boolean
  isVaults?: boolean
  currentTab?: any
  setCurrentTab?: (data: any) => void
  whiteTokenList?: any
  children?: React.ReactNode
  sortDropBlock?: React.ReactNode
  fromSource?: 'pools' | 'position'
}

function PoolsFilter({
  handleIsWatchList = () => {},
  handleIsDisplayChecked = () => {},
  onClickIncentiveTypes,
  handleRefresh,
  selectCoinList,
  onClickSelectCoinList,
  onDeleteSelectCoinList,
  onSetSelectCoinList,
  isPools = true,
  isDlmmPools = false,
  isProfile = false,
  isRefreshed,
  isVaults = false,
  currentTab,
  setCurrentTab,
  whiteTokenList,
  positionCountObj,
  handleChangePositionTab,
  children,
  sortDropBlock,
  fromSource
}: FilterProps) {
  const { isWatchList, isAllPools, isIncentivizedOnly, resetPoolFilterParams, showFilterButton, setShowFilterButton } = usePoolsStore()
  const { isDlmmWatchList, isDlmmAllPools, isDlmmIncentivizedOnly } = useDlmmPoolsStore()
  const { isApp, windowWidth } = useWindowWidth()

  // 初始化 showFilterButton，移动端默认为 false，PC端默认为 true
  useEffect(() => {
    setShowFilterButton(!isApp)
  }, [isApp, setShowFilterButton])

  const [positionTab, setPositionTab] = useState<PositionTypes>('All')
  const { tab } = useQueryParams()
  const tabList: PositionTabType[] = useMemo(() => {
    return [
      {
        title: 'All',
        num: d(positionCountObj?.clmm_position_count ?? 0)
          .plus(positionCountObj?.dlmm_position_count ?? 0)
          .toNumber()
      },
      {
        title: 'CLMM',
        num: positionCountObj?.clmm_position_count ?? 0
      },
      {
        title: 'DLMM',
        num: positionCountObj?.dlmm_position_count ?? 0
      }
    ]
  }, [positionCountObj?.clmm_position_count, positionCountObj?.dlmm_position_count])

  const navigate = useNavigate()

  const [isSmall, setIsSmall] = useState(true)
  useEffect(() => {
    if (selectCoinList.length == 0) {
      setIsSmall(true)
    }
  }, [selectCoinList])

  const isPoolList = useMemo(() => {
    return isPools || isDlmmPools
  }, [isPools, isDlmmPools])

  const isCurrentWatchList = useMemo(() => {
    if (isDlmmPools) {
      return isDlmmWatchList
    }
    if (isPools) {
      return isWatchList
    }
    return false
  }, [isWatchList, isDlmmWatchList, isPools, isDlmmPools])

  const isCurrentIsIncentivizedOnly = useMemo(() => {
    if (isDlmmPools) {
      return isDlmmIncentivizedOnly
    }
    if (isPools) {
      return isIncentivizedOnly
    }
    return false
  }, [isIncentivizedOnly, isDlmmIncentivizedOnly, isPools, isDlmmPools])

  const isCurrentAllPools = useMemo(() => {
    if (tab === 'dlmm_pools') {
      return isDlmmAllPools
    }
    if (isPools) {
      return isAllPools
    }
    return false
  }, [isAllPools, isDlmmAllPools, isPools, isDlmmAllPools, tab])

  const renderFilterItems = () => {
    return (
      isPoolList && (
        <HStack
          w={{
            base: '100%',
            lg: 'unset'
          }}
          justify="space-between"
          gap="8px"
          sx={{
            ...(!isApp && {
              width: '100% !important',
              display: 'flex',
              justifyContent: 'flex-end'
            })
          }}
        >
          <Block
            w={{
              base: 'auto',
              lg: 'unset'
            }}
            borderRadius="12px"
            p={{ base: '0px', lg: '0 12px' }}
            h={isApp ? 'auto' : '40px'}
            sx={{
              ...(isApp && {
                bg: 'transparent',
                border: '0'
              })
            }}
            onClick={handleIsWatchList}
          >
            {windowWidth <= 350 ? (
              <HStack h="38px" justify="center" align="center">
                <Icon xlinkHref="#icon-icon_star" svgFill={isCurrentWatchList ? 'primary' : 'text_paragraph'} />
              </HStack>
            ) : (
              <HStack h="100%" justify="space-between" gap={{ base: '6px', lg: '8px' }}>
                <CheckBox
                  checked={isCurrentWatchList ?? false}
                  onClick={() => {}}
                  wrapStyle={{
                    width: '16px',
                    height: '16px',
                    sx: {
                      '& svg': {
                        width: '12px',
                        height: '12px',
                        fill: isCurrentWatchList ? '#000 !important' : 'transparent !important'
                      }
                    }
                  }}
                />
                <Text fontSize={isApp ? '12px' : '14px'} color={isCurrentWatchList ? 'text_caption' : 'text_paragraph'}>
                  Watchlist
                </Text>
              </HStack>
            )}
          </Block>
          <HStack w={{ base: 'auto', lg: 'unset' }} gap={isApp ? '0' : '8px'}>
            <Block
              w={{
                base: '65%',
                lg: 'unset'
              }}
              borderRadius="12px"
              p={isApp ? '0 6px 0 8px' : '0px 12px'}
              h={isApp ? 'auto' : '40px'}
              sx={{
                ...(isApp && {
                  bg: 'transparent',
                  border: '0'
                })
              }}
            >
              <HStack h="100%" justify="space-between">
                <Text fontSize={isApp ? '12px' : '14px'} color={isCurrentIsIncentivizedOnly ? 'text_caption' : 'text_paragraph'}>
                  {isApp ? 'Incentivized' : 'Incentivized Only'}
                </Text>
                <Switch isChecked={isCurrentIsIncentivizedOnly} onChange={onClickIncentiveTypes} />
              </HStack>
            </Block>
            <Block
              w={{
                base: 'auto',
                lg: 'unset'
              }}
              borderRadius="12px"
              p={isApp ? '0 6px 0 8px' : '0px 12px'}
              h={isApp ? 'auto' : '40px'}
              sx={{
                ...(isApp && {
                  bg: 'transparent',
                  border: '0'
                })
              }}
            >
              <HStack h="100%" justify="space-between">
                <Text fontSize={isApp ? '12px' : '14px'} color={isCurrentAllPools ? 'text_caption' : 'text_paragraph'} whiteSpace="nowrap">
                  {' '}
                  All Pools
                </Text>
                <Switch isChecked={isCurrentAllPools} onChange={handleIsDisplayChecked} />
              </HStack>
            </Block>
          </HStack>

          {!isProfile && !isApp && <RefreshButton handleRefresh={handleRefresh} isRefreshed={isRefreshed} />}
        </HStack>
      )
    )
  }

  const renderSearchInputContent = () => {
    return (
      <Box
        w={{
          base: isVaults && isSmall ? '40px' : isPoolList || isProfile || fromSource === 'position' ? '100%' : 'calc(100% - 48px)',
          lg: 'auto'
        }}
        sx={{
          '> button': {
            minW: '100% !important'
          },
          flex: '1',
          ...(isApp && {
            display: 'flex',
            gap: '8px'
          })
        }}
      >
        <SearchInputBlock
          isProfile={isProfile}
          selectCoinList={selectCoinList}
          onClickSelectCoinList={onClickSelectCoinList}
          onDeleteSelectCoinList={onDeleteSelectCoinList}
          onSetSelectCoinList={onSetSelectCoinList}
          isSmall={isVaults && isSmall}
          isVault={false}
          setIsSmall={setIsSmall}
          whiteTokenList={whiteTokenList}
          triggerStyle={{
            ...(isApp &&
              !isProfile && {
                h: '32px',
                borderRadius: '8px',
                sx: {
                  '& svg': {
                    w: '14px',
                    h: '14px'
                  },
                  '& p': {
                    fontSize: '12px'
                  }
                }
              })
          }}
        />
        {isApp && sortDropBlock && sortDropBlock}
      </Box>
    )
  }

  return (
    <HStack
      w={'100%'}
      justify="space-between"
      flexDirection={{
        base: 'column',
        lg: 'row'
      }}
      sx={{
        ...(isApp &&
          !isProfile && {
            px: '12px',
            position: 'sticky',
            top: '48px',
            zIndex: 1000,
            bg: 'bg_primary',
            pb: '12px'
            // borderBottom: '1px solid',
            // borderColor: 'border'
          })
      }}
      gap={isApp ? '12px' : '8px'}
    >
      {isApp && !isProfile && <PoolsTabSelector />}
      {isApp && isPoolList && (
        <Box borderBottom="1px solid" borderColor="border" pb="12px" w="100%">
          {renderFilterItems()}
        </Box>
      )}

      <VStack w="100%" align="flex-start">
        <HStack
          w="100%"
          justify="space-between"
          sx={{
            '>button': {
              '>div': {
                borderRadius: isProfile ? '8px' : '12px'
              }
            }
          }}
        >
          {isApp && isVaults && isSmall && (
            <VaultsH5Tab currentTab={currentTab} onClickVaultsTab={data => setCurrentTab?.(data)} showSkeletonLoading={false} />
          )}

          {(fromSource !== 'position' || isProfile) && renderSearchInputContent()}
          {fromSource === 'position' && !isProfile && !isApp && <HStack w={{ base: '100%', lg: 'auto' }}>{renderSearchInputContent()}</HStack>}
          {((!isProfile && (isApp || !isPoolList)) || (!isApp && children)) && (
            <HStack
              w={{ base: '24px', lg: 'unset' }}
              sx={{
                ...(isApp && {
                  position: 'absolute',
                  mt: fromSource === 'position' ? '-74px' : '-192px',
                  right: '12px',
                  gap: '4px',
                  width: fromSource === 'position' ? 'auto' : '24px'
                })
              }}
            >
              {/* {isApp && fromSource !== 'position' && (
                <Icon
                  svgFill={showFilterButton ? 'text_caption' : 'text_paragraph'}
                  svgHover='text_caption'
                  fontSize='16px'
                  onClick={() => setShowFilterButton(!showFilterButton)}
                  xlinkHref='#icon-icon_filter'
                />
              )} */}
              {!isApp && children}
              {!isProfile && (isApp || !isPoolList) && (
                <Box
                  w={isApp ? 'auto' : '40px'}
                  sx={{
                    ...(isApp && {
                      '& > div': {
                        border: '0',
                        w: 'auto',
                        h: 'auto',
                        background: 'transparent',
                        '& > div': {
                          background: 'transparent'
                        }
                      },
                      '& svg': {
                        w: '18px',
                        h: '18px'
                      }
                    })
                  }}
                >
                  <RefreshButton
                    handleRefresh={handleRefresh}
                    isRefreshed={isPoolList ? isRefreshed : undefined}
                    iconStyle={{
                      ...(isApp && {
                        w: '18px',
                        h: '18px'
                      })
                    }}
                  />
                </Box>
              )}
            </HStack>
          )}
          {!isApp && renderFilterItems()}
        </HStack>

        {isApp && children && <HStack w="100%">{children}</HStack>}
        {fromSource === 'position' && !isProfile && isApp && renderSearchInputContent()}
      </VStack>

      {/* <TokenSelectModal
        lastSelectedToken={selectCoinList?.length > 0 ? selectCoinList[0].coin_type : ''}
        isDisableSelectTokenItem={true}
        haveImport={false}
        isOpen={isOpenModal}
        onSelectToken={(tokenInfo: Token) => {
          onClickSelectCoinList(tokenInfo)
        }}
        onClose={() => {
          setIsOpenModal(false)
        }}
      /> */}
    </HStack>
  )
}

export type PositionTypes = 'All' | 'CLMM' | 'DLMM'
type PositionTabType = { title: PositionTypes; num: number }
type PositionTabsProps = {
  currentTab: PositionTypes
  onChangeTab: (tab: PositionTypes) => void
  tabList: PositionTabType[]
}

const PositionTabs = ({ currentTab, onChangeTab, tabList }: PositionTabsProps) => {
  return (
    <HStack border="1px solid" borderColor="border" p="3px" bg="bg_secondary" borderRadius="12px">
      {tabList?.map(tab => (
        <PositionTab key={tab.title} isActive={tab.title === currentTab} title={tab.title} num={tab.num} onClick={onChangeTab} />
      ))}
    </HStack>
  )
}

type PositionTabProps = {
  isActive: boolean
  title: PositionTypes
  num: number
  onClick: (tab: PositionTypes) => void
}
const PositionTab = ({ isActive, title, num, onClick }: PositionTabProps) => {
  return (
    <HStack p="8px 24px" borderRadius="8px" bg={isActive ? 'card_bg' : 'transparent'} h="32px" onClick={() => onClick(title)} cursor="pointer">
      <Text color={isActive ? 'primary' : 'primary_gray'}>{title}</Text>
      <Center
        border="1px solid"
        borderColor={isActive ? 'transparent' : 'border'}
        borderRadius="8px"
        bg="block_color"
        fontSize="12px"
        color="text_highlight"
        p="2px 8px"
      >
        {num}
      </Center>
    </HStack>
  )
}

export default PoolsFilter
