import ControlPriceRange from '@/components/liquidity/clmm/ControlPriceRange'
import LiquidityRangeChart from '@/components/liquidity/clmm/LiquidityRangeChart'
import useGetCurrentPrice from '@/hooks/clmm/useGetCurrentPrice'
import usePriceRange from '@/hooks/clmm/usePriceRange'
import useGetApiPoolInfo from '@/hooks/pool/useGetApiPoolInfo'
import useGetContractPoolInfo from '@/hooks/pool/useGetContractPoolInfo'
import useCurrentPos from '@/hooks/position/useCurrentPos'
import usePositionBaseList from '@/hooks/position/usePositionList'
import useLiquidityStore from '@/store/clmm'
import usePriceRangeStore from '@/store/clmm/priceRange'
import { SelectTab } from '@cetus/design'
import { formatNumberWithDown } from '@cetus/utils'
import { Box, Button, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useRef, useState } from 'react'

export default function TestPosition() {
  const { getPositionBaseList, getPosRelatedData } = usePositionBaseList()
  const { getCurrentPosBaseInfo } = useCurrentPos()
  const { getApiPoolInfo } = useGetApiPoolInfo()
  const { getContractPoolInfo } = useGetContractPoolInfo()
  const { contractPoolInfo, apiPoolInfo, currentPriceData } = useLiquidityStore()
  const { handleInitTickData, handleResetRange } = usePriceRange()
  const { lowerTickData, upperTickData } = usePriceRangeStore()
  const { getCurrentPrice } = useGetCurrentPrice()

  const handleGetPositionList = async () => {
    const basePosList = await getPositionBaseList('0x66fb9f23e7a608317d91a036cb16b44363459fbfa2ab1595d4202ac4d95bb589')
    console.log('🚀 ~ file: TestPosition.tsx:9 ~ handleGetPositionList ~ basePosList:', basePosList)
    getPosRelatedData(basePosList)
  }

  const handleGetCurrentPosBaseInfo = async () => {
    const res = await getCurrentPosBaseInfo(
      '0x66fb9f23e7a608317d91a036cb16b44363459fbfa2ab1595d4202ac4d95bb589',
      '0x7f966e1423ca195a6a4b47c8de43bb3a6190c6d374f9fadb330205da8a034601'
    )
  }

  const handleGetPoolInfo = () => {
    // const poolAddress = '0xca398ff4d0ac964b0f5cedab3b1d35c8e598c324453e63c52e0eaa21cc958ed6' // vsui-usdc 0.25%
    // const poolAddress = '0x014abe87a6669bec41edcaa95aab35763466acb26a46d551325b07808f0c59c1' // wsol-sui 1%
    const poolAddress = '0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105' // sui-usdc
    getApiPoolInfo(poolAddress)
    getContractPoolInfo(poolAddress)
  }

  useEffect(() => {
    handleGetPoolInfo()

    return () => {
      handleResetRange()
    }
  }, [])

  const [currentTab, setCurrentTab] = useState<any>({})

  const tabList = useMemo(() => {
    if (apiPoolInfo?.displayTokenA?.symbol) {
      return [
        {
          label: apiPoolInfo?.displayTokenA?.symbol,
          id: apiPoolInfo?.displayTokenA?.coin_type
        },
        {
          label: apiPoolInfo?.displayTokenB?.symbol,
          id: apiPoolInfo?.displayTokenB?.coin_type
        }
      ]
    }
    return []
  }, [apiPoolInfo])

  const handleChangeCurrentTab = (item: any) => {
    console.log('🚀 ~ file: TestPosition.tsx:58 ~ handleChangeCurrentTab ~ item:', item)
    setCurrentTab(item)
  }

  // true正向，false反向
  const direct = useMemo(() => {
    if (currentTab?.id === apiPoolInfo?.tokenA?.coin_type) return true
    return false
  }, [currentTab?.id, apiPoolInfo?.tokenA?.symbol])

  const perText = useMemo(() => {
    return `${apiPoolInfo?.displayTokenA?.symbol}/${apiPoolInfo?.displayTokenB?.symbol}`
  }, [apiPoolInfo])

  useEffect(() => {
    if (apiPoolInfo?.displayTokenA?.symbol) {
      setCurrentTab({
        label: apiPoolInfo?.displayTokenA?.symbol,
        id: apiPoolInfo?.displayTokenA?.coin_type
      })
    }
  }, [apiPoolInfo])

  useEffect(() => {
    if (
      contractPoolInfo?.poolAddress &&
      lowerTickData?.pool !== contractPoolInfo?.poolAddress &&
      contractPoolInfo?.poolAddress === apiPoolInfo?.poolAddress
    ) {
      console.log('🚀 ~ file: TestPosition.tsx:87 ~ useEffect ~ contractPoolInfo:', contractPoolInfo)
      console.log('🚀 ~ file: TestPosition.tsx:87 ~ useEffect ~ apiPoolInfo:', apiPoolInfo)
      const currentTickIndex = contractPoolInfo.current_tick_index
      const lower = currentTickIndex - contractPoolInfo.tickSpacing
      const upper = currentTickIndex + contractPoolInfo.tickSpacing
      handleInitTickData(lower, upper, apiPoolInfo)
    }
  }, [contractPoolInfo, apiPoolInfo, lowerTickData])

  useEffect(() => {
    console.log('currentTab: ', currentTab)
  }, [currentTab])

  useEffect(() => {
    console.log('direct: ', direct)
  }, [direct])

  useEffect(() => {
    if (
      contractPoolInfo?.current_sqrt_price &&
      currentPriceData?.currentSqrtPrice !== contractPoolInfo?.current_sqrt_price &&
      apiPoolInfo?.poolAddress
    ) {
      getCurrentPrice(contractPoolInfo?.current_sqrt_price, apiPoolInfo, contractPoolInfo?.current_tick_index)
    }
  }, [contractPoolInfo?.current_sqrt_price, apiPoolInfo, currentPriceData])

  const depthChartInnerRef = useRef<any>(null)

  const handleClickRefresh = () => {
    console.log('🚀 ~ file: TestPosition.tsx:132 ~ handleClickRefresh ~ handleClickRefresh:')
  }

  return (
    <VStack>
      {/* <Button onClick={handleGetPositionList}>get position list</Button>
      <Button onClick={handleGetCurrentPosBaseInfo}>get position Info</Button> */}
      <Button onClick={handleGetPoolInfo}>get pool Info</Button>
      <Box mt="30px">
        <SelectTab
          type="borderTab"
          wrapStyle={{
            w: {
              base: '100%',
              lg: '395px'
            },
            h: '30px'
          }}
          itemStyle={{
            w: '50%',
            fontSize: '16px'
          }}
          tabList={tabList}
          currentTab={currentTab}
          handleChangeTab={handleChangeCurrentTab}
          isActive={(ctab, tab) => {
            if (ctab.id === tab.id) return true
            return false
          }}
        />
        <Box mt="20px" mb="20px">
          <Text>Current Pool Price: {formatNumberWithDown(direct ? currentPriceData?.currentPrice : currentPriceData.reverseCurrentPrice, 6)}</Text>
        </Box>
        <ControlPriceRange
          perText={perText}
          direct={direct}
          minPriceData={direct ? lowerTickData : upperTickData}
          maxPriceData={direct ? upperTickData : lowerTickData}
        />
      </Box>

      <Box w="500px" h="300px" mt="100px">
        <LiquidityRangeChart
          handleClickRefresh={handleClickRefresh}
          ref={depthChartInnerRef}
          minPriceData={direct ? lowerTickData : upperTickData}
          maxPriceData={direct ? upperTickData : lowerTickData}
          direct={direct}
        />
      </Box>

      <Box w="500px" h="300px" mt="100px">
        <LiquidityRangeChart
          handleClickRefresh={() => {}}
          ref={null}
          minPriceData={direct ? lowerTickData : upperTickData}
          maxPriceData={direct ? upperTickData : lowerTickData}
          direct={direct}
          readonly={true}
        />
      </Box>
    </VStack>
  )
}
