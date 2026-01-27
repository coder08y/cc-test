import { PriceRangePath } from '@/apis/path'
import useDepositStore from '@/store/clmm/deposit'
import usePositionStore from '@/store/position'
import { useFetch } from '@cetus/hooks'
import { Token } from '@cetus/types'
import { TickMath } from '@cetusprotocol/common-sdk'

function useGetPriceRange() {
  const { fetchByApi } = useFetch()
  const { setPriceRangeMap, setRecommendRangesInfo } = useDepositStore()
  const { setPoolRangeObj } = usePositionStore()
  const fetchPriceRange = async (poolAddress: string, tokenA?: Token, tokenB?: Token) => {
    try {
      const res = await fetchByApi(PriceRangePath, 'GET', { pool: poolAddress })
      console.log('🚀 ~ fetchPriceRange ~ res:', res)
      const rangesWithDateTypeMap = Object.fromEntries(
        res?.ranges?.map((item: any) => [
          item?.dateType,
          [
            TickMath.tickIndexToPrice(item?.lower, tokenA!.decimals, tokenB!.decimals).toString(),
            TickMath.tickIndexToPrice(item?.upper, tokenA!.decimals, tokenB!.decimals).toString()
          ]
        ])
      )
      setPriceRangeMap(rangesWithDateTypeMap)
      setRecommendRangesInfo({
        ranges: res?.recommender,
        type: res?.type,
        dateTypeRanges: res?.ranges
      })
      return {
        rangesWithDateTypeMap,
        recommendRanges: {
          ranges: res?.recommender,
          type: res?.type
        }
      }
    } catch (error) {
      console.error('Error in fetchPriceRange:', error)
      setPriceRangeMap({})
      setRecommendRangesInfo({
        ranges: {},
        type: '',
        dateTypeRanges: []
      })
      return {
        rangesWithDateTypeMap: {},
        recommendRanges: {
          ranges: {},
          type: ''
        }
      }
    }
  }

  // 计算apr用
  const fetchPriceRanges = async (pools: string[]) => {
    const { data } = await fetchByApi(PriceRangePath, 'POST', { pools })
    const rangesWithPoolMap = data.reduce((acc, item) => {
      acc[item.pool] = item
      return acc
    }, {})
    console.log('🚀 ~ fetchPriceRanges ~ rangesWithPoolMap:', rangesWithPoolMap)
    setPoolRangeObj(rangesWithPoolMap)
  }

  return {
    fetchPriceRange,
    fetchPriceRanges
  }
}

export default useGetPriceRange
