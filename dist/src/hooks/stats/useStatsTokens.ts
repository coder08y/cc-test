import { AllStatisticsTokens, StatisticsTokens } from '@/apis/path'
import { useFetch } from '@cetus/hooks'
import { d, formatNumber, formatPrice, symbolDataDisplayProcessing } from '@cetus/utils'

export type StatsTokensOrderBy = 'change_percentage' | '-change_percentage' | 'vol_24' | '-vol_24' | 'price' | '-price' | 'tvl' | '-tvl'
export type GetStatsTokensParams = {
  order_by?: StatsTokensOrderBy
  limit?: number
  offset?: number
  coinTypes?: string[]
}

type GetStatsTokensParamsV2 = {
  sortBy: string // 'vol' | 'price' | 'tvl'
  sortOrder: string // 'asc' | 'desc'
  limit: number
  offset: number
  coinTypes: string[]
  filter: string // 'verified' | 'all'
}

const orderByMap = {
  vol_24: 'vol',
  price: 'price',
  tvl: 'tvl',
  change_percentage: 'priceChange'
}

export default function useStatsTokens() {
  const { fetchByApi } = useFetch()
  const wrapGetStatsTokensParams = (params: GetStatsTokensParams) => {
    const { order_by, limit, offset, coinTypes } = params
    console.log('🚀🚀🚀 ~ useStatsTokens.ts:24 ~ wrapGetStatsTokensParams ~ params:', params)
    const wrapParams: GetStatsTokensParamsV2 = {
      sortBy: 'vol',
      sortOrder: 'desc',
      limit: 10,
      offset: 0,
      coinTypes: coinTypes || [],
      filter: 'default'
    }
    if (order_by) {
      console.log('🚀🚀🚀 ~ useStatsTokens.ts:35 ~ wrapGetStatsTokensParams ~ order_by:', order_by)
      const orderBy = order_by.replace('-', '').toLowerCase()
      wrapParams.sortBy = orderByMap[orderBy as keyof typeof orderByMap]
    }

    if (order_by && order_by?.indexOf('-') > -1) {
      wrapParams.sortOrder = 'desc'
    } else {
      wrapParams.sortOrder = 'asc'
    }
    if (limit) {
      wrapParams.limit = limit
    }
    if (offset) {
      wrapParams.offset = offset
    }

    return wrapParams
  }
  const getClmmStatesTokens = async (params: GetStatsTokensParams) => {
    const wrapParams = wrapGetStatsTokensParams(params)
    console.log('🚀 ~ getStatesTokens ~ wrapParams:', wrapParams)
    const res = await fetchByApi(StatisticsTokens, 'POST', wrapParams)
    console.log('🚀 ~ file: useStatsTokens.ts:14 ~ getStatesTokens ~ res:', res)

    if (res?.data?.list) {
      const tokensData = res?.data?.list?.map((item: any) => {
        const isPositive = d(item?.price24HChange).gt(0)
        const price24HChangePercentage = formatNumber(d(item?.price24HChange).mul(100).toString(), 4, true)
        return {
          coinType: item?.coinType,
          price: '$' + formatPrice(item?.price),
          priceChange: (isPositive ? '+' : '') + symbolDataDisplayProcessing(price24HChangePercentage, '%'),
          priceChangeColor: Number(item?.price24HChange) === 0 ? 'text_caption' : isPositive ? 'primary_green' : 'primary_red',
          volume24: symbolDataDisplayProcessing(item?.stats?.filter((item: any) => item.dateType === '24H')[0]?.vol, '$'),
          tvl: symbolDataDisplayProcessing(item.tvl, '$')
        }
      })

      console.log('🚀 ~ file: useStatsTokens.ts:20 ~ tokensData ~ tokensData:', tokensData)

      return {
        data: tokensData,
        total: res?.data?.total
      }
    }

    return null
  }

  const getAllStatesTokens = async (params: GetStatsTokensParams, isAll: boolean = true) => {
    const wrapParams = isAll ? wrapGetStatsTokensParams(params) : params
    console.log('🚀 ~ getStatesTokens ~ wrapParams:', wrapParams)
    const res = await fetchByApi(AllStatisticsTokens, 'POST', wrapParams)
    console.log('🚀 ~ file: useStatsTokens.ts:14 ~ getStatesTokens ~ res:', res)

    if (res?.data?.list) {
      const tokensData = res?.data?.list?.map((item: any) => {
        const isPositive = d(item?.price24HChange).gt(0)
        const price24HChangePercentage = formatNumber(d(item?.price24HChange).mul(100).toString(), 4, true)
        return {
          coinType: item?.coinType,
          price: '$' + formatPrice(item?.price),
          priceChange: (isPositive ? '+' : '') + symbolDataDisplayProcessing(price24HChangePercentage, '%'),
          priceChangeColor: Number(item?.price24HChange) === 0 ? 'text_caption' : isPositive ? 'primary_green' : 'primary_red',
          volume24: symbolDataDisplayProcessing(item?.totalVolume24h, '$'),
          tvl: symbolDataDisplayProcessing(item.totalTvl, '$'),
          totalTvl: item.totalTvl
        }
      })

      console.log('🚀 ~ file: useStatsTokens.ts:20 ~ tokensData ~ tokensData:', tokensData)

      return {
        data: tokensData,
        total: res?.data?.total
      }
    }

    return null
  }

  return {
    getClmmStatesTokens,
    getAllStatesTokens
  }
}
