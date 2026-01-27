import usePoolInfo from '@/hooks/common/usePoolInfo'
import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore from '@/store/dlmm/addDlmmLiquidity'
import useTvlInfoStore from '@/store/dlmm/dlmmTvl'
import { AddressCopyLink, CetusTooltip } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { d, formatNumber, textEllipses } from '@cetus/utils'
import { FEE_PRECISION, FeeUtils, MAX_FEE_RATE } from '@cetusprotocol/dlmm-sdk'
import { Box, Grid, HStack, Heading, Progress, Skeleton, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import InfoItem from '../../common/InfoItem'
import TokenCard from '../../common/TokenCard'

const getRatio = (value: string) => {
  if (value === '--') return '--'
  return `${value}%`
}

function PoolInfo() {
  const { dlmmApiPoolInfo, dlmmContractPoolInfo } = useDlmmLiquidityStore()
  const { fromToken, toToken } = useAddDlmmLiquidityStore()
  const { getExplorerUrl } = useExplorer()
  const { poolId } = useQueryParams()
  const { tokenAAmount, tokenBAmount, tokenAAmountUSD, tokenBAmountUSD, totalAmountUSD, tvlLoading } = useTvlInfoStore()
  const { tokenARatio, tokenBRatio } = usePoolInfo(tokenAAmountUSD, totalAmountUSD)
  const maxFee = `${d(MAX_FEE_RATE).div(FEE_PRECISION).mul(100)}%`

  const variableFee = useMemo(() => {
    if (!dlmmContractPoolInfo?.variable_parameters) return undefined
    const _variableFee = FeeUtils.getVariableFee(dlmmContractPoolInfo?.variable_parameters)
    if (d(_variableFee).gt(MAX_FEE_RATE)) {
      return d(MAX_FEE_RATE).div(FEE_PRECISION).toString()
    }
    return d(_variableFee).div(FEE_PRECISION).toString()
  }, [dlmmContractPoolInfo?.variable_parameters])

  const dynamicFee = useMemo(() => {
    if (!variableFee) return undefined
    const _dynamicFee = d(dlmmApiPoolInfo?.fee ?? d(dlmmApiPoolInfo?.feeDisplay?.replace('%', '')).div(100).toNumber())
      .plus(d(variableFee))
      .toString()

    const maxFeeRate = d(MAX_FEE_RATE).div(FEE_PRECISION).toString()

    if (d(_dynamicFee).gt(maxFeeRate)) {
      return maxFeeRate
    }
    return _dynamicFee
  }, [dlmmApiPoolInfo?.fee, variableFee])

  const protocolFee = useMemo(() => {
    if (!variableFee || !dlmmApiPoolInfo?.protocolFeeRate) return '--'

    return (
      d(dlmmApiPoolInfo.protocolFeeRate as any)
        .mul(100)
        .toString() + '%'
    )
  }, [dynamicFee, dlmmApiPoolInfo?.protocolFeeRate])

  const { isApp } = useWindowWidth()
  return (
    <VStack
      w={{ base: '100%', lg: '482px' }}
      gap={{ base: '40px', lg: '40px' }}
      p={{ base: '0 12px', lg: '20px 16px' }}
      borderRadius="16px"
      border="1px solid"
      borderColor={isApp ? 'transparent' : 'border'}
      bg={isApp ? 'transparent' : 'bg_secondary'}
      minW={{ base: '100%', lg: '482px' }}
      maxW={{ base: '100%', lg: '482px' }}
    >
      <VStack gap={isApp ? '4px' : '20px'} w="100%">
        <HStack w="100%" justify="space-between">
          <Heading
            fontSize={{ base: '14px', lg: '16px' }}
            lineHeight={{ base: '14px', lg: '1' }}
            mb={{ base: '12px', lg: '0' }}
            fontWeight={isApp ? '500' : '400'}
          >
            Pool Info
          </Heading>
        </HStack>
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', lg: 'repeat(2, 1fr)' }} w="100%" gap={isApp ? '4px' : '12px'}>
          <InfoItem
            label="Address"
            wrapStyle={{ gridColumn: { base: '1', lg: 'span 2' }, h: { base: '20px', lg: '34px' } }}
            value={
              <AddressCopyLink
                address={poolId || ''}
                fontSize={isApp ? '12px' : '14px'}
                color="text_caption"
                onClickLink={() => window.open(getExplorerUrl(poolId, 'poolAddress'))}
                wrapStyle={{ gap: '6px' }}
                iconGap="6px"
              />
            }
          />
          <InfoItem label="Pool ID" value={dlmmContractPoolInfo?.index !== undefined ? `#${dlmmContractPoolInfo?.index + 1}` : '--'} />
          <InfoItem label="Bin Step" value={dlmmContractPoolInfo?.binStep || '--'} />

          <InfoItem label="Base Fee" value={dlmmApiPoolInfo?.feeDisplay ? dlmmApiPoolInfo?.feeDisplay : '--'} />
          <InfoItem
            label={
              <CetusTooltip tooltip={<Text fontSize="12px">The hard cap of the total dynamic fee of this pool</Text>}>
                <HStack gap="2px" _hover={{ svg: { fill: 'text_caption' } }}>
                  <Text fontSize={isApp ? '12px' : '14px'}>Max Fee</Text>
                  <Icon xlinkHref="#icon-icon_tips" fontSize={isApp ? '14px' : '18px'} />
                </HStack>
              </CetusTooltip>
            }
            value={maxFee}
          />

          <InfoItem
            label={
              <CetusTooltip tooltip={<Text fontSize="12px">Base fee + real-time variable fee</Text>}>
                <HStack gap="2px" _hover={{ svg: { fill: 'text_caption' } }}>
                  <Text fontSize={isApp ? '12px' : '14px'}>Total Dynamic Fee</Text>
                  <Icon xlinkHref="#icon-icon_tips" fontSize={isApp ? '14px' : '18px'} />
                </HStack>
              </CetusTooltip>
            }
            value={dynamicFee ? formatNumber(d(dynamicFee).mul(100).toString(), 7) + '%' : '--'}
            wrapStyle={{ gridColumn: { base: '1', lg: 'span 2' } }}
          />
        </Grid>
      </VStack>
      <VStack gap={isApp ? '8px' : '20px'} w="100%">
        <HStack justify="flex-start" w="100%">
          <Heading fontSize={isApp ? '14px' : '16px'} fontWeight={isApp ? '500' : '400'}>
            Pool Composition
          </Heading>
        </HStack>
        <VStack gap={isApp ? '12px' : '16px'} w="100%">
          <HStack w="100%" justify="space-between" gap={isApp ? '20px' : '8px'}>
            <HStack gap={isApp ? '4px' : '12px'}>
              <SingleCoinImage
                showTagWidth={isApp ? '12px' : '16px'}
                showTagHeight={isApp ? '12px' : '16px'}
                imageUrl={fromToken?.logo_url}
                w={isApp ? '20px' : '28px'}
                h={isApp ? '20px' : '28px'}
                coinType={fromToken ? fromToken?.coin_type : ''}
              />
              <VStack align="flex-start" gap={isApp ? '2px' : '4px'}>
                <Text fontSize={isApp ? '12px' : '16px'} fontWeight={isApp ? '400' : '500'} color="text_caption">
                  {textEllipses(fromToken?.symbol, 10)}
                </Text>
                {tvlLoading ? (
                  <Skeleton h="12px" w="46px" />
                ) : (
                  <Text
                    fontSize={isApp ? '10px' : '12px'}
                    // color={dlmmApiPoolInfo?.isReverse ? 'primary' : 'dlmm_green'}
                    fontWeight={isApp ? '400' : '500'}
                  >
                    {dlmmApiPoolInfo?.isReverse ? getRatio(tokenBRatio) : getRatio(tokenARatio)}
                  </Text>
                )}
              </VStack>
            </HStack>
            <Box w="200px">
              <Progress
                value={Number(dlmmApiPoolInfo?.isReverse ? tokenBRatio : tokenARatio)}
                size="xs"
                h="4px"
                borderRadius="4px"
                bg={[tokenARatio, tokenBRatio].includes('--') ? 'border' : 'quote_green'}
                sx={{
                  'div[role="progressbar"]': {
                    bg: [tokenARatio, tokenBRatio].includes('--') ? 'background' : 'primary'
                  }
                }}
              />
            </Box>
            <HStack gap={isApp ? '4px' : '12px'}>
              <VStack align="flex-end" gap={isApp ? '2px' : '4px'}>
                <Text fontSize={isApp ? '12px' : '16px'} fontWeight={isApp ? '400' : '500'} color="text_caption">
                  {textEllipses(toToken?.symbol, 10)}
                </Text>
                {tvlLoading ? (
                  <Skeleton h="12px" w="46px" />
                ) : (
                  <Text
                    fontSize={isApp ? '10px' : '12px'}
                    // color={dlmmApiPoolInfo?.isReverse ? 'dlmm_green' : 'dlmm_blue'}
                    fontWeight={isApp ? '400' : '500'}
                  >
                    {dlmmApiPoolInfo?.isReverse ? getRatio(tokenARatio) : getRatio(tokenBRatio)}
                  </Text>
                )}
              </VStack>
              <SingleCoinImage
                showTagWidth={isApp ? '12px' : '16px'}
                showTagHeight={isApp ? '12px' : '16px'}
                imageUrl={toToken?.logo_url}
                w={isApp ? '20px' : '28px'}
                h={isApp ? '20px' : '28px'}
                coinType={toToken ? toToken?.coin_type : ''}
              />
            </HStack>
          </HStack>
          <VStack w="100%" flexDir={dlmmApiPoolInfo?.isReverse ? 'column-reverse' : 'column'} gap={isApp ? '12px' : '16px'}>
            <TokenCard loading={tvlLoading} token={dlmmApiPoolInfo?.tokenA} amount={tokenAAmount} amountUSD={tokenAAmountUSD} />
            <TokenCard loading={tvlLoading} token={dlmmApiPoolInfo?.tokenB} amount={tokenBAmount} amountUSD={tokenBAmountUSD} />
          </VStack>
        </VStack>
      </VStack>
    </VStack>
  )
}

export default PoolInfo
