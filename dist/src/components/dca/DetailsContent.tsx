import useDcaStore from '@/store/dca'
import { HTextLabelBox, SingleCoinImage } from '@cetus/ui-kit'
import { addComma, formatNumber, timeFormatUTC } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'
import RangeValue from '../position/clmm/RangeValue'
export type detailsDataType = {
  sellPerOrder: string | number
  estEndDate: string
  platformFee: string
  minPriceValue: string
  maxPriceValue: string
  minPriceResever: string
  maxPriceResever: string
}
interface DetailsContentProps {
  detailsData: detailsDataType
  isConfirm?: boolean
}
export default function DetailsContent({ detailsData, isConfirm = false }: DetailsContentProps) {
  const { sellPerOrder, estEndDate, platformFee, minPriceValue, maxPriceValue, minPriceResever, maxPriceResever } = detailsData
  const { sellCoin, buyCoin, sellTotalAmount, investNum, currentInvest, pageDirect } = useDcaStore()
  return (
    <VStack w="100%" gap={isConfirm ? '20px' : '16px'}>
      <HTextLabelBox
        isLoading={false}
        label="Sell total"
        value={!sellTotalAmount ? `-- ${sellCoin?.symbol}` : `${formatNumber(sellTotalAmount, sellCoin?.decimals)} ${sellCoin?.symbol}`}
        labelStyle={{
          fontSize: '14px'
        }}
        valueStyle={{
          fontSize: '14px'
        }}
        skeletonStyle={{
          valueW: '128px'
        }}
      />
      <HTextLabelBox
        isLoading={false}
        label="Sell per order"
        value={!sellPerOrder ? `-- ${sellCoin?.symbol}` : `${formatNumber(sellPerOrder, sellCoin?.decimals)} ${sellCoin?.symbol}`}
        labelStyle={{
          fontSize: '14px'
        }}
        valueStyle={{
          fontSize: '14px'
        }}
        skeletonStyle={{
          valueW: '128px'
        }}
      />
      {!isConfirm && (
        <HTextLabelBox
          isLoading={false}
          label="Receive"
          value={
            <HStack gap="4px">
              <SingleCoinImage
                imageUrl={buyCoin?.logo_url}
                w="20px"
                h="20px"
                coinType={buyCoin?.coin_type}
                showTagHeight="10px"
                showTagWidth="10px"
              />
              <Text color="text_caption">{buyCoin?.symbol}</Text>
            </HStack>
          }
          labelStyle={{
            fontSize: '14px'
          }}
          valueStyle={{
            fontSize: '14px'
          }}
          skeletonStyle={{
            valueW: '128px'
          }}
        />
      )}
      {isConfirm && (
        <HStack w="100%" justify="space-between">
          <Text textAlign="left" whiteSpace="nowrap">
            Price range
          </Text>
          <RangeValue
            displayTokenA={buyCoin}
            displayTokenB={sellCoin}
            isRank={true}
            justify="flex-end"
            priceInfo={{
              minPrice: addComma(minPriceValue).toString(),
              maxPrice: addComma(maxPriceValue).toString(),
              minPriceResever: addComma(minPriceResever).toString(),
              maxPriceResever: addComma(maxPriceResever).toString()
            }}
            fontSize="14px"
            color="text_caption"
          />
        </HStack>
      )}
      <HTextLabelBox
        isLoading={false}
        label="Invest every"
        value={Number(investNum) > 1 ? `${investNum} ${currentInvest}s` : `${investNum} ${currentInvest}`}
        labelStyle={{
          fontSize: '14px'
        }}
        valueStyle={{
          fontSize: '14px'
        }}
        skeletonStyle={{
          valueW: '128px'
        }}
      />
      {isConfirm && (
        <HTextLabelBox
          isLoading={false}
          label="Start date"
          value={String(timeFormatUTC(Date.now(), 'YMDHM'))}
          labelStyle={{
            fontSize: '14px'
          }}
          valueStyle={{
            fontSize: '14px'
          }}
          skeletonStyle={{
            valueW: '128px'
          }}
        />
      )}
      <HTextLabelBox
        isLoading={false}
        label="Est. end date(UTC)"
        value={estEndDate}
        labelStyle={{
          fontSize: '14px'
        }}
        valueStyle={{
          fontSize: '14px'
        }}
        skeletonStyle={{
          valueW: '128px'
        }}
      />
      <HTextLabelBox
        isLoading={false}
        label="Platform fee"
        value={platformFee}
        labelStyle={{
          fontSize: '14px'
        }}
        valueStyle={{
          fontSize: '14px'
        }}
        skeletonStyle={{
          valueW: '128px'
        }}
      />
    </VStack>
  )
}
