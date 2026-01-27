import usePositionStore from '@/store/position'
import { PoolApiInfo, PosBaseInfo, PosReward } from '@/types'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { Icon, NoData } from '@cetus/ui-kit'
import { d } from '@cetus/utils'
import { Box, Button, HStack, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import { ReactNode, useMemo, useState } from 'react'
import AprTooltip from '../common/aprTooltip'
import { FarmsExpendBlock } from './FarmsTableItem'
import { RewardsBlock } from './RewardsBlock'
import { StakedBlock } from './StakedBlock'
import { TotalEarnedBlock } from './TotalEarnedBlock'
import { ValidRangeBlock } from './ValidRangeBlock'

type FarmsListH5Props = {
  dataList: any
  showSkeletonLoading: boolean
  currTabLabel: string
}

function FarmsListH5({ dataList, showSkeletonLoading, currTabLabel }: FarmsListH5Props) {
  const { currentAccount, onWalletModal } = useAccountStore()
  return (
    <>
      {currTabLabel == 'Your Farms' && !currentAccount?.address ? (
        <NoData
          type="nowallet"
          onboard={() => {
            onWalletModal(true)
          }}
        />
      ) : showSkeletonLoading ? (
        <FarmsH5Loading />
      ) : dataList.length === 0 ? (
        <NoData type="nodata" text="No farms found" />
      ) : (
        <VStack w="100%">
          {dataList.map((apiInfo: any) => {
            return <H5Item key={apiInfo?.poolAddress} apiInfo={apiInfo} />
          })}
        </VStack>
      )}
    </>
  )
}
const H5Item = ({ apiInfo }: { apiInfo: PoolApiInfo }) => {
  const { getTokenAmountValue } = useTokenPrice()
  const { coinPriceObj } = useTokenPriceStore()
  console.log('🚀 ~ FarmsTableItem ~ apiInfo:', apiInfo)
  const { currentAccount, onWalletModal } = useAccountStore()

  const [openExpendItemObj, setOpenExpendItemObj] = useState<Record<string, boolean>>({})

  const { farmsPosRewardsDataLoading, farmsPosRewardsData, posBaseListLoading, posBaseListGroupByPool } = usePositionStore()

  // 计算单个池子所有仓位的Earned
  const totalEarned = useMemo(() => {
    if (!currentAccount?.address || !apiInfo?.poolAddress) return '--'
    if (!posBaseListLoading && !farmsPosRewardsDataLoading) {
      // 用posBaseListGroupByPool[apiInfo.poolAddress]?.list遍历一个池子下的所有仓位
      const posBaseList = posBaseListGroupByPool[apiInfo.poolAddress]?.list || []

      // 累加所有仓位的farms奖励
      return posBaseList.reduce((total: any, item: PosBaseInfo) => {
        // 累加单个仓位的所有farms奖励
        const posFarmsData = farmsPosRewardsData[item?.id] || []
        console.log('🚀 ~ returnposBaseList.reduce ~ posFarmsData:', total, posFarmsData)
        const totalAmount = posFarmsData.reduce((sum: any, rewardData: PosReward) => {
          if (sum === '--') return '--'

          const amountValue = getTokenAmountValue(rewardData?.token.coin_type, rewardData?.display_amount_owed, '--')
          return amountValue === '--' ? '--' : d(sum).plus(amountValue).toString()
        }, '0')

        return total === '--' || totalAmount === '--' ? '--' : d(total).plus(totalAmount).toString()
      }, '0')
    }
  }, [posBaseListLoading, farmsPosRewardsData, farmsPosRewardsDataLoading, coinPriceObj, currentAccount?.address])

  const expendList = useMemo(() => {
    const list =
      posBaseListGroupByPool?.[apiInfo?.poolAddress]?.list
        ?.filter(item => item.posType !== 'burn')
        .sort((a: PosBaseInfo, b: PosBaseInfo) => Number(b.liquidity) - Number(a.liquidity)) || []
    console.log('🚀 ~ expendList ~ list:', list)
    return list
  }, [apiInfo?.poolAddress, posBaseListGroupByPool])

  return (
    <VStack gap="16px" w="100%" align="flex-start" bg="bg_fifth" border="1px solid" borderColor="border" p="8px" borderRadius="12px">
      <ValidRangeBlock apiInfo={apiInfo} />
      <LabelValue
        label="Staked TVL"
        value={
          <Text fontWeight="500" textColor="text_caption" textAlign="right">
            {apiInfo?.farmsStatedTvlDisplay}
          </Text>
        }
      />
      <LabelValue label="APR" value={<AprTooltip poolInfo={apiInfo} isPosition={true} />} />
      <LabelValue label="Rewards / day" value={<RewardsBlock apiInfo={apiInfo} />} />
      <LabelValue label="Your Staked" value={<StakedBlock apiInfo={apiInfo} />} />
      <LabelValue
        label="Your Earned"
        value={<TotalEarnedBlock totalEarned={totalEarned} apiInfo={apiInfo} disabled={totalEarned == '--' ? true : d(totalEarned).lte(0)} />}
      />
      <Button
        w="100%"
        h="40px"
        borderRadius="8px"
        variant="ghost"
        onClick={() => {
          if (openExpendItemObj[apiInfo?.poolAddress]) {
            openExpendItemObj[apiInfo?.poolAddress] = false
          } else {
            openExpendItemObj[apiInfo?.poolAddress] = true
          }
          setOpenExpendItemObj({ ...openExpendItemObj })
        }}
        sx={{
          _hover: {
            svg: {
              fill: 'text_caption'
            }
          }
        }}
      >
        <Icon
          svgW="16px"
          xlinkHref="#icon-icon_arrow"
          variant="gray"
          transition="transform 0.5s"
          transform={openExpendItemObj[apiInfo?.poolAddress] ? 'rotate(180deg)' : 'rotate(0deg)'}
        />
      </Button>
      {openExpendItemObj[apiInfo?.poolAddress] && <FarmsExpendBlock expendList={expendList} apiInfo={apiInfo} />}
    </VStack>
  )
}
const LabelValue = ({ label, value }: { label: string; value: ReactNode }) => {
  return (
    <HStack w="100%" justify="space-between">
      <Text>{label}</Text>
      {value}
    </HStack>
  )
}

const FarmsH5Loading = () => {
  return (
    <VStack w="100%" align="flex-start">
      {[{}, {}, {}].map((item, index) => {
        return (
          <VStack
            key={index}
            w="100%"
            align="flex-start"
            gap="16px"
            bg="bg_fifth"
            border="1px solid"
            borderColor="border"
            p="8px"
            borderRadius="12px"
          >
            <HStack gap="0">
              <SkeletonCircle size="9" />
              <SkeletonCircle size="9" />
              <Box w="4px" />
              <Skeleton height="4" width="150px" />
            </HStack>
            <HStack w="100%" gap="4px" ml="4px" justify="space-between">
              <Skeleton height="4" width="120px" />
              <Skeleton height="4" width="120px" />
            </HStack>
            <HStack w="100%" gap="4px" ml="4px" justify="space-between">
              <Skeleton height="4" width="120px" />
              <Skeleton height="4" width="120px" />
            </HStack>
            <HStack w="100%" gap="4px" ml="4px" justify="space-between">
              <Skeleton height="4" width="120px" />
              <Skeleton height="4" width="120px" />
            </HStack>
            <HStack w="100%" gap="4px" ml="4px" justify="space-between">
              <Skeleton height="4" width="120px" />
              <Skeleton height="4" width="120px" />
            </HStack>
          </VStack>
        )
      })}
    </VStack>
  )
}
export default FarmsListH5
