import useDcaStore from '@/store/dca'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useSdk } from '@cetus/sdk-factory'
import useTokenSelectStore from '@cetus/stores/src/useTokenSelectStore'
import { CoinType } from '@cetus/types'

export default function () {
  const dcaSdk = useSdk('dca')
  const { getTokenListInfo } = useGetToken()
  const { setFilterTokenLoading } = useTokenSelectStore()
  const { setInCoinWhiteList, setOutCoinWhiteList } = useDcaStore()
  // whitelist_mode = 0 关闭白名单模式
  // whitelist_mode = 1 只开启in_coin
  // whitelist_mode = 2 只开启out_coin
  // whitelist_mode = 3 全部开启
  const getDcaCoinWhiteList = async (whitelist_mode: number) => {
    console.log('🚀🚀🚀 ~ file: useGetDcaTokenList.ts:44 ~ getDcaCoinWhiteList ~ getDcaCoinWhiteList:')
    try {
      setFilterTokenLoading(true)
      const { in_coin_list, out_coin_list } = await dcaSdk!.Dca.getDcaCoinWhiteList(whitelist_mode)
      console.log('🚀🚀🚀 ~ file: useGetDcaTokenList.ts:18 ~ getDcaCoinWhiteList ~ outCoinList:', out_coin_list)
      console.log('🚀🚀🚀 ~ file: useGetDcaTokenList.ts:18 ~ getDcaCoinWhiteList ~ inCoinList:', in_coin_list)
      const inList: any = []
      const outList: any = []
      const inCoinTypeList = in_coin_list.map((item: any) => item)
      const inTokenMap = await getTokenListInfo(inCoinTypeList)
      if (inTokenMap) {
        for (let i = 0; i < in_coin_list.length; i++) {
          const tokenInfo = inTokenMap.get(in_coin_list[i] as CoinType)
          if (tokenInfo) {
            inList.push({
              ...tokenInfo,
              labels: tokenInfo?.labels?.length > 0 ? tokenInfo?.labels : ''
            })
          }
        }
      }
      const outCoinTypeList = out_coin_list.map((item: any) => item)
      const outTokenMap = await getTokenListInfo(outCoinTypeList)
      if (outTokenMap) {
        for (let i = 0; i < out_coin_list.length; i++) {
          const tokenInfo = outTokenMap.get(out_coin_list[i] as CoinType)
          if (tokenInfo) {
            outList.push({
              ...tokenInfo,
              labels: tokenInfo?.labels?.length > 0 ? tokenInfo?.labels : ''
            })
          }
        }
      }

      console.log('🚀🚀🚀 ~ file: useDca.ts:351 ~ getDcaCoinWhiteList ~ outList:', outList)
      console.log('🚀🚀🚀 ~ file: useDca.ts:351 ~ getDcaCoinWhiteList ~ inList:', inList)
      setInCoinWhiteList(inList)
      setOutCoinWhiteList(outList)
      setFilterTokenLoading(false)
    } catch (error) {
      setInCoinWhiteList([])
      setOutCoinWhiteList([])
      setFilterTokenLoading(false)
      console.log('🚀 ~ file: useGetDcaTokenList.ts:35 ~ getDcaCoinWhiteList ~ error:', error)
    }
  }
  return { getDcaCoinWhiteList }
}
