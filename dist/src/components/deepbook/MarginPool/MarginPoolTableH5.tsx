import useDeepBookMarginPoolStore from '@/store/deepbook/marginPool'
import { NoData } from '@cetus/ui-kit'
import { Button, HStack, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import MarginPoolInfo from './tableItem/MarginPoolInfo'
import TotalSupply from './tableItem/TotalSupply'
import YourSupplied from './tableItem/YourSupplied'

export function MarginPoolTableH5({
  changeIsOpenModal,
  changeCurrentMarginPool
}: { changeIsOpenModal: (val: boolean, tab: string) => void; changeCurrentMarginPool: (val: any) => void }) {
  const deepBookMarginPools = useDeepBookMarginPoolStore(state => state.deepBookMarginPools)
  const isMarginPoolsLoading = useDeepBookMarginPoolStore(state => state.isMarginPoolsLoading)

  return (
    <VStack w="100%" m="20px 0">
      {isMarginPoolsLoading ? (
        <VStack
          w="100%"
          gap="16px"
          sx={{ '>div': { borderBottom: '1px solid', borderColor: 'border', pb: '16px', _last: { borderBottom: 'none', pb: '0px' } } }}
        >
          {[{}, {}].map((item, index) => (
            <TableCardLoading key={index} />
          ))}
        </VStack>
      ) : deepBookMarginPools.length === 0 ? (
        <NoData type="nodata" text="You don't have any open orders yet." borderRadius="16px" />
      ) : (
        <VStack
          w="100%"
          gap="16px"
          //  _first: { borderTop: '1px solid', borderColor: 'border', pt: '16px' },
          sx={{ '>div': { borderBottom: '1px solid', borderColor: 'border', pb: '16px', _last: { borderBottom: 'none', pb: '0px' } } }}
        >
          {deepBookMarginPools?.map((item: any) => (
            <VStack w="100%" gap="12px">
              <HStack w="100%" justify="space-between">
                <MarginPoolInfo item={item} />
                <HStack>
                  <Button
                    variant="outline"
                    w="68px"
                    h="22px"
                    fontSize="12px"
                    borderRadius="4px"
                    fontWeight="500"
                    onClick={() => {
                      changeCurrentMarginPool(item)
                      changeIsOpenModal(true, 'Withdraw')
                    }}
                  >
                    Withdraw
                  </Button>
                  <Button
                    w="68px"
                    h="22px"
                    fontSize="12px"
                    borderRadius="4px"
                    fontWeight="500"
                    onClick={() => {
                      changeCurrentMarginPool(item)
                      changeIsOpenModal(true, 'Deposit')
                    }}
                  >
                    Deposit
                  </Button>
                </HStack>
              </HStack>
              <HStack w="100%" justify="space-between" minH="16px">
                <Text fontSize="12px">Total Supply</Text>
                <TotalSupply item={item} />
              </HStack>
              <HStack w="100%" justify="space-between" minH="16px">
                <Text fontSize="12px">Supply APY</Text>
                <Text color="primary" fontSize="12px">
                  {item?.displayApy}
                </Text>
              </HStack>
              <HStack w="100%" justify="space-between" minH="16px">
                <Text fontSize="12px">Your Holdings</Text>
                <YourSupplied item={item} />
              </HStack>
            </VStack>
          ))}
        </VStack>
      )}
    </VStack>
  )
}

export const TableCardLoading = () => {
  return (
    <VStack w="100%" gap="8px" align="flex-start">
      <HStack w="100%" gap="0" justify="space-between">
        <HStack gap="0">
          <HStack gap="0px" mr="8px" align="flex-start">
            <SkeletonCircle size="8" />
          </HStack>
          <Skeleton height="4" width="100px" />
        </HStack>
      </HStack>
      <HStack w="100%" justify="space-between">
        <Skeleton height="4" width="180px" />
        <Skeleton height="4" width="150px" />
      </HStack>
      <HStack w="100%" justify="space-between">
        <Skeleton height="4" width="180px" />
        <Skeleton height="4" width="150px" />
      </HStack>
    </VStack>
  )
}
