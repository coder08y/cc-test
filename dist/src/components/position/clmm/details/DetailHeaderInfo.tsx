import { PoolShowInfo } from '@/components/common/CoinPairInfo'
import AprTooltip from '@/components/common/aprTooltip'
import StatsInfo from '@/components/liquidity/clmm/StatsInfo'
import useGetTvlInfo from '@/hooks/clmm/useGetTvlInfo'
import usePosHelper from '@/hooks/position/usePosHelper'
import useGlobalStore from '@/store/common/global'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { PosBaseInfo } from '@/types'
import { AddressCopyLink, CopyButton } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { isAvailableObject, symbolDataDisplayProcessing } from '@cetus/utils'
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import StatusPosition from '../../common/StatusPosition'
function DetailHeaderInfo() {
  const { currentPosBaseInfo, posPoolsRelatedData, posPoolsOriginalData } = usePositionStore()
  const { currentPosPoolInfo, curPosContractPoolInfo } = usePositionDetailStore()
  const currentPosPoolsRelatedData = posPoolsRelatedData[currentPosBaseInfo?.posId as string]

  const { getClmmPosName, getTokenALock, getTokenBLock } = usePosHelper()
  const tokenName = useMemo(() => {
    if (currentPosBaseInfo?.tokenName) {
      return currentPosBaseInfo?.tokenName
    } else {
      const position_index = posPoolsOriginalData?.[currentPosBaseInfo?.clmmPool as string]?.index
      return getClmmPosName(currentPosBaseInfo?.index as number, position_index)
    }
  }, [currentPosBaseInfo?.tokenName, currentPosBaseInfo?.index, currentPosBaseInfo?.clmmPool, posPoolsOriginalData])

  const displayFee = currentPosPoolsRelatedData?.displayFee + '%'

  const showTokenALock = useMemo(() => {
    return getTokenALock(currentPosBaseInfo as PosBaseInfo, curPosContractPoolInfo?.current_sqrt_price)
  }, [curPosContractPoolInfo?.current_tick_index, currentPosBaseInfo])

  const showTokenBLock = useMemo(() => {
    return getTokenBLock(currentPosBaseInfo as PosBaseInfo, curPosContractPoolInfo?.current_sqrt_price)
  }, [curPosContractPoolInfo?.current_tick_index, currentPosBaseInfo])

  const isActive = useMemo(() => {
    return !showTokenALock && !showTokenBLock && currentPosPoolsRelatedData?.currentStatus === 'Active'
  }, [showTokenALock, showTokenBLock, currentPosPoolsRelatedData?.currentStatus])

  const { getExplorerUrl } = useExplorer()
  const navigate = useNavigate()
  const { setBackUrl } = useGlobalStore()
  const { isApp } = useWindowWidth()
  const { totalAmountUSD: totalTvl, tvlLoading } = useGetTvlInfo()

  return (
    <HStack gap="12px" mb="8px" w="100%" justifyContent="space-between" align="flex-end" flexDirection={{ base: 'column', lg: 'row' }}>
      {currentPosBaseInfo?.clmmPool ? (
        <VStack w={{ base: '100%', lg: 'unset' }} align="flex-start" gap="12px">
          <Box mb="-12px" w={{ base: '100%', lg: 'unset' }}>
            <PoolShowInfo
              poolInfo={{ feeDisplay: displayFee, poolAddress: currentPosBaseInfo?.clmmPool, ...currentPosBaseInfo }}
              symbolEllipsesDecimals={10}
              nameEllipsesDecimals={20}
              symbolFontSize="20px"
              // placement='bottom-start'
              versionBlockPosition="right"
              type="column"
              showPoolTypeTag
              moreDetails
              // dividerTooltip={false}
              isShowInfoIcon={true}
              boxStyle={{ padding: '8px 0' }}
            />
          </Box>
          <HStack w={{ base: '100%', lg: 'unset' }}>
            {tokenName && currentPosBaseInfo?.id && (
              <HStack
                p={{ base: '8px', lg: '3px 8px' }}
                borderRadius="8px"
                bg="bg_secondary"
                gap={{ base: '8px', lg: '4px' }}
                flexDirection={{ base: 'column', lg: 'row' }}
                align={{ base: 'flex=start', lg: 'center' }}
              >
                <HStack>
                  <Text color="primary_gray" fontSize="12px">
                    Position ID
                  </Text>
                  <Text color="primary_gray" fontSize="12px">
                    {tokenName?.split('|')[1]}
                  </Text>
                </HStack>
                <HStack gap={{ base: '8px', lg: '4px' }}>
                  <Text color="primary_gray" fontSize="12px">
                    {isApp ? 'Position Address' : '|'}
                  </Text>
                  <HStack gap="0px">
                    <AddressCopyLink
                      fontWeight="500"
                      showCopy={false}
                      color="primary_gray"
                      address={currentPosBaseInfo?.id as string}
                      showLink={false}
                      onClickLink={() => {
                        window.open(getExplorerUrl(currentPosBaseInfo?.id, 'nftAddress'), '_blank')
                      }}
                    />
                    <CopyButton text={currentPosBaseInfo?.id} copyText="Position address copied" />
                  </HStack>
                </HStack>
              </HStack>
            )}
            {currentPosPoolsRelatedData?.currentStatus !== undefined && (
              <StatusPosition
                isActive={isActive}
                isLoading={!isAvailableObject(currentPosBaseInfo) || !isAvailableObject(posPoolsOriginalData?.[currentPosBaseInfo?.clmmPool || ''])}
              />
            )}
          </HStack>
        </VStack>
      ) : (
        <VStack w={{ base: '100%', lg: 'unset' }} gap="0px" justify="flex-end" align="flex-start">
          <Skeleton w="150px" m="12px 0" />
          <Skeleton w="200px" />
        </VStack>
      )}
      <Box sx={{ ...(isApp && { w: '100%', overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }) }}>
        <HStack w={{ base: 'max-content', lg: 'unset' }} gap={{ base: '4px', lg: '28px' }} flexDirection="row">
          <StatsInfo
            label="Pool APR"
            value={
              <AprTooltip poolInfo={currentPosPoolInfo} placement={isApp ? 'bottom-end' : 'bottom'}>
                <HStack justify="flex-end" align="flex-end" gap="4px" lineHeight="14px" h="14px">
                  <Text
                    as="span"
                    fontSize="14px"
                    color="text_caption"
                    fontWeight="500"
                    cursor={currentPosPoolInfo?.farmingAprDisplay || currentPosPoolInfo?.miningAprList?.length > 0 ? 'help' : 'text'}
                  >
                    {currentPosPoolInfo?.feeAndMiningAprDisplay ? currentPosPoolInfo?.feeAndMiningAprDisplay : '--'}
                  </Text>
                  {currentPosPoolInfo?.haveFarming && currentPosPoolInfo?.farmingAprDisplay && currentPosPoolInfo?.farmingAprDisplay !== '--' && (
                    <Text fontSize="12px" lineHeight="12px" h="12px" color="primary" fontWeight="500">
                      +{currentPosPoolInfo?.farmingAprDisplay}
                    </Text>
                  )}
                </HStack>
              </AprTooltip>
            }
            loading={!currentPosPoolInfo?.poolAddress}
          />
          <StatsInfo label="TVL" value={(symbolDataDisplayProcessing(totalTvl, '$', 2) as string) || ''} loading={tvlLoading} />
          <StatsInfo label="Volume (24H)" value={(currentPosPoolInfo?.volume24Display as string) || ''} loading={!currentPosPoolInfo?.poolAddress} />
          <StatsInfo label="Fees (24H)" value={(currentPosPoolInfo?.fees24Display as string) || ''} loading={!currentPosPoolInfo?.poolAddress} />
        </HStack>
      </Box>
    </HStack>
  )
}
export default DetailHeaderInfo
