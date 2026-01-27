import useGlobalStore from '@/store/common/global'
import usePositionStore from '@/store/position'
import { PoolApiInfo, PosBaseInfo, PosReward } from '@/types'
import { Block } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import useTokenPriceStore from '@cetus/stores/src/tokenPrice'
import { NoData } from '@cetus/ui-kit'
import { d } from '@cetusprotocol/common-sdk'
import { Button, Center, Td, Text, Tr, VStack } from '@chakra-ui/react'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AprTooltip from '../common/aprTooltip'
import { ExpendItem } from './ExpendItem'
import { RewardsBlock } from './RewardsBlock'
import { StakedBlock } from './StakedBlock'
import { TableActions } from './TableActions'
import { TotalEarnedBlock } from './TotalEarnedBlock'
import { ValidRangeBlock } from './ValidRangeBlock'

type FarmsTableItemProps = {
  apiInfo: PoolApiInfo
}

export function FarmsTableItem({ apiInfo }: FarmsTableItemProps) {
  const navigate = useNavigate()
  const { getTokenAmountValue } = useTokenPrice()
  const { coinPriceObj } = useTokenPriceStore()
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
    <React.Fragment key={apiInfo?.poolAddress}>
      <Tr
        cursor="pointer"
        onClick={() => {
          if (openExpendItemObj[apiInfo?.poolAddress]) {
            openExpendItemObj[apiInfo?.poolAddress] = false
          } else {
            openExpendItemObj[apiInfo?.poolAddress] = true
          }
          setOpenExpendItemObj({ ...openExpendItemObj })
        }}
        sx={{
          td: {
            pb: openExpendItemObj[apiInfo?.poolAddress] ? '20px !important' : '16px !important'
          }
        }}
      >
        <Td w="30%">
          <ValidRangeBlock apiInfo={apiInfo} />
        </Td>
        <Td textAlign="right">
          <Text fontWeight="500" textColor="text_caption" textAlign="right">
            {apiInfo?.farmsStatedTvlDisplay}
          </Text>
        </Td>
        <Td textAlign="right">
          <AprTooltip poolInfo={apiInfo} isPosition={true} />
        </Td>
        <Td textAlign="right">
          <RewardsBlock apiInfo={apiInfo} />
        </Td>
        <Td textAlign="right">
          <StakedBlock apiInfo={apiInfo} />
        </Td>
        <Td textAlign="right">
          <TotalEarnedBlock totalEarned={totalEarned} apiInfo={apiInfo} disabled={totalEarned == '--' ? true : d(totalEarned).lte(0)} />
        </Td>

        <Td textAlign="right">
          <TableActions
            isOpen={openExpendItemObj[apiInfo?.poolAddress]}
            apiInfo={apiInfo}
            disabled={totalEarned == '--' ? true : d(totalEarned).lte(0)}
          />
        </Td>
      </Tr>

      {!openExpendItemObj[apiInfo?.poolAddress] && <Tr h="16px" />}

      <Tr
        position="relative"
        top="-20px"
        left="0px"
        sx={{
          td: {
            p: '0 !important',
            bg: 'transparent !important',
            border: 'none !important',
            _first: {
              borderRadius: ' 16px !important'
            },
            _last: {
              borderRadius: '0 0 16px 0 !important'
            }
          },
          _hover: {
            bg: 'transparent !important',
            td: {
              bg: 'transparent !important'
            }
          }
        }}
      >
        {openExpendItemObj[apiInfo?.poolAddress] && (
          <Td colSpan={7}>
            <FarmsExpendBlock expendList={expendList} apiInfo={apiInfo} />
          </Td>
        )}
      </Tr>
    </React.Fragment>
  )
}
export const FarmsExpendBlock = ({ expendList, apiInfo }: { expendList: any; apiInfo: PoolApiInfo }) => {
  const navigate = useNavigate()
  const { currentAccount, onWalletModal } = useAccountStore()
  const { setBackUrl } = useGlobalStore()
  return (
    <Block
      overflow="hidden"
      bg={{ base: 'bg_fifth', lg: 'bg_secondary' }}
      p={{ base: '0px', lg: '16px' }}
      borderTop={{ lg: 'none' }}
      borderRadius={{ base: '8px', lg: ' 0 0 16px 16px ' }}
    >
      <VStack overflow="auto" h={currentAccount?.address && expendList && expendList?.length > 2 ? '250px' : 'unset'}>
        {!currentAccount?.address ? (
          <NoData
            type="nowallet"
            onboard={() => {
              onWalletModal(true)
            }}
          />
        ) : expendList?.length == 0 ? (
          <NoData
            type="nodata"
            text="No Position Found"
            p={{ base: '16px', lg: '20px' }}
            border={{ base: 'none', lg: '1px solid' }}
            borderColor="border !important"
            borderRadius={{ base: '8px', lg: '12px' }}
            children={
              <VStack gap="4px" mt="-4px">
                <Text fontSize="12px" w={{ base: '100%', lg: '380px' }} lineHeight={{ base: '16px', lg: 'unset' }} textAlign="center">
                  Stake liquidity position to earn farming rewards. To get the position for this pool, you should provide liquidity to this pool
                  first.
                </Text>
                <Button
                  borderRadius="8px"
                  mt="8px"
                  fontWeight="500"
                  w="120px"
                  h="36px"
                  fontSize="12px"
                  onClick={() => {
                    setBackUrl('/farms')
                    navigate(`/clmm?poolAddress=${apiInfo?.poolAddress}`)
                  }}
                >
                  Create a Position
                </Button>
              </VStack>
            }
          />
        ) : (
          expendList?.map((item: any, index: number) => {
            console.log('🚀 ~ expendList.map ~ item:', item)
            return (
              <React.Fragment key={index}>
                <ExpendItem positionInfo={item} apiInfo={apiInfo} />
              </React.Fragment>
            )
          })
        )}
      </VStack>
      {expendList?.length > 0 && currentAccount?.address && (
        <Center pb={{ base: '12px', lg: '0' }}>
          <Button
            mt={{ base: '12px', lg: '16px' }}
            fontSize="14px"
            onClick={e => {
              setBackUrl('/farms')
              navigate(`/clmm?poolAddress=${apiInfo?.poolAddress}`)
            }}
            h="32px"
            p="0 16px"
            borderRadius="8px"
            variant="outline"
          >
            + Create a position
          </Button>
        </Center>
      )}
    </Block>
  )
}
