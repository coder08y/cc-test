import useIncentiveStore from '@/store/incentive'
import { AddressCopyLink, Block } from '@cetus/design'
import { baseFeeStepConfig } from '@cetus/design/src/components/common/feeSelect/config'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinPairImage } from '@cetus/ui-kit'
import { textEllipses } from '@cetus/utils'
import { Box, HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import AprTooltip from '../common/aprTooltip'
import RewardsBlock from '../pools/RewardsBlock'

export default function AddIncentive() {
  const { incentiveApiPoolInfo } = useIncentiveStore()
  const { getExplorerUrl } = useExplorer()
  const { isApp } = useWindowWidth()

  const cursorStyle = useMemo(() => {
    if (incentiveApiPoolInfo?.haveFarming || (incentiveApiPoolInfo?.miningAprList && incentiveApiPoolInfo?.miningAprList.length > 0)) {
      return 'help'
    }
    return 'text'
  }, [incentiveApiPoolInfo])
  return (
    <VStack gap={{ base: '8px', lg: '12px' }} w="100%" align="flex-start" bg="#1B1D21" borderRadius="16px" p={{ base: '16px 8px', lg: '32px' }}>
      <Text color="text_caption" fontSize="16px" fontWeight="500">
        Pool Info
      </Text>
      <Block display="flex" alignItems="center" borderRadius="12px" p={{ base: '12px', lg: '12px 16px' }} mt="4px">
        <Skeleton w="100%" isLoaded={!!incentiveApiPoolInfo}>
          <HStack w="100%" justify="space-between">
            <HStack>
              <CoinPairImage
                coinACoinType={incentiveApiPoolInfo?.displayTokenA?.coin_type}
                coinBCoinType={incentiveApiPoolInfo?.displayTokenB?.coin_type}
                coinAIconUrl={incentiveApiPoolInfo?.displayTokenA?.logo_url}
                coinBIconUrl={incentiveApiPoolInfo?.displayTokenB?.logo_url}
                imageStyle={{ w: isApp ? '24px' : '28px', h: isApp ? '24px' : '28px' }}
                imgBoxStyle={{ w: isApp ? '24px' : '28px', h: isApp ? '24px' : '28px' }}
              />
              <VStack align="flex-start" gap="0px">
                {isApp ? (
                  <Text color="text_caption" fontWeight="500" lineHeight={{ base: '16px', lg: '20px' }} whiteSpace="nowrap">
                    {textEllipses(`${incentiveApiPoolInfo?.displayTokenA?.symbol} - ${incentiveApiPoolInfo?.displayTokenB?.symbol}`, 12)}
                  </Text>
                ) : (
                  <Text color="text_caption" fontWeight="500" lineHeight={{ base: '16px', lg: '20px' }} whiteSpace="nowrap">
                    {textEllipses(incentiveApiPoolInfo?.displayTokenA?.symbol, 10)} - {textEllipses(incentiveApiPoolInfo?.displayTokenB?.symbol, 10)}
                  </Text>
                )}

                <AddressCopyLink
                  address={incentiveApiPoolInfo?.poolAddress || ''}
                  onClickLink={() => window.open(getExplorerUrl(incentiveApiPoolInfo?.poolAddress, 'poolAddress'))}
                />
              </VStack>
            </HStack>
            <HStack>
              <Text color="text_caption" fontWeight="500" whiteSpace="nowrap">
                {incentiveApiPoolInfo?.feeDisplay}
              </Text>
              <Box h="12px" w="1px" bg="border" />
              <Text color="text_caption" fontWeight="500" whiteSpace="nowrap">
                {baseFeeStepConfig?.[incentiveApiPoolInfo?.fee]} bps
              </Text>
            </HStack>
          </HStack>
        </Skeleton>
      </Block>
      {(!incentiveApiPoolInfo?.miningRewardList || incentiveApiPoolInfo?.miningRewardList?.length === 0) &&
      (!incentiveApiPoolInfo?.farmsRewarderList || incentiveApiPoolInfo?.farmsRewarderList?.length === 0) ? null : (
        <HStack w="100%" justify="space-between" h="20px" lineHeight="20px">
          <Text>Mining Rewards</Text>
          <Box>
            <RewardsBlock
              miningRewardList={incentiveApiPoolInfo?.miningRewardList}
              farmsRewarderList={incentiveApiPoolInfo?.farmsRewarderList}
              isParent={false}
            />
          </Box>
        </HStack>
      )}

      <HStack w="100%" justify="space-between" h="20px" lineHeight="20px">
        <Text>Pool APR</Text>
        <Box>
          <AprTooltip poolInfo={incentiveApiPoolInfo} placement={isApp ? 'auto-start' : 'bottom'}>
            <HStack justify="flex-end" align="flex-end" gap="4px" lineHeight="14px" h="14px">
              <VStack gap="1px">
                <Text
                  as="span"
                  fontSize="14px"
                  color={cursorStyle == 'help' ? 'primary' : 'text_caption'}
                  fontWeight="500"
                  cursor={cursorStyle}
                  // textUnderlineOffset="2px"
                  // textDecoration={cursorStyle == 'help' ? 'underline dotted' : 'none'}
                >
                  {incentiveApiPoolInfo?.feeAndMiningAprDisplay !== '' ? incentiveApiPoolInfo?.feeAndMiningAprDisplay : '--'}
                </Text>
                {cursorStyle == 'help' && <Box w="100%" borderBottom="1px dotted" borderColor="primary" />}
              </VStack>

              {incentiveApiPoolInfo?.haveFarming && (
                <Text fontSize="12px" lineHeight="12px" h="12px" color="primary" fontWeight="500">
                  +{incentiveApiPoolInfo?.farmingAprDisplay}
                </Text>
              )}
            </HStack>
          </AprTooltip>
        </Box>
      </HStack>
    </VStack>
  )
}
