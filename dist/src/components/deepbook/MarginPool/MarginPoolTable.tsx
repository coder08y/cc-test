import { SkipViewPc } from '@/components/farms/FarmsTable'
import useMarginPoolsAction from '@/hooks/deepbook/margin/useMarginPoolsAction'
import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { TableSortTh } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon, NoData } from '@cetus/ui-kit'
import { Button, Table, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'
import React, { useState } from 'react'
import ActionModal from './ActionModal'
import { MarginPoolTableH5 } from './MarginPoolTableH5'
import MarginPoolInfo from './tableItem/MarginPoolInfo'
import TotalSupply from './tableItem/TotalSupply'
import YourSupplied from './tableItem/YourSupplied'

export function MarginPoolTable({ sortByList, clickSort }: { sortByList: any; clickSort: any }) {
  const deepBookMarginPools = useDeepBookMarginPoolStore(state => state.deepBookMarginPools)
  const isMarginPoolsLoading = useDeepBookMarginPoolStore(state => state.isMarginPoolsLoading)
  const poolsSort = useDeepBookMarginPoolStore(state => state.poolsSort)

  const [isOpenModal, setIsOpenModal] = useState(false)
  const [currentMarginPool, setCurrentMarginPool] = useState(undefined)

  const { isLoading, toDeposit, toWithdraw } = useMarginPoolsAction(currentMarginPool, () => setIsOpenModal(false))
  const { isApp } = useWindowWidth()

  const [currentModalTab, setCurrentModalTab] = useState<any>('Deposit')

  const sortByObject = sortByList.reduce((obj: any, item) => {
    obj[item.value] = item
    return obj
  }, {})

  if (isApp)
    return (
      <>
        <MarginPoolTableH5
          changeIsOpenModal={(val: boolean, tab: string) => {
            setCurrentModalTab(tab)
            setIsOpenModal(val)
          }}
          changeCurrentMarginPool={(val: any) => setCurrentMarginPool(val)}
        />

        {isOpenModal && (
          <ActionModal
            isOpen={isOpenModal}
            onClose={() => setIsOpenModal(false)}
            currentMarginPool={currentMarginPool}
            isLoading={isLoading}
            toDeposit={toDeposit}
            toWithdraw={toWithdraw}
            tab={currentModalTab}
          />
        )}
      </>
    )

  return (
    <Table variant="simple_list" w="100%" sx={{ td: { h: '104px !important' } }} mt="16px">
      <Thead>
        <Tr>
          <Th fontSize="13px" color="primary_gray">
            Pool
          </Th>
          {/* <Th textAlign="right" fontSize="13px" color="primary_gray">
            Total Supply
          </Th> */}
          <Th>
            <TableSortTh
              labelInfo={sortByObject['supply']}
              defaultShowSortIcon
              sortRule={poolsSort?.sortRule}
              sortBy={poolsSort?.sortBy}
              clickSort={(value: any) => clickSort(value)}
            />
          </Th>
          {/* <Th textAlign="right" fontSize="13px" color="primary_gray">
            Supply APY
          </Th> */}
          <Th>
            <TableSortTh
              labelInfo={sortByObject['apy']}
              defaultShowSortIcon
              sortRule={poolsSort?.sortRule}
              sortBy={poolsSort?.sortBy}
              clickSort={(value: any) => clickSort(value)}
            />
          </Th>
          {/* <Th textAlign="right" fontSize="13px" color="primary_gray">
            Your Holdings
          </Th> */}
          <Th>
            <TableSortTh
              labelInfo={sortByObject['holdings']}
              defaultShowSortIcon
              sortRule={poolsSort?.sortRule}
              sortBy={poolsSort?.sortBy}
              clickSort={(value: any) => clickSort(value)}
            />
          </Th>
          {/* <Th textAlign="right" fontSize="13px" color="primary_gray">
            Your Earnings
          </Th> */}
          <Th textAlign="right" fontSize="13px"></Th>
        </Tr>
      </Thead>
      <Tbody>
        {isMarginPoolsLoading ? (
          <SkipViewPc itemList={[1, 2, 3]} skeletonNum={5} rowStyle={{ h: '66px' }} />
        ) : deepBookMarginPools.length === 0 ? (
          <Tr>
            <Td colSpan={5} w="100%" sx={{ borderRadius: '16px !important' }}>
              <NoData type="nodata" text="No pools found" borderRadius="16px" noBorder />
            </Td>
          </Tr>
        ) : (
          <React.Fragment>
            {deepBookMarginPools?.map((item: any, index: number) => {
              return (
                <React.Fragment key={index}>
                  <Tr
                    cursor="pointer"
                    onClick={() => {
                      setCurrentMarginPool(item)
                      setIsOpenModal(true)
                    }}
                    sx={{
                      _hover: {
                        svg: {
                          fill: 'text_caption'
                        }
                      }
                    }}
                  >
                    <Td w="25%">
                      <MarginPoolInfo item={item} />
                    </Td>
                    <Td w="25%" textAlign="right">
                      <TotalSupply item={item} />
                    </Td>
                    <Td w="20%" textAlign="right">
                      <Text color="primary">{item?.displayApy}</Text>
                    </Td>
                    <Td w="20%" textAlign="right">
                      <YourSupplied item={item} />
                    </Td>
                    {/* <Td w="17%" textAlign="right">
                      <YourEarnings item={item} />
                    </Td> */}
                    <Td w="10%" textAlign="right">
                      <Button w="32px" h="32px" borderRadius="8px" variant="ghost" p="0 !important">
                        <Icon svgW="16px" xlinkHref="#icon-icon_arrow" variant="gray" transition="transform 0.5s" transform={'rotate(-90deg)'} />
                      </Button>
                    </Td>
                  </Tr>
                  <Tr h="16px" />
                </React.Fragment>
              )
            })}
          </React.Fragment>
        )}
      </Tbody>
      {isOpenModal && (
        <ActionModal
          isOpen={isOpenModal}
          onClose={() => setIsOpenModal(false)}
          currentMarginPool={currentMarginPool}
          isLoading={isLoading}
          toDeposit={toDeposit}
          toWithdraw={toWithdraw}
        />
      )}
    </Table>
  )
}
