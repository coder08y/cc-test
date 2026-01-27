// import TradingViewChart from '@/components/tradingViewChart'
import { formatCurrencyWithKMB, formatPriceWithSigFigs, formatUSDPrice } from '@cetus/utils'
import { Text, VStack } from '@chakra-ui/react'
import React from 'react'

const App: React.FC = () => {
  return (
    <VStack align="flex-start" gap="12px">
      <Text fontSize="16px" color="#fff">
        0 --------------- {formatUSDPrice(0)}
      </Text>
      <Text fontSize="16px" color="#fff">
        0.111844 --------------- {formatPriceWithSigFigs(0.111844, 0.111844)}
      </Text>
      <Text fontSize="16px" color="#fff">
        0.000001234333333 --------------- {formatUSDPrice(0.0000012343333333)}
      </Text>
      <Text fontSize="16px" color="#fff">
        0.10000000001234565656 --------------- {formatUSDPrice(0.10000000001234565656)}
      </Text>
      <Text fontSize="16px" color="#fff">
        0.00000000004123 --------------- {formatUSDPrice(0.00000000004123)}
      </Text>
      <Text fontSize="16px" color="#fff">
        1.000000000000000123 --------------- {formatUSDPrice(1.000000000000000123)}
      </Text>
      <Text fontSize="16px" color="#fff">
        1.000012 --------------- {formatUSDPrice(1.000012)}
      </Text>
      <Text fontSize="16px" color="#fff">
        2.000012 --------------- {formatUSDPrice(2.000012)}
      </Text>
      <Text fontSize="16px" color="#fff">
        10.000012 --------------- {formatUSDPrice(10.000012)}
      </Text>
      <Text fontSize="16px" color="#fff">
        100032.00123 --------------- {formatUSDPrice(100032.00123)}
      </Text>
      <Text fontSize="16px" color="#fff">
        100032.123213 --------------- {formatUSDPrice(100032.123213)}
      </Text>
      <Text>##########################################################</Text>
      <Text fontSize="16px" color="#fff">
        0.0009 --------------- {formatPriceWithSigFigs(0.0009, 0.0009)}
      </Text>
      <Text fontSize="16px" color="#fff">
        0.0001 --------------- {formatPriceWithSigFigs(0.0001, 0.0001)}
      </Text>
      <Text fontSize="16px" color="#fff">
        0.001 --------------- {formatPriceWithSigFigs(0.001, 0.001)}
      </Text>
      <Text fontSize="16px" color="#fff">
        0.00000000004123 --------------- {formatPriceWithSigFigs(0.00000000004123, 0.00000000004123)}
      </Text>
      <Text fontSize="16px" color="#fff">
        0.00099980937 --------------- {formatPriceWithSigFigs(0.00099980937, 0.00099980937)}
      </Text>
      <Text fontSize="16px" color="#fff">
        0.00099981854 --------------- {formatPriceWithSigFigs(0.00099981854, 0.00099981854)}
      </Text>
      <Text>##########################################################</Text>

      <Text fontSize="16px" color="#fff">
        0.00099981854 --------------- {formatCurrencyWithKMB(0.00099981854)}
      </Text>

      <Text fontSize="16px" color="#fff">
        1.001233 --------------- {formatCurrencyWithKMB(1.001233)}
      </Text>
      <Text fontSize="16px" color="#fff">
        100.2114332433342 --------------- {formatCurrencyWithKMB(100.2114332433342)}
      </Text>
    </VStack>
  )
}

export default App
