import { CetusTooltip } from '@cetus/design'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { SingleCoinImage } from '@cetus/ui-kit'
import { d, fixRounding, formatNumber, fromDecimalsAmountFix, textEllipses } from '@cetus/utils'
import { Box, Center, HStack, Text } from '@chakra-ui/react'
import { useEffect, useState } from 'react'

function RewardsBlock({
  miningRewardList,
  farmsRewarderList,
  isParent,
  showRate,
  showTips = true
}: {
  miningRewardList: any
  farmsRewarderList: any
  isParent?: boolean
  showRate?: boolean
  showTips?: boolean
}) {
  const { getTokenListInfo } = useGetToken()
  const { isApp } = useWindowWidth()
  const [rewardsList, setRewardsList] = useState<any>([])
  const [rewardsListOrigin, setRewardsListOrigin] = useState<any>([])

  useEffect(() => {
    const fetchData = async () => {
      if (miningRewardList?.length > 0 || farmsRewarderList?.length > 0) {
        try {
          let miningList: any = []
          let farmingList: any = []
          if (miningRewardList?.length > 0) {
            const coinTypeList = miningRewardList?.map((item: any) => item?.coinType)
            const tokenMap = await getTokenListInfo(coinTypeList)
            miningList = miningRewardList.map((item: any) => {
              const tokenInfo = tokenMap?.get(item?.coinType)
              return { ...item, tokenInfo, isMining: true }
            })
          }
          if (farmsRewarderList?.length > 0) {
            const coinTypeList = farmsRewarderList?.map((item: any) => item?.coinType)
            const tokenMap = await getTokenListInfo(coinTypeList)
            farmingList = farmsRewarderList.map((item: any) => {
              const tokenInfo = tokenMap?.get(item?.coinType)
              return { ...item, tokenInfo, isFarming: true }
            })
          }
          setRewardsList(miningList.concat(farmingList).splice(0, 5))
          setRewardsListOrigin(miningList.concat(farmingList))
        } catch (error) {
          console.error('Error processing list:', error)
        }
      }
    }

    fetchData()
  }, [miningRewardList, farmsRewarderList])

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null) // 记录当前hover的 token 索引

  return (
    <HStack w="100%" justify="flex-end" gap="0px">
      {rewardsList?.map((item: any, index: number) => {
        // 2.hoveredIndex == rewardsList?.length - 1 其他token(hoveredIndex > index)都左移14px
        const shouldMoveLeft10 =
          (hoveredIndex == index && hoveredIndex !== rewardsList?.length - 1) || (hoveredIndex == rewardsList?.length - 1 && hoveredIndex > index)
        const shouldMoveLeft20 = hoveredIndex !== null && hoveredIndex !== rewardsList?.length - 1 && index <= hoveredIndex
        return (
          <Box
            key={item?.coinType}
            onClick={(e: any) => e.stopPropagation()}
            w={isApp ? '16px' : '24px'}
            h={isApp ? '16px' : '24px'}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            sx={{
              display: 'flex',
              ml: isApp ? '2px' : '-10px',
              transform: shouldMoveLeft10 ? 'translateX(-10px)' : shouldMoveLeft20 ? 'translateX(-20px)' : 'translateX(0)',
              transition: 'transform 0.3s ease',
              willChange: 'transform'
            }}
          >
            {showTips ? (
              <CetusTooltip
                key={item?.coinType}
                placement="top"
                tooltip={
                  <>
                    {isParent && !showRate ? (
                      <Text color="text_caption" fontSize="12px" display="inline-block">
                        {textEllipses(item?.tokenInfo?.symbol)}
                      </Text>
                    ) : (
                      <HStack gap="4px">
                        <Box>
                          <SingleCoinImage
                            showTagHeight="10px"
                            showTagWidth="10px"
                            coinType={item?.tokenInfo?.coin_type}
                            imageUrl={item?.tokenInfo?.logo_url}
                            w="24px"
                            h="24px"
                          />
                        </Box>
                        {item?.isMining && (
                          <Text color="primary" display="inline-block">
                            {/* 处理精度后向上取整展示位隔符 */}
                            {formatNumber(fixRounding(fromDecimalsAmountFix(item?.emissionsEveryDay, item?.tokenInfo?.decimals), 2))}{' '}
                            {textEllipses(item?.tokenInfo?.symbol, 8)} per day in Mining
                          </Text>
                        )}
                        {item?.isFarming && (
                          <Text color="primary" display="inline-block">
                            {/* 处理精度后向上取整展示位隔符 */}
                            {formatNumber(fixRounding(item?.emissionsEveryDay, 2))} {textEllipses(item?.tokenInfo?.symbol, 8)} per day in Farming
                          </Text>
                        )}
                      </HStack>
                    )}
                  </>
                }
              >
                <Center as="button">
                  <SingleCoinImage
                    showTagHeight="10px"
                    showTagWidth="10px"
                    coinType={item?.tokenInfo?.coin_type}
                    imageUrl={item?.tokenInfo?.logo_url}
                    w={isApp ? '16px' : '20px'}
                    h={isApp ? '16px' : '20px'}
                  />
                </Center>
              </CetusTooltip>
            ) : (
              <Center as="button">
                <SingleCoinImage
                  showTagHeight="10px"
                  showTagWidth="10px"
                  coinType={item?.tokenInfo?.coin_type}
                  imageUrl={item?.tokenInfo?.logo_url}
                  w={isApp ? '16px' : '20px'}
                  h={isApp ? '16px' : '20px'}
                />
              </Center>
            )}
          </Box>
        )
      })}
      {rewardsListOrigin?.length > 5 && <Text color="text_caption">+{d(rewardsListOrigin?.length).minus(5).toString()}</Text>}
    </HStack>
  )
}
export default RewardsBlock
