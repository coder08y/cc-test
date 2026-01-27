import FarmingIcon from '@/components/common/FarmingIcon'
import MiningIcon from '@/components/common/MiningIcon'
import { DlmmPoolData } from '@/types/dlmm'
import { TableSortTh } from '@cetus/design'
import { Box, HStack, Text } from '@chakra-ui/react'
import AprTooltip from '../../common/aprTooltip'
import DLMMActions from './../DLMMActions'
import DLMMCoinPairInfo from './../DLMMCoinPairInfo'
import RewardsBlock from './../RewardsBlock'

export type poolListType = {
  label: 'Liquidity' | 'Volume (24H)' | 'Volume (7D)' | 'Fees (24H)' | 'APR (24H)'
  value: 'tvl' | 'vol' | 'vol7d' | 'fees' | 'totalApr'
}

const getColumns = (sortRule: string, sortBy: poolListType, clickSort: (value: poolListType) => void, sortByObject: any, isApp: boolean) => {
  return [
    {
      title: <Text fontSize="14px">Pools</Text>,
      key: 'pool',
      thConfig: {
        w: '30%'
      },
      showLabel: false,
      render: ({ hasFee, isParent, isOpen, list, onExpand, ...rest }: { hasFee: boolean; isParent?: boolean; [key: string]: any }) => {
        const isOnlyOneData = (isParent && hasFee) || (!rest?.coinTypeA && rest?.showTokenName)
        return (
          <HStack w="100%" justify="space-between">
            <HStack
              alignItems={isApp ? 'flex-end' : 'center'}
              pl="0"
              align={isOnlyOneData ? 'flex-start' : 'center'}
              justifyContent={isApp ? 'space-between' : 'flex-start'}
            >
              <DLMMCoinPairInfo
                poolInfo={{ ...rest }}
                symbolEllipsesDecimals={10}
                hasFee={hasFee}
                symbolFontSize={'14px'}
                imgBoxStyle={isApp ? { w: '20px', h: '20px' } : { w: '32px', h: '32px' }}
                isParent={isParent ?? false}
                showPool={hasFee}
                haveFarming={rest?.haveFarming}
                haveMining={rest?.haveMining}
                isOnlyOneData={isOnlyOneData}
                {...(isApp && {
                  padding: '12px 0 0'
                })}
              />
              {!isApp && rest?.haveFarming && <FarmingIcon mt={isOnlyOneData ? '12px' : '0'} />}
              {!isApp && rest?.haveMining && <MiningIcon mt={isOnlyOneData ? '12px' : '0'} />}
              {/* <WarningIcon
              coinTypeA={rest?.coinTypeA || rest?.displayTokenA?.coinType}
              coinTypeB={rest?.coinTypeB || rest?.displayTokenB?.coinType}
              mt={isOnlyOneData ? '12px' : '0'}
            /> */}
            </HStack>

            {isApp && (
              <Box>
                <DLMMActions isParent={isParent} isOpen={isOpen} list={list} onExpand={onExpand} poolInfo={rest} />
              </Box>
            )}
          </HStack>
        )
      }
    },
    {
      title: (
        <TableSortTh labelInfo={sortByObject['tvl']} sortRule={sortRule} sortBy={sortBy} clickSort={(value: poolListType) => clickSort(value)} />
      ),
      key: 'tvlDisplay'
    },
    {
      title: (
        <TableSortTh labelInfo={sortByObject['vol']} sortRule={sortRule} sortBy={sortBy} clickSort={(value: poolListType) => clickSort(value)} />
      ),
      key: 'volume24Display'
    },
    {
      title: (
        <TableSortTh labelInfo={sortByObject['fees']} sortRule={sortRule} sortBy={sortBy} clickSort={(value: poolListType) => clickSort(value)} />
      ),
      key: 'fees24Display'
    },
    {
      title: <Text textAlign="right">Rewards</Text>,
      key: 'rewards',
      hidden: ({ miningRewardList, farmsRewarderList }: { miningRewardList: any; farmsRewarderList: any }) => {
        return miningRewardList && miningRewardList?.length <= 0 && farmsRewarderList && farmsRewarderList?.length <= 0
      },
      render: (
        {
          miningRewardList,
          farmsRewarderList,
          isParent,
          hasFee
        }: { miningRewardList: any; farmsRewarderList: any; isParent?: boolean; hasFee?: boolean },
        _?: any
      ) => {
        return <RewardsBlock miningRewardList={miningRewardList} farmsRewarderList={farmsRewarderList} isParent={isParent} showRate={hasFee} />
      }
    },
    {
      title: (
        <TableSortTh
          labelInfo={sortByObject['totalApr']}
          sortRule={sortRule}
          sortBy={sortBy}
          tooltip={{
            content:
              'Estimated based on trading activity in the past 24 hours plus mining and farming rewards. For pool groups, the displayed APR represents the highest value among active pools in that category. Estimated APR = [(24h fees + 24h rewards) × 365 / TVL] × 100%'
          }}
          clickSort={(value: poolListType) => clickSort(value)}
          justifyContent="flex-end"
        />
      ),
      key: 'apr24h',
      render: (item: any) => {
        return item?.totalAllAprDisplay && !item?.hasFee ? (
          <Text color="text_highlight" fontSize={isApp ? '12px' : '14px'} fontWeight="500">
            {item?.totalAllAprDisplay}
          </Text>
        ) : (
          <AprTooltip poolInfo={item} showAprSize={isApp ? '12px' : '14px'} placement={isApp ? 'auto-start' : 'top'} />
        )
      }
    },
    {
      title: <Text textAlign="right">Actions</Text>,
      showLabel: false,
      key: 'actions',
      hidden: isApp,
      render: ({
        isParent,
        isOpen,
        list,
        onExpand,
        ...rest
      }: {
        isParent?: boolean
        isOpen?: boolean
        list?: DlmmPoolData[]
        onExpand?: () => void
        [key: string]: any
      }) => {
        return (
          <Box>
            <DLMMActions isParent={isParent} isOpen={isOpen} list={list} onExpand={onExpand} poolInfo={rest} />
          </Box>
        )
      }
    }
  ]
}

export { getColumns }
