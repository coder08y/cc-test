import usePositionStore from '@/store/position'
import { PoolApiInfo, PosBaseInfo } from '@/types'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { d, formatCurrency } from '@cetus/utils'
import { Skeleton, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

type StakedBlockProps = {
  apiInfo: PoolApiInfo
}

export function StakedBlock({ apiInfo }: StakedBlockProps) {
  const { currentAccount } = useAccountStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { coinPriceObj } = useTokenPriceStore()

  const { posLiquidityData, posBaseListLoading, posBaseListGroupByPool } = usePositionStore()

  // 计算单个池子所有仓位的质押
  const totalStaked = useMemo(() => {
    if (!currentAccount?.address || !apiInfo?.poolAddress) return '--'
    if (!posBaseListLoading) {
      // 用posBaseListGroupByPool[apiInfo.poolAddress]?.list遍历一个池子下的所有仓位
      const posBaseList = posBaseListGroupByPool[apiInfo.poolAddress]?.list?.filter((item: PosBaseInfo) => item?.posType == 'farms') || []

      // 累加所有仓位的流动性价值
      return posBaseList.reduce((total: any, item: PosBaseInfo) => {
        const currentPosData = posLiquidityData[item?.posId]
        const amountValueA = getTokenAmountValue(apiInfo?.displayTokenA?.coin_type, currentPosData?.displayCoinAmountA, '--')
        const amountValueB = getTokenAmountValue(apiInfo?.displayTokenB?.coin_type, currentPosData?.displayCoinAmountB, '--')
        if (total == '--' || amountValueA == '--' || amountValueB == '--') {
          return '--'
        } else {
          return d(total).plus(amountValueA).plus(amountValueB).toString()
        }
      }, '0')
    }
  }, [posBaseListLoading, Object.values(posLiquidityData)?.length, coinPriceObj, currentAccount?.address])

  const [myPosNum, setMyPosNum] = useState('')
  const expendList = useMemo(() => {
    const list =
      posBaseListGroupByPool?.[apiInfo?.poolAddress]?.list
        ?.filter(item => item.posType !== 'burn')
        .sort((a: PosBaseInfo, b: PosBaseInfo) => Number(b.liquidity) - Number(a.liquidity)) || []
    console.log('🚀 ~ expendList ~ list:', list)
    return list
  }, [apiInfo?.poolAddress, posBaseListGroupByPool])

  useEffect(() => {
    const stakeList = expendList?.filter(item => item.posType == 'farms')
    setMyPosNum(stakeList?.length.toString())
  }, [expendList])
  return (
    <>
      {!currentAccount?.address ? (
        <Text textColor="text_caption" textAlign="right">
          --
        </Text>
      ) : (
        <VStack align="flex-end">
          <Skeleton isLoaded={!!totalStaked}>
            <Text textColor="text_caption" fontWeight="500" textAlign="right" lineHeight="1">
              {formatCurrency(totalStaked, 2)}
            </Text>
          </Skeleton>
          {Number(myPosNum) > 0 && (
            <Skeleton isLoaded={!!totalStaked}>
              <Text
                fontWeight="500"
                bg="position_farms_bg"
                color="position_farms_color"
                fontSize="12px"
                borderRadius="8px"
                padding="2px 10px"
                lineHeight="1"
              >
                {myPosNum} {Number(myPosNum) > 1 ? 'Positions' : 'Position'}
              </Text>
            </Skeleton>
          )}
        </VStack>
      )}
    </>
  )
}
