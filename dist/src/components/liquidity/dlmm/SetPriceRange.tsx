import FunnelPrice from '@/components/common/FunnelPrice'
import { DLMM_MAX_BIN_NUMBER } from '@/constant/dlmm'
import { PriceDataType } from '@/hooks/create-pool/useCreateDLMMPool'
import useDlmmAddLiquidityChart from '@/hooks/dlmm/useDlmmAddLiquidityChart'
import { useMinMaxBinIdByAmount, useMinMaxPriceData } from '@/hooks/dlmm/useDlmmHelper'
import useGetDlmmContractPoolInfo from '@/hooks/dlmm/useGetDlmmContractPoolInfo'
import useInitDlmmPoolPriceRange from '@/hooks/dlmm/useInitDlmmPoolPriceRange'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import useDlmmLiquidityStore from '@/store/dlmm'
import useAddDlmmLiquidityStore, { RangePriceType } from '@/store/dlmm/addDlmmLiquidity'
import { getReversePrice } from '@/utils/pool'
import { ErrorTips, SelectTab } from '@cetus/design'
import { Tab } from '@cetus/design/src/components/common/SelectTab'
import useQueryParams from '@cetus/hooks/src/useQueryParams'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { addComma, d, formatPrice, isAvailableObject } from '@cetus/utils'
import { BinUtils } from '@cetusprotocol/dlmm-sdk'
import { Box, Center, Divider, HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import DivisionBlock from '../common/DivisionBlock'
import ControlPriceRange from './ControlPriceRange'
import NumBins from './NumBins'
import PriceRangeForDate from './PriceRangeForDate'
import QuickPriceRange from './QuickPriceRange'
import DlmmRangeChart from './RangeChart'

type SetPriceRangeProps = {
  perText: string
  direct: boolean
  minPriceData: PriceDataType | null
  maxPriceData: PriceDataType | null
  rangeTabList: any[]
  currentRangeTab?: string
  onReverseClick: (item?: Tab) => void
  preCalcLoading?: boolean
}
function SetPriceRange({
  perText,
  direct,
  minPriceData,
  maxPriceData,
  rangeTabList,
  currentRangeTab,
  onReverseClick,
  preCalcLoading
}: SetPriceRangeProps) {
  const { currentPrice, dlmmApiPoolInfo, dlmmContractPoolInfo, isAutoFill, strategy, reverseCurrentPrice } = useDlmmLiquidityStore()
  const { numBins, positionCount, fromToken, binIdRange, setNumBins, setMaxPriceData, setMinPriceData, fromAmount, toAmount } =
    useAddDlmmLiquidityStore()
  const { getDlmmContractPoolInfo } = useGetDlmmContractPoolInfo()
  const { handleInitPriceRange } = useInitDlmmPoolPriceRange()
  const {
    currentLiquidityBins,
    activeId,
    maxBinRangeData,
    handleRangeChange,
    otherPosBinObj,
    maxBinLoading,
    tokenAPrice,
    tokenBPrice,
    tokenAPythPrice,
    tokenBPythPrice,
    calcChartBinsData
  } = useDlmmAddLiquidityChart(direct)

  const { poolId } = useQueryParams()

  const { formatMinMaxBinId } = useMinMaxBinIdByAmount(isAutoFill, fromToken, dlmmApiPoolInfo?.tokenA, fromAmount, toAmount)
  const { formatMinMaxPriceData } = useMinMaxPriceData(dlmmApiPoolInfo?.tokenA, dlmmApiPoolInfo?.tokenB, dlmmContractPoolInfo?.binStep)

  const handleReset = async () => {
    const res = await getDlmmContractPoolInfo(poolId)
    if (res && isAvailableObject(res) && dlmmApiPoolInfo && dlmmApiPoolInfo?.tokenA && dlmmApiPoolInfo?.tokenB) {
      const _currentPrice = BinUtils?.getPriceFromBinId(
        res?.active_id,
        res?.bin_step,
        dlmmApiPoolInfo?.tokenA?.decimals,
        dlmmApiPoolInfo?.tokenB?.decimals
      )

      handleInitPriceRange(res, _currentPrice, true)
    }
  }
  const handleNumBinsBlur = () => {
    if (dlmmApiPoolInfo?.tokenA && dlmmApiPoolInfo?.tokenB && activeId !== undefined) {
      const maxBinRange = binIdRange.maxBinId - binIdRange.minBinId + 1
      if (numBins === '' && maxPriceData?.binId && minPriceData?.binId) {
        setNumBins(Math.abs(maxPriceData?.binId - minPriceData?.binId) + 1)
        return
      }
      let fixNumBins = Number(numBins)
      if (fixNumBins > maxBinRange) {
        fixNumBins = maxBinRange
      }
      const binRes = formatMinMaxBinId(Number(fixNumBins), activeId)

      if (binRes) {
        const { minBinId, maxBinId } = binRes
        let _minBinId = Math.min(Math.max(minBinId, binIdRange?.minBinId), binIdRange?.maxBinId)
        let _maxBinId = Math.min(Math.max(maxBinId, binIdRange?.minBinId), binIdRange?.maxBinId)

        if (_maxBinId === binIdRange?.maxBinId && _minBinId < activeId && _maxBinId - _minBinId < fixNumBins) {
          _minBinId = _maxBinId - fixNumBins + 1
        }
        if (_minBinId === binIdRange?.minBinId && _maxBinId > activeId && _maxBinId - _minBinId < fixNumBins) {
          _maxBinId = _minBinId + fixNumBins - 1
        }

        const priceRes = formatMinMaxPriceData(_minBinId, _maxBinId)
        if (priceRes) {
          const { minPriceData, maxPriceData } = priceRes
          setMinPriceData(minPriceData as RangePriceType)
          setMaxPriceData(maxPriceData as RangePriceType)
        }
      }
    }
  }

  const handleNumBinsChange = (input: string) => {
    console.log(input, /^[1-9][0-9]*$/.test(input), input === '', 'handleNumBinsChange')
    if (input === '--') {
      setNumBins(input)
      return
    }
    if (/^[1-9][0-9]*$/.test(input) || input === '') {
      setNumBins(input)
      return
    }
  }

  const { priceImpactBasedOnMarket } = usePriceImpact(
    direct ? dlmmApiPoolInfo?.tokenA : dlmmApiPoolInfo?.tokenB,
    direct ? dlmmApiPoolInfo?.tokenB : dlmmApiPoolInfo?.tokenA,
    '1',
    direct ? currentPrice : currentPrice ? d(1).div(currentPrice).toString() : undefined,
    true
  )

  const priceImpactBasedOnMarketDisplay = useMemo(() => {
    if (priceImpactBasedOnMarket !== undefined && d(priceImpactBasedOnMarket).abs().gte(30)) {
      if (d(priceImpactBasedOnMarket).gte(30)) {
        return `+${d(priceImpactBasedOnMarket).toFixed(0)}%`
      }
      return `${d(priceImpactBasedOnMarket).toFixed(0)}%`
    }
    return undefined
  }, [priceImpactBasedOnMarket])

  const { isApp } = useWindowWidth()

  return (
    <DivisionBlock
      title={
        <HStack h="20px" w="100%" justify="space-between" gap={isApp ? '8px' : '16px'}>
          <HStack gap={isApp ? '8px' : '16px'}>
            <Text lineHeight="20px" fontSize={{ base: '14px', lg: '16px' }} fontWeight="500" color="text_caption">
              Set Price Range
            </Text>
            <HStack
              as="button"
              gap="2px"
              _hover={{ p: { color: 'text_caption' }, svg: { fill: 'text_caption' } }}
              cursor="pointer"
              onClick={handleReset}
            >
              <Icon xlinkHref="#icon-reset" fontSize="14px" />
              {!isApp && <Text fontSize="12px">Reset</Text>}
            </HStack>
          </HStack>
          {/* {isApp && ( */}
          <SelectTab<any, any>
            type="outlineTab"
            tabList={rangeTabList}
            currentTab={currentRangeTab}
            handleChangeTab={tab => onReverseClick(tab)}
            wrapStyle={{
              // w: '100%',
              h: isApp ? '26px' : '32px',
              p: isApp ? '2px' : '3px',
              border: '1px solid',
              borderColor: 'border',
              borderRadius: { base: '6px', lg: '8px' },
              gap: '4px',
              zIndex: '99'
            }}
            itemStyle={{
              flex: 1,
              h: isApp ? '20px' : '24px',
              p: isApp ? '6px 4px' : '4px 12px',
              borderRadius: '4px',
              gap: '4px',
              sx: isApp
                ? {
                    '& div:first-of-type': {
                      display: 'none'
                    },
                    flexDirection: 'row-reverse',
                    '& p': {
                      fontSize: '10px'
                    }
                  }
                : undefined
            }}
          />
        </HStack>
      }
      wrapStyle={{
        w: '100%',
        gap: isApp ? '12px' : '20px',
        className: 'dlmm-tutorial-step-5',
        p: { base: '0px', lg: '10px 16px 16px' },
        ...(isApp && { bg: 'transparent' })
      }}
      titleStyle={{
        h: isApp ? '20px' : '32px'
      }}
    >
      <Box sx={{ ...(isApp && { display: 'none' }) }} />
      {isApp ? (
        <VStack w="100%" gap="12px">
          <VStack w="100%" align="center" gap="12px">
            <FunnelPrice
              price={currentPrice ? formatPrice(direct ? currentPrice : getReversePrice(currentPrice)) : undefined}
              perText={perText}
              showIcon={false}
              showPriceTooltip
            />

            <DlmmRangeChart
              direct={direct}
              currentLiquidityBins={currentLiquidityBins}
              currentLiquidityBinsLoading={preCalcLoading}
              activeId={activeId}
              maxBinRangeData={maxBinRangeData}
              otherPosBinObj={otherPosBinObj}
              handleRangeChange={handleRangeChange}
              isReverse={dlmmApiPoolInfo?.isReverse || false}
              maxBinLoading={maxBinLoading}
              tokenAPrice={tokenAPrice}
              tokenBPrice={tokenBPrice}
              tokenAPythPrice={tokenAPythPrice}
              tokenBPythPrice={tokenBPythPrice}
              strategy={strategy}
              chartBinsData={calcChartBinsData}
            />
          </VStack>

          <VStack w="100%" gap="8px">
            <QuickPriceRange direct={direct} onNumBinsBlur={handleNumBinsBlur} onNumBinsChange={handleNumBinsChange}>
              <ControlPriceRange
                perText={perText}
                direct={direct}
                lowerPrice={direct ? minPriceData : maxPriceData}
                upperPrice={direct ? maxPriceData : minPriceData}
                wrapStyle={{ gap: '8px' }}
              />
              <NumBins
                isLoading={false}
                numBins={numBins}
                positionCount={positionCount}
                onNumBinsBlur={handleNumBinsBlur}
                onNumBinsChange={handleNumBinsChange}
              />
            </QuickPriceRange>
          </VStack>

          {/* <Divider orientation="horizontal" /> */}
          <PriceRangeForDate activeId={activeId} direct={direct} currentLiquidityBins={currentLiquidityBins} maxBinRangeData={maxBinRangeData} />

          <VStack w="100%" gap="16px">
            {d(numBins).gt(DLMM_MAX_BIN_NUMBER) && (
              <Center p="8px" w="100%" bg="primary_yellow_opacity.10" borderRadius="8px">
                <Text color="primary_yellow" fontSize="12px" lineHeight="16px" fontWeight="400">
                  You have reached the maximum limit of {addComma(DLMM_MAX_BIN_NUMBER)} bins. Please adjust your price range to reduce the number of
                  bins.
                </Text>
              </Center>
            )}
            {minPriceData && maxPriceData && d(minPriceData?.binId).gt(maxPriceData?.binId) && (
              <Center p="8px" w="100%" bg="primary_red_opacity.10" borderRadius="8px" mb="16px">
                <Text color="primary_red" fontSize="12px" h="16px" fontWeight="400">
                  The Max price should be higher than or equal to the Min price
                </Text>
              </Center>
            )}

            <VStack w="100%" mb={isApp ? '0' : '16px'} sx={{ ...(isApp && { mt: '-4px' }) }}>
              <Box w="100%" borderRadius="8px" p="8px" bg="primary_opacity.10">
                <Text color="primary_gray" fontSize="12px" lineHeight="18px">
                  The current pool price of a pool doesn't always reflect the fair market price. Please be cautious to set your price range and
                  allocate liquidity properly.
                </Text>
              </Box>

              {priceImpactBasedOnMarketDisplay && (
                <ErrorTips
                  tips={`The current pool price deviates largely from the real-time market price (${priceImpactBasedOnMarketDisplay}). Please be careful with your price range setting to avoid large impermanent loss.`}
                  borderRadius="12px"
                  p="8px"
                  w="100%"
                  tipsFontSize="12px"
                />
              )}
            </VStack>

            {/* <ErrorTips
              tips={`The current pool price deviates largely from the real-time market price (${priceImpactBasedOnMarketDisplay}). Please be careful with your price range setting to avoid large impermanent loss.`}
              borderRadius="12px"
              p="8px"
              w="100%"
              tipsFontSize="12px"
              mb="16px"
            /> */}
          </VStack>
        </VStack>
      ) : (
        <VStack w="100%" gap="0px">
          <VStack w="100%" gap="12px">
            <HStack w="100%" justify="center">
              <FunnelPrice
                price={currentPrice ? formatPrice(direct ? currentPrice : getReversePrice(currentPrice)) : undefined}
                perText={perText}
                showIcon={false}
                showPriceTooltip
              />
            </HStack>
            <DlmmRangeChart
              direct={direct}
              currentLiquidityBins={currentLiquidityBins}
              currentLiquidityBinsLoading={preCalcLoading}
              activeId={activeId}
              maxBinRangeData={maxBinRangeData}
              otherPosBinObj={otherPosBinObj}
              handleRangeChange={handleRangeChange}
              isReverse={dlmmApiPoolInfo?.isReverse || false}
              maxBinLoading={maxBinLoading}
              tokenAPrice={tokenAPrice}
              tokenBPrice={tokenBPrice}
              tokenAPythPrice={tokenAPythPrice}
              tokenBPythPrice={tokenBPythPrice}
              strategy={strategy}
              chartBinsData={calcChartBinsData}
            />
          </VStack>

          <VStack w="100%" gap="16px">
            <VStack w="100%" gap="4px">
              <HStack w="100%" h="fit-content">
                <ControlPriceRange
                  perText={perText}
                  direct={direct}
                  lowerPrice={direct ? minPriceData : maxPriceData}
                  upperPrice={direct ? maxPriceData : minPriceData}
                  wrapStyle={{ gap: '8px' }}
                />
                <NumBins
                  isLoading={false}
                  numBins={numBins}
                  positionCount={positionCount}
                  onNumBinsBlur={handleNumBinsBlur}
                  onNumBinsChange={handleNumBinsChange}
                />
              </HStack>
              <QuickPriceRange direct={direct} />
            </VStack>

            {minPriceData && maxPriceData && d(minPriceData?.binId).gt(maxPriceData?.binId) && (
              <Center p="8px" w="100%" bg="primary_red_opacity.10" borderRadius="8px">
                <Text color="primary_red" fontSize="12px" h="16px" fontWeight="400">
                  The Max price should be higher than or equal to the Min price
                </Text>
              </Center>
            )}
            {d(numBins).gt(DLMM_MAX_BIN_NUMBER) && (
              <Center p="8px" w="100%" bg="primary_yellow_opacity.10" borderRadius="8px">
                <Text color="primary_yellow" fontSize="12px" lineHeight="16px" fontWeight="400">
                  You have reached the maximum limit of {addComma(DLMM_MAX_BIN_NUMBER)} bins. Please adjust your price range to reduce the number of
                  bins.
                </Text>
              </Center>
            )}
            <VStack w="100%">
              <Text color="primary_gray" fontSize="12px" lineHeight="20px">
                The current pool price of a pool doesn't always reflect the fair market price. Please be cautious to set your price range and allocate
                liquidity properly.
              </Text>
              {priceImpactBasedOnMarketDisplay && (
                <ErrorTips
                  tips={`The current pool price deviates largely from the real-time market price (${priceImpactBasedOnMarketDisplay}). Please be careful with your price range setting to avoid large impermanent loss.`}
                  borderRadius="12px"
                  p="8px"
                  w="100%"
                  tipsFontSize="12px"
                />
              )}
            </VStack>

            <Divider w="100%" orientation="horizontal" />

            <PriceRangeForDate activeId={activeId} direct={direct} currentLiquidityBins={currentLiquidityBins} maxBinRangeData={maxBinRangeData} />
          </VStack>
        </VStack>
      )}
    </DivisionBlock>
  )
}

export default SetPriceRange
