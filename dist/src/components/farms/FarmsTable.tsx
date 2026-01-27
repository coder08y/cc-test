import { useAccountStore } from '@cetus/stores'
import NoData from '@cetus/ui-kit/src/components/NoData'
import { Flex, Skeleton, Table, Tbody, Td, Th, Thead, Tr } from '@chakra-ui/react'
import React from 'react'
import { FarmsTableItem } from './FarmsTableItem'

type FarmsTableProps = {
  dataList: any
  showSkeletonLoading: boolean
  currTabLabel: string
}

export function FarmsTable({ dataList, showSkeletonLoading, currTabLabel }: FarmsTableProps) {
  const { currentAccount, onWalletModal } = useAccountStore()
  return (
    <Table variant="simple_list" w="100%">
      <Thead>
        <Tr>
          <Th>Pools</Th>
          <Th textAlign="right">Staked TVL</Th>
          <Th textAlign="right">APR</Th>
          <Th textAlign="right">Rewards / day</Th>
          <Th textAlign="right">Your Staked</Th>
          <Th textAlign="right">Your Earned</Th>
          <Th textAlign="right">Actions</Th>
        </Tr>
      </Thead>

      <Tbody>
        {currTabLabel == 'Your Farms' && !currentAccount?.address ? (
          <Tr
            sx={{
              td: {
                bg: 'none !important',
                p: '0 !important',
                border: 'none !important'
              },
              '&:hover': {
                bg: 'none !important',
                p: '0 !important',
                border: 'none !important'
              }
            }}
          >
            <Td colSpan={7} w="100%">
              <NoData
                type="nowallet"
                onboard={() => {
                  onWalletModal(true)
                }}
              />
            </Td>
          </Tr>
        ) : showSkeletonLoading ? (
          <SkipViewPc itemList={[1, 2, 3]} skeletonNum={7} skeletonW={['200px', '110px', '100px', '100px', '100px', '100px', '100px']} />
        ) : dataList.length === 0 ? (
          <Tr
            sx={{
              td: {
                bg: 'none !important',
                p: '0 !important',
                border: 'none !important'
              },
              '&:hover': {
                bg: 'none !important',
                p: '0 !important',
                border: 'none !important'
              }
            }}
          >
            <Td colSpan={7} w="100%">
              <NoData type="nodata" text="No farms found" />
            </Td>
          </Tr>
        ) : (
          dataList.map((info: any) => {
            return <FarmsTableItem key={info.poolAddress} apiInfo={info} />
          })
        )}
      </Tbody>
    </Table>
  )
}

export function SkipViewPc({
  itemList,
  skeletonNum,
  skeletonW,
  rowStyle,
  isPreMode
}: {
  itemList: number[]
  skeletonNum: number
  skeletonW?: string[]
  rowStyle?: any
  isPreMode?: boolean
}) {
  const renderSkeletonCells = (count: number, width?: string[]) => {
    return Array.from({ length: count }).map((_, index) => (
      <Td key={index} textAlign="right">
        <Flex justify={index == 0 ? 'flex-start' : 'flex-end'}>
          <Skeleton w={width ? width[index] : isPreMode ? '100px' : '200px'} />
        </Flex>
      </Td>
    ))
  }

  return itemList.map(item => (
    <React.Fragment key={item}>
      <Tr h="90px" {...rowStyle}>
        {renderSkeletonCells(skeletonNum, skeletonW)}
      </Tr>
      <Tr h="16px" />
    </React.Fragment>
  ))
}
