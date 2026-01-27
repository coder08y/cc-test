import DLMMPositionItem from '@/components/position/dlmm/list/DLMMPositionItem'
import useMyDlmmPositions from '@/hooks/dlmm/useMyDlmmPositions'
import useGetDlmmPositionDailyEarning from '@/hooks/position/useGetDlmmPositionDailyEarning'
import useDlmmLiquidityStore from '@/store/dlmm'
import useDlmmPositionStore from '@/store/dlmm-position'
import { GetPositionDailyEarningsOptions } from '@/types/dlmm'
import { Block } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NoData } from '@cetus/ui-kit'
import { d } from '@cetus/utils'
import { Button, VStack } from '@chakra-ui/react'
import { useDebounceEffect } from 'ahooks'
import { useNavigate } from 'react-router-dom'

function MyPositions({ priceDirect }: { priceDirect?: boolean }) {
  const navigate = useNavigate()
  const { dlmmApiPoolInfo } = useDlmmLiquidityStore()
  const { currentAccount, dlmmPosBaseListLoading, data, rpcNodeErrorStr, onWalletModal } = useMyDlmmPositions()
  const { dlmmPosLiquidityData } = useDlmmPositionStore()
  const { isApp } = useWindowWidth()

  const { getDlmmPositionDailyEarnings } = useGetDlmmPositionDailyEarning()
  const { getTokenAmountValue } = useTokenPrice()

  useDebounceEffect(() => {
    if (data && data?.length > 0 && dlmmPosLiquidityData && Object.keys(dlmmPosLiquidityData).length > 0) {
      const options: GetPositionDailyEarningsOptions[] = data.map(item => {
        const currentPosLiquidity = dlmmPosLiquidityData[item?.id]
        const amountValueA = getTokenAmountValue(item?.displayTokenA?.coin_type, currentPosLiquidity?.displayCoinAmountA)
        const amountValueB = getTokenAmountValue(item?.displayTokenB?.coin_type, currentPosLiquidity?.displayCoinAmountB)

        return {
          position_id: item?.id,
          current_pool_tvl: d(amountValueA).plus(amountValueB).toString()
        }
      })
      getDlmmPositionDailyEarnings(options)
    }
  }, [data, dlmmPosLiquidityData, getTokenAmountValue])

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
          <DLMMPositionItem poolInfo={{ list: data }} priceDirect={priceDirect} isListWrap={false} />
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
              onClick={() => navigate(`/dlmm?tab=deposit&poolId=${dlmmApiPoolInfo?.poolId}`)}
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
