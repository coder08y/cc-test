import useCustomizeRouting from '@/hooks/swap/useCustomizeRouting'
import useGetRouterConfig from '@/hooks/swap/useGetRouterConfig'
import { usePriceImpact } from '@/hooks/swap/usePriceImpact'
import { useSwapHook } from '@/hooks/swap/useSwap'
import { useFormatSwapRouter, useGetPriceAcceptRouterData } from '@/hooks/swap/useSwapHelper'
import useSwapStore from '@/store/swap/swap'
import { AggregatorProvider, SwapRouterData } from '@/types/swap'
import { useInterval } from '@cetus/hooks'
import { useGetToken } from '@cetus/hooks/src/useToken'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { formatNumber } from '@cetus/utils'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'
import { bcs } from '@mysten/sui/bcs'
import { Transaction } from '@mysten/sui/transactions'
import { fromBase64 } from '@mysten/sui/utils'
import { useState } from 'react'

function TestSwap() {
  const { fetchRouterConfig } = useGetRouterConfig()
  const { fetchTokenInfo } = useGetToken()
  const {
    otherProviderList,
    dexProviderList,
    currProvidersSwitchStates,
    isOpenAggregatorMode,
    handleProviderClick,
    handleSaveClick,
    providersSwitchStates,
    handleSelectAllProviderClick
  } = useCustomizeRouting()

  const readConfigs = () => {
    console.log('🚀 ~ file: TestSwap.tsx:9 ~ TestSwap ~ providersSwitchStates:', {
      currProvidersSwitchStates,
      isOpenAggregatorMode,
      otherProviderList,
      dexProviderList,
      providersSwitchStates
    })
  }

  const selectAllProvider = () => {
    // handleSelectAllProviderClick(true)
    // handleSaveClick()

    const [
      {
        txSignatures: [signature],
        intentMessage: { value: bcsTransaction }
      }
    ] = bcs.SenderSignedData.parse(
      fromBase64(
        '/LZ9yT0oc5ecWdkSNxFK+mmJD2snFuXWliMjIZwZuknM6GAAAAAAAAQEB2qRikmMsPE2PMfI+oPmzaij/NnfpaEmA5EOEA6Z6PY8uBRgAAAAAAAABAalSUU8Mf3nlDB/HJR5skHGrewIwlvDsea9QxZOJkHTHfds5GAAAAAABAQFjm15DPaMXOegAzQhfNW5kyuIilm0PGxG9ncdrMi/1i2LvCxMAAAAAAQEBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYBAAAAAAAAAAAACAuZAAAAAAAACAIAAQEAAAICAAABAQEAAOwhCNIJLdbx9v5F3vY5UA4yNZbgurn6vCBkYarfNX5qCGJsdWVtb3ZlCHN3YXBfYTJiAgcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgNzdWkDU1VJAAeCi0UtKqI51I5BIMJPSln0UbjNisdnBhKfSsO9eKyICQhscF90b2tlbghMUF9UT0tFTgACAQIAAwEAAAAA7CEI0gkt1vH2/kXe9jlQDjI1luC6ufq8IGRhqt81fmoIYmx1ZW1vdmUIc3dhcF9hMmICB4KLRS0qojnUjkEgwk9KWfRRuM2Kx2cGEp9Kw714rIgJCGxwX3Rva2VuCExQX1RPS0VOAAetTXFVHTEJIjDbH9SCAI6kKGfb8nsobpxwp50qYZHVjRVzY2FsbG9wX3dvcm1ob2xlX3VzZGMVU0NBTExPUF9XT1JNSE9MRV9VU0RDAAIBAgACAgAA7CEI0gkt1vH2/kXe9jlQDjI1luC6ufq8IGRhqt81fmoFY2V0dXMIc3dhcF9iMmECB9ujRnLjDLBlsfk+OrVTGHaP1v72bBWULJ98uEbi+QDnBHVzZGMEVVNEQwAHrU1xVR0xCSIw2x/UggCOpChn2/J7KG6ccKedKmGR1Y0Vc2NhbGxvcF93b3JtaG9sZV91c2RjFVNDQUxMT1BfV09STUhPTEVfVVNEQwAFAQMAAQQAAQUAAgMAAQYAAOwhCNIJLdbx9v5F3vY5UA4yNZbgurn6vCBkYarfNX5qBXV0aWxzGHRyYW5zZmVyX29yX2Rlc3Ryb3lfY29pbgEHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIDc3VpA1NVSQABAgAAAOwhCNIJLdbx9v5F3vY5UA4yNZbgurn6vCBkYarfNX5qBXV0aWxzFGNoZWNrX2NvaW5fdGhyZXNob2xkAQfbo0Zy4wywZbH5Pjq1Uxh2j9b+9mwVlCyffLhG4vkA5wR1c2RjBFVTREMAAgIEAAEHAADsIQjSCS3W8fb+Rd72OVAOMjWW4Lq5+rwgZGGq3zV+agV1dGlscxh0cmFuc2Zlcl9vcl9kZXN0cm95X2NvaW4BB9ujRnLjDLBlsfk+OrVTGHaP1v72bBWULJ98uEbi+QDnBHVzZGMEVVNEQwABAgQAxc6jnamH2P4WvwxttRv79Il67w7flYjgNa4XWsQW/dEBtm+TD0jlauUrJAi+WYoSeiU7R3axbOHjd+uFkRv/jE78adcZAAAAACBFApnqHSuUyrLcq2/AC6EtVJ0YpOGur/zKS+wVnyfzIMXOo52ph9j+Fr8MbbUb+/SJeu8O35WI4DWuF1rEFv3R7gIAAAAAAAAA4fUFAAAAAAABYQDGyJkNCmeo1s7Wjp6GmrLET4eRnez9hfObRBwRnvtkHfkyfgN6rqnHbxSfXppGImhMN0YdqvPGwg20negZezENuj/ZWiVlt0ipzg3M0dbzbzXNAcYNqxIiPi4UAlUfNs0='
      )
    )
    const bytes = bcs.TransactionData.serialize(bcsTransaction).toBase64()
    const info = Transaction.from(bytes)

    console.log('🚀 ~ file: TestSwap.tsx:47 ~ selectAllProvider ~ info:', {
      info,
      signature
    })
  }

  const noSaveConfigs = async () => {
    handleProviderClick(AggregatorProvider.SCALLOP, true)

    const sui_coin = await fetchTokenInfo(envConfigs.sui_coin.coin_type)
    const cetus_coin = await fetchTokenInfo(envConfigs.cetus_coin.coin_type)
    const to_coin = await fetchTokenInfo(envConfigs.clmm_swap.to_coin.coin_type)

    console.log('🚀 ~ file: TestSwap.tsx:51 ~ noSaveConfigs ~ to_coin:', {
      to_coin,
      sui_coin,
      cetus_coin
    })
  }

  const { handleAmountChange, amountLimit, getSwapSecondaryData, reCalculateRouteData } = useSwapHook()
  const { findRouterLoading, routerData, fromAmount, toAmount, fromCoin, toCoin } = useSwapStore()
  const { marketPrice, priceImpact, sources, swapPrice } = usePriceImpact(fromCoin, toCoin, fromAmount, toAmount)

  const { formatSwapRouter } = useFormatSwapRouter(routerData)

  const openAggregatorFindBestRouters = () => {
    // 固定from  输入10个sui
    handleAmountChange('1000', true)
  }

  const [originRouterData, setOriginRouterData] = useState<SwapRouterData | undefined>(undefined)

  useInterval({
    interval: 20 * 1000,
    callback: () => {
      reCalculateRouteData()
    }
  })

  // store 中的 routerData 为定时刷新，最新报价路由
  // 根据originRouterData和routerData，amount对比，要决定是否展示PriceUpdate
  // 如果 priceAcceptRouterData 对象有值，则说明要展示PriceUpdate  ， 用户点击接受时，将priceAcceptRouterData 复制给originRouterData
  const { priceAcceptRouterData } = useGetPriceAcceptRouterData(originRouterData)

  const openConfirmDialog = () => {
    const routerData = getSwapSecondaryData()
    // 打开弹窗时，把routerData 的原始数据，传给确认框，
    setOriginRouterData(routerData)
  }

  return (
    <VStack w="100vw" h="100vh" background="bg_primary" p="24px">
      <Button
        onClick={() => {
          fetchRouterConfig()
        }}
      >
        获取routers 配置
      </Button>

      <Button onClick={readConfigs}>查看相关配置信息</Button>
      <Button onClick={selectAllProvider}>打开全部Provider</Button>
      <Button onClick={noSaveConfigs}>修改不保存配置</Button>
      <Text>------------------------------第一种情况, 打开所有Aggragator, 不走降级测试------------------------------------</Text>
      <Button isLoading={findRouterLoading} onClick={openAggregatorFindBestRouters}>
        第一步 寻找最佳Routers
      </Button>
      <Button onClick={openConfirmDialog}>第二步 点击确认打开确认弹窗</Button>
      <Button>第三步 提交交易</Button>
      {routerData && (
        <VStack>
          <HStack>
            <Text>
              pay: {fromAmount} {fromCoin?.symbol}
            </Text>
            <Text>
              for: {toAmount} {toCoin?.symbol}
            </Text>
          </HStack>
          <Text>Minimum Received: {amountLimit}</Text>
          <Text>市场价格: {formatNumber(marketPrice)}</Text>
          <Text>兑换价格: {swapPrice}</Text>
          <Text>priceImpact: {priceImpact}</Text>
          <Text>sources: {sources}</Text>
          {formatSwapRouter && <Text>格式化路由信息: {JSON.stringify(formatSwapRouter)}</Text>}
          {priceAcceptRouterData && (
            <Button
              onClick={() => {
                setOriginRouterData({ ...priceAcceptRouterData })
              }}
            >
              Price Update
            </Button>
          )}
        </VStack>
      )}
    </VStack>
  )
}

export default TestSwap
