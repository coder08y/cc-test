import useProStore from '@/store/pro'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { VTextLabelBox } from '@cetus/ui-kit'
import { d } from '@cetus/utils'
import { HStack, Progress, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'

const CoinProgressData = ({ marketData }: { marketData: any }) => {
  const { isApp } = useWindowWidth()
  const { coinMarketDataLoading } = useProStore()

  const buysRatio = useMemo(() => {
    if (marketData?.buys && marketData?.sells) {
      return !Number(marketData?.buys) ? '0' : d(marketData?.buys).div(d(marketData?.buys).plus(marketData?.sells)).mul(100).toString()
    }
    return 0
  }, [marketData?.buys, marketData?.sells])

  const buysVolRatio = useMemo(() => {
    if (marketData?.buyVolume && marketData?.sellVolume) {
      return !Number(marketData?.buyVolume)
        ? '0'
        : d(marketData?.buyVolume).div(d(marketData?.buyVolume).plus(marketData?.sellVolume)).mul(100).toString()
    }
    return 0
  }, [marketData?.buyVolume, marketData?.sellVolume])

  const buyersRatio = useMemo(() => {
    if (marketData?.buyers && marketData?.sellers) {
      return !Number(marketData?.buyers) ? '0' : d(marketData?.buyers).div(d(marketData?.buyers).plus(marketData?.sellers)).mul(100).toString()
    }
    return 0
  }, [marketData?.buyers, marketData?.sellers])

  return (
    <VStack w="100%" align="flex-start" mt="16px" gap="20px">
      <HStack w="100%" align="flex-start" justify="space-between">
        <VTextLabelBox
          wrapStyle={{
            alignItems: 'flex-start',
            w: '40%',
            gap: '8px'
          }}
          titleStyle={{
            color: 'primary_gray'
          }}
          title="Txns"
          value={marketData?.txn}
          isLoading={coinMarketDataLoading}
        />
        <VStack w="60%">
          <HStack w="100%">
            <VTextLabelBox
              wrapStyle={{
                alignItems: 'flex-start',
                w: '50%',
                gap: '8px'
              }}
              titleStyle={{
                color: 'primary_gray'
              }}
              title="Buys"
              value={marketData?.buysDisplay}
              isLoading={coinMarketDataLoading}
            />
            <VTextLabelBox
              wrapStyle={{
                alignItems: 'flex-end',
                w: '50%',
                gap: '8px'
              }}
              titleStyle={{
                color: 'primary_gray'
              }}
              title="Sells"
              value={marketData?.sellsDisplay}
              isLoading={coinMarketDataLoading}
            />
          </HStack>
          <Progress
            h="4px"
            w="100%"
            mt="-4px"
            value={Number(buysRatio)}
            bg={
              coinMarketDataLoading || (Number(marketData?.buys) == 0 && Number(marketData?.sells) == 0)
                ? 'card_bg'
                : Number(marketData?.sells) === 0
                  ? 'primary_green'
                  : 'primary_red'
            }
            sx={{
              'div[role="progressbar"]': {
                bg: 'primary_green'
              }
            }}
          />
        </VStack>
      </HStack>
      <HStack w="100%" align="flex-start" justify="space-between">
        <VTextLabelBox
          wrapStyle={{
            alignItems: 'flex-start',
            w: '40%',
            gap: '8px'
          }}
          titleStyle={{
            color: 'primary_gray'
          }}
          title="Volume"
          value={marketData?.volume}
          isLoading={coinMarketDataLoading}
        />
        <VStack w="60%">
          <HStack w="100%" justify="space-between">
            <VTextLabelBox
              wrapStyle={{
                alignItems: 'flex-start',
                w: '50%',
                gap: '8px'
              }}
              titleStyle={{
                color: 'primary_gray'
              }}
              title="Buy VOL"
              value={marketData?.buyVolumeDisplay}
              isLoading={coinMarketDataLoading}
            />
            <VTextLabelBox
              wrapStyle={{
                alignItems: 'flex-end',
                w: '50%',
                gap: '8px'
              }}
              titleStyle={{
                color: 'primary_gray'
              }}
              title="Sell VOL"
              value={marketData?.sellVolumeDisplay}
              isLoading={coinMarketDataLoading}
            />
          </HStack>
          <Progress
            h="4px"
            w="100%"
            mt="-4px"
            value={Number(buysVolRatio)}
            bg={
              coinMarketDataLoading || (Number(marketData?.buyVolume) === 0 && Number(marketData?.sellVolume) === 0)
                ? 'card_bg'
                : Number(marketData?.sellVolume) === 0
                  ? 'primary_green'
                  : 'primary_red'
            }
            sx={{
              'div[role="progressbar"]': {
                bg: 'primary_green'
              }
            }}
          />
        </VStack>
      </HStack>
      <HStack w="100%" align="flex-start" justify="space-between">
        <VTextLabelBox
          wrapStyle={{
            alignItems: 'flex-start',
            w: '40%',
            gap: '8px'
          }}
          titleStyle={{
            color: 'primary_gray'
          }}
          title="Makers"
          value={marketData?.markers}
          isLoading={coinMarketDataLoading}
        />
        <VStack w="60%">
          <HStack w="100%">
            <VTextLabelBox
              wrapStyle={{
                alignItems: 'flex-start',
                w: '50%',
                gap: '8px'
              }}
              titleStyle={{
                color: 'primary_gray'
              }}
              title="Buyers"
              value={marketData?.buyersDisplay}
              isLoading={coinMarketDataLoading}
            />
            <VTextLabelBox
              wrapStyle={{
                alignItems: 'flex-end',
                w: '50%',
                gap: '8px'
              }}
              titleStyle={{
                color: 'primary_gray'
              }}
              title="Sellers"
              value={marketData?.sellersDisplay}
              isLoading={coinMarketDataLoading}
            />
          </HStack>
          <Progress
            h="4px"
            w="100%"
            mt="-4px"
            value={Number(buyersRatio)}
            bg={
              coinMarketDataLoading || (Number(marketData?.buyers) === 0 && Number(marketData?.sellers) === 0)
                ? 'card_bg'
                : Number(marketData?.sellers) === 0
                  ? 'primary_green'
                  : 'primary_red'
            }
            sx={{
              'div[role="progressbar"]': {
                bg: 'primary_green'
              }
            }}
          />
        </VStack>
      </HStack>
    </VStack>
  )
}

export default CoinProgressData
