import useGetRecommendRanges from '@/hooks/clmm/useRecommendRanges'
import useDcaConfig from '@/hooks/dca/useDcaConfig'
import useGetDcaOrderHistory from '@/hooks/dca/useGetDcaOrderHistory'
import useDcaGetQuote from '@/hooks/dca/useGetDcaQuote'
import useGetFarmList from '@/hooks/farms/useGetFarmList'
import useGetLimitOrderHistory from '@/hooks/limit/useGetLimitOrderHistory'
import useFavoritePool from '@/hooks/pool/useFavoritePool'
import useGetApiPoolInfo from '@/hooks/pool/useGetApiPoolInfo'
import useGetPoolList from '@/hooks/pool/useGetPoolList'
import useGetHistogramData from '@/hooks/stats/useGetHistogramData'
import useStatistics from '@/hooks/stats/useStatistics'
import useStatsPools from '@/hooks/stats/useStatsPools'
import useStatsTokens, { GetStatsTokensParams } from '@/hooks/stats/useStatsTokens'
import useTransactionsTx from '@/hooks/stats/useTransactionsTx'
import useGetVaultList from '@/hooks/vaults/useVaultList'
import { useGetTokens } from '@cetus/hooks'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { Button, VStack } from '@chakra-ui/react'
import { useState } from 'react'

function Test() {
  const { getStatsPools } = useStatsPools()
  const { getStatesTokens } = useStatsTokens()
  const { getTokens } = useGetTokens()
  const { getTokenInfo } = useGetToken()
  const { getTransactionsTx } = useTransactionsTx()
  const { getStatistics } = useStatistics()
  const { getHistogramData } = useGetHistogramData()
  const { getPoolList, getLocalJsonPoolList } = useGetPoolList()
  const { getVaultBaseList, getVaultsStats, getVaultList } = useGetVaultList()
  const { getFarmList } = useGetFarmList()
  const { getApiPoolInfo } = useGetApiPoolInfo()
  const { getDcaConfig } = useDcaConfig()
  const { getDcaQuote } = useDcaGetQuote()
  const { getDcaOrderHistory } = useGetDcaOrderHistory()
  const { getLimitOrderHistory } = useGetLimitOrderHistory()
  const { getFavoritePoolList } = useFavoritePool()
  const { getRecommendRanges } = useGetRecommendRanges()

  // 池子统计信息
  const handleGetStatsPools = () => {
    const params = {
      order_by: '-vol',
      offset: 0,
      limit: 20
    }
    getStatsPools(params)
  }

  // tokens 统计信息
  const handleGetStatsTokens = async () => {
    const params: GetStatsTokensParams = {
      order_by: '-vol_24',
      offset: 0,
      limit: 10
    }
    const res = await getStatesTokens(params)
    console.log('🚀 ~ file: TestData.tsx:29 ~ handleGetStatsTokens ~ res:', res)

    // 这里只是测试下全局token相关的信息获取，UI层不建议组装数组后再展示
    const list = []
    for (let i = 0; i < res?.data?.length; i++) {
      const item = res?.data?.[i]

      const coinInfo = await getTokenInfo(item.coinType)
      list.push({
        ...item,
        coinInfo
      })
    }

    console.log('🚀 ~ file: TestData.tsx:29 ~ handleGetStatsTokens ~ list:', list)
  }

  // tokens 基础信息
  const handleGetTokens = () => {
    getTokens()
  }

  // 获取tx记录
  const handleGetTransactionsTx = async () => {
    const res = await getTransactionsTx({
      coin: 'all' // 统计页面展示时候coin只能传all
    })
    console.log('🚀 ~ file: TestData.tsx:60 ~ handleGetTransactionsTx ~ res:', res)
  }

  // 获取总统计信息
  const handleGetStatistics = async () => {
    const res = await getStatistics()
    console.log('🚀 ~ file: TestData.tsx:68 ~ handleGetStatistics ~ res:', res)
  }

  const [pureTvlData, setPureTvlData] = useState([])
  // 获取图表数据
  const handleGetHistogramData = async () => {
    const res = await getHistogramData({
      type: 'tvl'
    })
    console.log('🚀 ~ file: TestData.tsx:78 ~ handleGetHistogramData ~ res:', res)
    setPureTvlData(res)
  }

  const [pureTvlCurrent, setPureTvlCurrent] = useState('默认值') // 默认值根据情况自己设置

  const handleChangePureTvl = (data: any) => {
    console.log('🚀 ~ file: TestData.tsx:88 ~ handleChangePureTvl ~ data:', data)
    if (data) {
      setPureTvlCurrent(data.num)
    } else {
      setPureTvlCurrent('默认值')
    }
  }

  // useEffect(() => {
  //   handleGetHistogramData()
  // }, [])

  // 池子列表数据请求
  const handleGetPoolList = async () => {
    const params = {
      is_vaults: false,
      display_all_pools: false,
      has_mining: false,
      has_farming: true,
      no_incentives: false,
      order_by: '-vol',
      limit: 100000,
      offset: 0
      // coin_type: '0xc060006111016b8a020ad5b33834984a437aaa7d3c74c18e09a95d48aceab08c::coin::COIN'
    }
    // getPoolList(params)
    // const res = await getLocalJsonPoolList(params)
    const res = await getPoolList(params)
    console.log('🚀 ~ file: TestData.tsx:116 ~ handleGetPoolList ~ res:', res)
  }

  const handleGetFavoritePoolList = async () => {
    const parms = [
      '0x07a4155e3ed7f2d66346da0d149e6a49d4c61413a22283b126784a28c7d57e01',
      '0x763f63cbada3a932c46972c6c6dcf1abd8a9a73331908a1d7ef24c2232d85520'
    ]
    const res = await getFavoritePoolList(parms)
    console.log('🚀 ~ file: TestData.tsx:142 ~ handleGetFavoritePoolList ~ res:', res)
  }

  // Pool Api信息获取
  const handleGetApiPoolInfo = async () => {
    const res = await getApiPoolInfo('0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105')
    console.log('🚀 ~ file: TestData.tsx:141 ~ handleGetApiPoolInfo ~ res:', res)
  }

  // Vaults列表数据请求
  const handleGetVaults = async () => {
    const list = await getVaultList()
    console.log('🚀 ~ file: TestData.tsx:125 ~ handleGetVaults ~ list:', list)
  }

  // Farms列表数据请求
  const handleGetFarms = async () => {
    const list = await getFarmList('-apr')
    console.log('🚀 ~ file: TestData.tsx:133 ~ handleGetFarms ~ list:', list)
  }

  const handleGetDcaConfig = async () => {
    const res = await getDcaConfig()
  }

  const handleGetDcaQuote = async () => {
    const res = await getDcaQuote({
      inCoin: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      freq: '3600',
      count: 2,
      sender: '0x66fb9f23e7a608317d91a036cb16b44363459fbfa2ab1595d4202ac4d95bb589'
    })
    console.log('🚀 ~ file: TestData.tsx:154 ~ handleGetDcaQuote ~ res:', res)
  }

  const handleGetDcaOrderHistory = async () => {
    const res = await getDcaOrderHistory({
      orderId: '0x140f1a8f729f970c3d5d10e93d4857a3e5b02f8bb22507b33b1650d73488bb85',
      limit: 10,
      offset: 0
    })
    console.log('🚀 ~ file: TestData.tsx:170 ~ handleGetDcaOrderHistory ~ res:', res)
  }

  const handleGetLimitOrderHistory = async () => {
    const res = await getLimitOrderHistory('0x66fb9f23e7a608317d91a036cb16b44363459fbfa2ab1595d4202ac4d95bb589')
    console.log('🚀 ~ file: TestData.tsx:170 ~ handleGetDcaOrderHistory ~ res:', res)
  }

  const handleGetRecommendRanges = async () => {
    const res = await getRecommendRanges('0xb8d7d9e66a60c239e7a60110efcf8de6c705580ed924d0dde141f4a0e2c90105')
    console.log('🚀 ~ file: TestData.tsx:195 ~ handleGetRecommendRanges ~ res:', res)
  }

  return (
    <VStack w="100vw" h="100vh" background="bg_primary" p="24px">
      <Button variant="ghost" onClick={handleGetStatsPools}>
        get stats pools
      </Button>
      <Button variant="ghost" onClick={handleGetStatsTokens}>
        get stats tokens
      </Button>
      <Button variant="ghost" onClick={handleGetTokens}>
        get tokens
      </Button>

      <Button variant="ghost" onClick={handleGetTransactionsTx}>
        get transactions tx
      </Button>

      <Button variant="ghost" onClick={handleGetStatistics}>
        get transactions statistics
      </Button>

      <Button variant="ghost" onClick={handleGetHistogramData}>
        get pure tvl chart data
      </Button>

      {/* <Box>{pureTvlCurrent}</Box> */}
      {/* 折线图 */}
      {/* <Box w="540px" h="240px">
        <TvlChart data={pureTvlData} onChangeValue={handleChangePureTvl} />
      </Box> */}

      {/* 柱状图 */}
      {/* <Box w="540px" h="240px">
        <VolumeChart data={pureTvlData} onChangeValue={handleChangePureTvl} />
      </Box> */}

      <Button variant="ghost" onClick={handleGetPoolList}>
        get pool list
      </Button>

      <Button variant="ghost" onClick={handleGetFavoritePoolList}>
        get favorite pool list
      </Button>

      <Button variant="ghost" onClick={handleGetApiPoolInfo}>
        get api pool Item
      </Button>

      <Button variant="ghost" onClick={handleGetVaults}>
        get vaults
      </Button>

      <Button variant="ghost" onClick={handleGetFarms}>
        get farms
      </Button>

      <Button variant="ghost" onClick={handleGetDcaConfig}>
        get dca config
      </Button>

      <Button variant="ghost" onClick={handleGetDcaQuote}>
        get dca quote
      </Button>

      <Button variant="ghost" onClick={handleGetDcaOrderHistory}>
        get dca order history
      </Button>

      <Button variant="ghost" onClick={handleGetLimitOrderHistory}>
        get limit order history
      </Button>

      <Button variant="ghost" onClick={handleGetRecommendRanges}>
        get recommend ranges
      </Button>
    </VStack>
  )
}

export default Test
