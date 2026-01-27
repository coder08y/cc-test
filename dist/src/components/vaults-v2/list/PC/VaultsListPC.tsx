import { poolListType } from '@/components/pools/PoolsContent'
import { VaultsV2ListProps } from '@/types/vaults-v2'
import { TableSortTh } from '@cetus/design'
import { SortDropType } from '@cetus/design/src/components/common/SortDropBlock'
import { useAccountStore } from '@cetus/stores'
import NoData from '@cetus/ui-kit/src/components/NoData'
import { HStack, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import React from 'react'
import VaultsListItem from '../VaultsListItem'

export function VaultsListPC({
  dataList,
  showSkeletonLoading,
  showNoWallet,
  isShowPowered,
  onSortByChange,
  currSortType,
  sortRule,
  sortByObject,
  currentStatus
}: VaultsV2ListProps & {
  onSortByChange: (value: poolListType) => void
  sortByList: SortDropType[]
  currSortType: SortDropType
  sortByObject: Record<string, SortDropType>
  sortRule: any
  currentStatus: string
}) {
  const { onWalletModal } = useAccountStore()

  return (
    <Table variant="simple_list" w="100%" mt="20px">
      <Thead>
        <Tr>
          <Th>Vaults</Th>
          <Th>
            <TableSortTh
              labelInfo={sortByObject['tvl']}
              sortRule={sortRule}
              sortBy={currSortType}
              clickSort={(value: poolListType) => onSortByChange(value)}
            />
          </Th>

          <Th textAlign="right">
            {/* <HStack justify="flex-end" gap="2px">
              <TableSortTh
                labelInfo={sortByObject['apr']}
                sortRule={sortRule}
                sortBy={currSortType}
                clickSort={(value: poolListType) => onSortByChange(value)}
              />
              <CetusTooltip
                tooltip={
                  <Text lineHeight="20px" fontSize="12px">
                    APY is estimated according to the trading fees and rewards earned over the past 24 hours with daily compounding to be considered.
                  </Text>
                }
              >
                <Icon xlinkHref="#icon-icon_tips" />
              </CetusTooltip>
            </HStack> */}
            <TableSortTh
              labelInfo={sortByObject['apr']}
              sortRule={sortRule}
              sortBy={currSortType}
              tooltip={{
                content:
                  'APY is estimated according to the trading fees and rewards earned over the past 7 days with daily compounding to be considered.'
              }}
              clickSort={(value: poolListType) => onSortByChange(value)}
              justifyContent="flex-end"
              tooltipStyle={{
                maxW: {
                  base: '300px',
                  lg: '400px'
                }
              }}
            />
          </Th>
          <Th textAlign="right">Provider</Th>
          <Th textAlign="right">Earnings</Th>
          <Th textAlign="right">Your Holdings</Th>
          <Th textAlign="right">Action</Th>
        </Tr>
      </Thead>

      <Tbody>
        {!showNoWallet && !showSkeletonLoading && dataList?.length === 0 && (
          <Tr>
            <Td colSpan={7} w="100%" style={{ borderRadius: '16px' }}>
              <NoData type="nodata" text="No vaults found" border="none" />
            </Td>
          </Tr>
        )}

        {showNoWallet && (
          <Tr>
            <Td colSpan={7} w="100%" style={{ borderRadius: '16px' }}>
              <NoData type="nowallet" onboard={() => onWalletModal(true)} border="none" />
            </Td>
          </Tr>
        )}

        {showSkeletonLoading && <SkeletonViewPc itemList={[1, 2, 3]} />}
        {!showSkeletonLoading &&
          dataList.map(info => {
            return (
              <VaultsListItem
                key={info.vaultId}
                apiInfo={info}
                isShowPowered={isShowPowered && (info.category == 'haedal' || info.category == 'haevault_v2')}
                currentStatus={currentStatus}
              />
            )
          })}
      </Tbody>
    </Table>
  )
}

function SkeletonViewPc({ itemList }: { itemList: number[] }) {
  return itemList.map(item => {
    return (
      <React.Fragment key={item}>
        <Tr
          h="106px"
          sx={{
            td: {
              pb: '16px'
            }
          }}
        >
          <Td w="28%">
            <Skeleton w="220px" />
          </Td>
          <Td textAlign="right" w="14%">
            <HStack justifyContent="end">
              <Skeleton />
            </HStack>
          </Td>

          <Td textAlign="right" w="13%">
            <HStack justifyContent="end">
              <Skeleton />
            </HStack>
          </Td>

          <Td textAlign="right" w="13%">
            <HStack justifyContent="end">
              <Skeleton />
            </HStack>
          </Td>

          <Td textAlign="right" w="13%">
            <HStack justifyContent="end">
              <Skeleton />
            </HStack>
          </Td>

          <Td textAlign="right" w="13%">
            <HStack justifyContent="end">
              <Skeleton />
            </HStack>
          </Td>

          <Td textAlign="right" w="20%">
            <HStack justifyContent="end">
              <Skeleton />
            </HStack>
          </Td>
        </Tr>

        <Tr h="16px" />
      </React.Fragment>
    )
  })
}
