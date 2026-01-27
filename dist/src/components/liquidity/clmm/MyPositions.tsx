import PositionItem from '@/components/position/clmm/list/PositionItem'
import useMyPositions from '@/hooks/clmm/useMyPositions'
import useGetClmmPositionDailyEarning from '@/hooks/position/useGetClmmPositionDailyEarning'
import useLiquidityStore from '@/store/clmm'
import usePositionStore from '@/store/position'
import { GetPositionDailyEarningsOptions } from '@/types/dlmm'
import { Block } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NoData } from '@cetus/ui-kit'
import { d } from '@cetus/utils'
import { Button, VStack } from '@chakra-ui/react'
import { useDebounceEffect } from 'ahooks'
import { useNavigate } from 'react-router-dom'

function MyPositions({ priceDirect }: { priceDirect: boolean }) {
  const navigate = useNavigate()
  const { apiPoolInfo } = useLiquidityStore()
  const { currentAccount, posBaseListLoading, data, rpcNodeErrorStr, onWalletModal } = useMyPositions()
  const { posLiquidityData } = usePositionStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { isApp } = useWindowWidth()
  const { getClmmPositionDailyEarnings } = useGetClmmPositionDailyEarning()

  useDebounceEffect(() => {
    if (data && data?.length > 0 && posLiquidityData && Object.keys(posLiquidityData).length > 0) {
      const options: GetPositionDailyEarningsOptions[] = data?.map(item => {
        const currentPosLiquidity = posLiquidityData[item?.posId]
        const amountValueA = getTokenAmountValue(item?.displayTokenA?.coin_type, currentPosLiquidity?.displayCoinAmountA)
        const amountValueB = getTokenAmountValue(item?.displayTokenB?.coin_type, currentPosLiquidity?.displayCoinAmountB)
        return {
          position_id: item?.posId,
          current_pool_tvl: d(amountValueA).plus(amountValueB).toString()
        }
      })
      getClmmPositionDailyEarnings(options)
    }
  }, [data, posLiquidityData, getTokenAmountValue])

  return (
    <VStack minW={{ base: '100%', lg: '1024px' }} p={{ base: '12px 0', lg: '0px' }}>
      {!currentAccount?.address ? (
        <NoData type="nowallet" onboard={() => onWalletModal(true)} />
      ) : data && data?.length > 0 ? (
        <Block
          p={{ base: '0', lg: '16px' }}
          borderRadius={isApp ? '0' : '16px'}
          sx={{ ...(isApp && { border: 'none !important', bg: 'transparent !important' }) }}
        >
          <PositionItem poolInfo={{ list: data }} priceDirect={priceDirect} isListWrap={false} />
        </Block>
      ) : rpcNodeErrorStr ? (
        <NoData type="nodata" text={rpcNodeErrorStr} />
      ) : (
        <NoData
          type="nodata"
          text="You don't have positions for this pool"
          children={
            <Button
              borderRadius="8px"
              mt="8px"
              fontWeight="500"
              w="120px"
              h="28px"
              fontSize="12px"
              onClick={() => navigate(`/clmm?tab=deposit&poolAddress=${apiPoolInfo?.poolAddress}`)}
            >
              Create Position
            </Button>
          }
        />
      )}
    </VStack>
  )
}

export default MyPositions
