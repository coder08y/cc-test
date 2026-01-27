import CoinPairInfo from '@/components/common/CoinPairInfo'
import usePositionListAction from '@/hooks/position/usePositionListAction'
import useGlobalStore from '@/store/common/global'
import usePoolsStore from '@/store/pool'
import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { cancelBubble } from '@cetus/utils'
import { Button, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PositionItem from '../clmm/list/PositionItem'
import PositionCurrentPrice from '../common/PositionCurrentPrice'

function PoolItem({
  poolInfo,
  openExpendList,
  setOpenExpendList
}: {
  poolInfo: any
  openExpendList: string[]
  setOpenExpendList: (list: string[]) => void
}) {
  const navigate = useNavigate()
  const { posPoolsRelatedData, posApiPoolData } = usePositionStore()
  const { toCloseAllAction, isRemoveLoading } = usePositionListAction()
  const { isExpendPositionMap, setIsExpendPosition } = usePoolsStore()

  useEffect(() => {
    setIsExpendPosition(poolInfo?.clmmPoolAddress, true)
  }, [])

  const isOpenExpend = useMemo(() => {
    const isOpen = isExpendPositionMap[poolInfo?.clmmPoolAddress]
    if (isOpen === undefined) {
      return true
    }
    return isOpen
  }, [isExpendPositionMap, poolInfo?.clmmPoolAddress])

  const closeAllPositionList = useMemo(() => {
    return poolInfo?.list?.filter((item: PosBaseInfo) => item.posType !== 'burn') || []
  }, [poolInfo?.list])

  const haveFarming = posApiPoolData[poolInfo?.clmmPoolAddress]?.haveFarming
  const feeDisplay = (posPoolsRelatedData[poolInfo?.list?.[0]?.posId]?.displayFee || '--') + '%'

  const toCloseAll = async () => {
    if (closeAllPositionList.length) toCloseAllAction(closeAllPositionList)
  }
  const { setBackUrl } = useGlobalStore()

  const [priceDirect, setPriceDirect] = useState(true)
  const { isApp } = useWindowWidth()
  return (
    <Block w="100%" p={isApp ? '4px 12px 12px' : isOpenExpend ? '12px 16px 16px' : '12px 16px 8px'} borderRadius="16px">
      <VStack w="100%" gap={{ base: '12px', lg: '12px' }}>
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          justify="space-between"
          w="100%"
          gap={{ base: '12px', lg: '8px' }}
          onClick={() => {
            setIsExpendPosition([poolInfo?.clmmPoolAddress], !isOpenExpend)
          }}
        >
          {/* <PoolShowInfo
            symbolFontWeight="500"
            symbolFontSize="16px"
            symbolEllipsesDecimals={10}
            nameEllipsesDecimals={20}
            poolInfo={{ feeDisplay, ...poolInfo }}
            haveName
            haveFarming={haveFarming}
          /> */}
          <CoinPairInfo
            symbolFontWeight="500"
            symbolFontSize="16px"
            symbolEllipsesDecimals={10}
            nameEllipsesDecimals={20}
            poolInfo={{ feeDisplay, ...poolInfo, poolAddress: poolInfo?.clmmPoolAddress, poolType: 'clmm' }}
            haveName={true}
            haveFarming={haveFarming}
            versionBlockPosition="right"
            clickFun={() => navigate(`/clmm?poolAddress=${poolInfo?.clmmPoolAddress}`)}
          />
          <HStack flexDirection={{ base: 'column', lg: 'row' }} gap={{ base: '12px', lg: '8px' }}>
            <PositionCurrentPrice
              symbolEllipsesDecimals={10}
              posId={poolInfo?.list?.[0]?.posId}
              displayTokenA={poolInfo?.displayTokenA}
              displayTokenB={poolInfo?.displayTokenB}
              handleDirect={() => setPriceDirect(!priceDirect)}
            />

            <HStack w={{ base: '100%', lg: 'unset' }} flexDirection={{ base: 'column', lg: 'row' }} justify="space-between">
              {/* <HStack w={{ base: '100%', lg: 'unset' }}> */}
              {/* <HStack w={{ base: closeAllPositionList?.length > 0 ? '100%' : '100%', lg: 'unset' }} sx={{ button: { w: '100%' } }}> */}
              {/* <CetusTooltip
                    placement="top"
                    tooltip={
                      <Text fontSize="12px" lineHeight="20px" color="text_caption">
                        Create a new position
                      </Text>
                    }
                    showTooltip={!isApp}
                  >
                   
                  </CetusTooltip> */}
              <Button
                onClick={e => {
                  cancelBubble(e)
                  setBackUrl('/pools?tab=positions')
                  navigate(`/clmm?poolAddress=${poolInfo?.clmmPoolAddress}`)
                }}
                borderRadius="8px"
                w={{ base: '100%', lg: 'unset' }}
                p={{ base: '0 8px', lg: '0 12px' }}
                h="32px"
                fontWeight="500"
                variant="outline"
                bg="primary_opacity.10"
                fontSize="12px"
              >
                Create Position
              </Button>
              {/* </HStack> */}

              {/* {closeAllPositionList?.length > 0 && (
                  <Button
                    onClick={e => {
                      cancelBubble(e)
                      toCloseAll()
                    }}
                    isLoading={isRemoveLoading}
                    disabled={!closeAllPositionList.length || isRemoveLoading}
                    borderRadius="8px"
                    w={{ base: '50%', lg: '68px' }}
                    p={{ base: '0 8px', lg: '0 16px' }}
                    h="32px"
                    fontSize="12px"
                    fontWeight="500"
                    variant="outline"
                  >
                    Close All
                  </Button>
                )} */}
              {/* </HStack> */}
              <Block
                cursor="pointer"
                w={{ base: '100%', lg: 'unset' }}
                p="4px 0 4px 4px"
                h="32px"
                borderRadius="8px"
                bg="none"
                border={{ base: '1px solid', lg: 'none' }}
                borderColor="border"
                _hover={{
                  svg: { fill: 'text_caption' },
                  p: { color: 'text_caption' }
                }}
              >
                <HStack justify="center" w="100%" h="100%" gap="4px">
                  <Text fontSize="12px">
                    {poolInfo?.list?.length} {poolInfo?.list?.length > 1 ? 'Positions' : 'Position'}
                  </Text>
                  <Icon
                    svgW="14px"
                    svgH="14px"
                    w="14px"
                    h="14px"
                    xlinkHref="#icon-icon_arrow"
                    fontSize="12px"
                    transition="transform 0.5s"
                    transform={isOpenExpend ? 'rotate(180deg)' : 'rotate(0deg)'}
                  />
                </HStack>
              </Block>
            </HStack>
          </HStack>
        </Stack>
        {isOpenExpend && <PositionItem poolInfo={poolInfo} priceDirect={priceDirect} />}
      </VStack>
    </Block>
  )
}

export default PoolItem
