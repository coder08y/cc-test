import { DeepBookPoolMarginTabs } from '@/types/deepbook'
import { HTextLabelBox } from '@cetus/ui-kit'
import { Decimal, formatNumber, formatNumberWithKMB } from '@cetus/utils'
import { Box, HStack, Text } from '@chakra-ui/react'
import InputBlockGroup, { InputBlockProps } from '../InputBlockGroup'
// import FeeBlock from '../Trade/FeeBlock'
import PostOnlyBlock from '../Trade/PostOnlyBlock'

interface MarginTradeReduceOnlyBlockProps {
  reduceOnlyFrom: InputBlockProps
  reduceOnlyTo: InputBlockProps
  isShowOrderVolumeError: boolean
  currentDeepBookPool: any
  orderType: 'Market' | 'Limit'
  reduceOnlyAvailable: string
  tradeType: DeepBookPoolMarginTabs
  price: string
  reduceOnlyMaxFee: string
  reduceOnlyTotal: string | undefined
  reduceOnlyEstTotalUsd?: string
  reduceOnlyPostOnly: boolean
  setReduceOnlyPostOnly: (postOnly: boolean) => void
  reduceOnlyTimeInForce: 'GTC' | 'IOC' | 'FOK'
  setReduceOnlyTimeInForce: (tif: 'GTC' | 'IOC' | 'FOK') => void
  reduceOnlyTakerFeeDisplay: string
  reduceOnlyMakerFeeDisplay: string
  reduceOnlyFeeType: string
  reduceOnlyMaxFeeIsLoading: boolean
  reduceOnlyPayWithDeep: boolean
  setReduceOnlyPayWithDeep: (payWithDeep: boolean) => void
}

export default function MarginTradeReduceOnlyBlock({
  reduceOnlyFrom,
  reduceOnlyTo,
  isShowOrderVolumeError,
  currentDeepBookPool,
  orderType,
  reduceOnlyAvailable,
  tradeType,
  price,
  reduceOnlyMaxFee,
  reduceOnlyTotal,
  reduceOnlyEstTotalUsd,
  reduceOnlyPostOnly,
  setReduceOnlyPostOnly,
  reduceOnlyTimeInForce,
  setReduceOnlyTimeInForce,
  reduceOnlyTakerFeeDisplay,
  reduceOnlyMakerFeeDisplay,
  reduceOnlyFeeType,
  reduceOnlyMaxFeeIsLoading,
  reduceOnlyPayWithDeep,
  setReduceOnlyPayWithDeep
}: MarginTradeReduceOnlyBlockProps) {
  return (
    <>
      <InputBlockGroup
        from={reduceOnlyFrom}
        to={reduceOnlyTo}
        isShowOrderVolumeError={isShowOrderVolumeError}
        minSize={currentDeepBookPool?.minSize}
        isMarket={orderType === 'Market'}
        maxAvailable={reduceOnlyAvailable || '0'}
        tradeType={tradeType === DeepBookPoolMarginTabs.Long ? 'Buy' : 'Sell'}
        price={price}
        maxFee={reduceOnlyMaxFee}
        tradeAssetCoinType={
          tradeType === DeepBookPoolMarginTabs.Long ? currentDeepBookPool?.base?.coin_type : currentDeepBookPool?.baseAssets?.coin_type
        }
      />
      <Box w="100%" border="1px solid" borderColor="border" borderRadius="8px" p="12px">
        {/* Market 模式：只读显示 */}
        {orderType === 'Market' && (
          <HTextLabelBox
            label={'Total'}
            value={
              !reduceOnlyTotal || reduceOnlyTotal === '--' ? (
                <Text color="text_caption">--</Text>
              ) : (
                <HStack whiteSpace="nowrap" w="100%">
                  <Text fontSize={'14px'} color="text_caption">
                    {formatNumber(reduceOnlyTotal)} {currentDeepBookPool?.quoteAssets?.symbol}
                  </Text>
                  {reduceOnlyEstTotalUsd && <Text fontSize={'14px'}>≈ ${formatNumberWithKMB(reduceOnlyEstTotalUsd)}</Text>}
                </HStack>
              )
            }
            labelStyle={{ fontSize: '14px' }}
            valueStyle={{ fontSize: '14px', maxW: '100%' }}
            wrapStyle={{ h: '20px', lineHeight: '20px' }}
          />
        )}
        {/* Limit 模式：可输入的 Est.Value */}
        {orderType === 'Limit' && (
          <HStack w="100%" h="20px" lineHeight="20px" justifyContent="space-between" alignItems="center">
            <Text fontSize="14px" color="text_paragraph">
              Total
            </Text>
            <HStack gap="4px" flex="1" justifyContent="flex-end" alignItems="center">
              {reduceOnlyTotal && reduceOnlyTotal !== '--' ? (
                <>
                  <Text fontSize="14px" color="text_caption" whiteSpace="nowrap">
                    {formatNumber(reduceOnlyTotal)} {currentDeepBookPool?.quoteAssets?.symbol}
                  </Text>
                  {reduceOnlyEstTotalUsd && (
                    <Text fontSize="14px" color="text_paragraph" whiteSpace="nowrap">
                      ≈ ${formatNumberWithKMB(reduceOnlyEstTotalUsd)}
                    </Text>
                  )}
                </>
              ) : (
                <Text fontSize="14px" color="text_caption" whiteSpace="nowrap">
                  --
                </Text>
              )}
            </HStack>
          </HStack>
        )}
      </Box>
      {orderType === 'Limit' && (
        <PostOnlyBlock
          postOnly={reduceOnlyPostOnly}
          setPostOnly={setReduceOnlyPostOnly}
          timeInForce={reduceOnlyTimeInForce}
          setTimeInForce={setReduceOnlyTimeInForce}
        />
      )}
      <HTextLabelBox
        label={<Text fontSize={'12px'}>Available</Text>}
        value={
          <Text
            fontSize={'12px'}
            color={'text_caption'}
          >{`${formatNumber(reduceOnlyAvailable, undefined, undefined, Decimal.ROUND_DOWN)} ${tradeType === DeepBookPoolMarginTabs.Long ? currentDeepBookPool?.quoteAssets?.symbol : currentDeepBookPool?.baseAssets?.symbol}`}</Text>
        }
        labelStyle={{ fontSize: '14px' }}
        valueStyle={{ fontSize: '14px' }}
        wrapStyle={{ h: '14px', lineHeight: '14px' }}
      />
      {/* <FeeBlock
        currentDeepBookPool={currentDeepBookPool}
        tradeType={tradeType}
        takerFeeDisplay={reduceOnlyTakerFeeDisplay}
        makerFeeDisplay={reduceOnlyMakerFeeDisplay}
        feeType={reduceOnlyFeeType}
        maxFeeIsLoading={reduceOnlyMaxFeeIsLoading}
        payWithDeep={reduceOnlyPayWithDeep}
        setPayWithDeep={setReduceOnlyPayWithDeep}
      /> */}
      {/* Debt Repay字段 */}
      <HTextLabelBox
        label={<Text fontSize={'12px'}>Debt Repay</Text>}
        value={
          !reduceOnlyTotal || reduceOnlyTotal === '--' || !reduceOnlyEstTotalUsd ? (
            <Text fontSize="12px" color="text_caption">
              --
            </Text>
          ) : (
            <Text fontSize="12px" color="text_caption">
              ${formatNumberWithKMB(reduceOnlyEstTotalUsd)}
            </Text>
          )
        }
        labelStyle={{ fontSize: '12px' }}
        valueStyle={{ fontSize: '12px' }}
        wrapStyle={{ h: '14px', lineHeight: '14px' }}
      />
    </>
  )
}
