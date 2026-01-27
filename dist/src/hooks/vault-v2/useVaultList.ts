import { vaultsMaps } from '@/constant/vaults'
import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import { QueryVaultListOptions, SortVaultListOptions } from '@/types/vaults-v2'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { Token } from '@cetus/types'
import { d, fixCoinType } from '@cetusprotocol/common-sdk'
import useGetPythLastPrice from './pyth-price/useGetPythLastPrice'
import useGetVaultPoolList from './useGetVaultPoolList'
export default function useVaultList() {
  const { fetchTokenPrices } = useTokenPrice()
  const { setVaultListLoading, setVaultsTokenList, lpTokenInfoObj, setLpTokenInfoObj, vaultsList, vaultPageList, setVaultPageList } =
    useVaultsListV2Store()
  const { getVaultPoolList } = useGetVaultPoolList()
  const { fetchTokenInfo, getTokenListInfo } = useGetToken()
  const { vaultsPositionObj, setShowVaultsList } = useVaultsPositionStore()
  const { getPythLastPrice } = useGetPythLastPrice()

  // 列表筛选
  const filterVaultList = (filterOptions: QueryVaultListOptions, originList = vaultsList) => {
    const { currentTab, isYourHoldings, selectCoinList, sortOptions, status, isIncentivizedOnly } = filterOptions
    let filterList: any[] = []
    let list: any[] = []
    if (selectCoinList?.length > 0) {
      list = filterVaultListByCoinList(originList, selectCoinList)
    } else {
      list = originList
    }
    if (currentTab === 'all') {
      filterList = list
    } else if (currentTab === 'cetus') {
      filterList = list.filter(vault => vault.category == currentTab)
    } else {
      filterList = list.filter(vault => vault.quoteType == currentTab && vault.category !== 'cetus')
    }

    // if (status == 'active') {
    //   filterList = filterList.filter(vault => vault.status === 'active' || vault.status === 'sunsetSoon')
    // } else if (status === 'sunset') {
    //   filterList = filterList.filter(vault => vault.status === 'sunset')
    // }

    filterList = filterList.filter(
      vault =>
        (vault.status == 'sunset' && vaultsPositionObj[vault.vaultId]?.balance > 0) ||
        vault.status == 'active' ||
        (vault.status == 'sunsetSoon' && vaultsPositionObj[vault.vaultId]?.balance > 0)
    )

    let result
    if (isYourHoldings) {
      result = sortVaultList(sortOptions, filterMyVaultList(filterList))
    } else {
      result = sortVaultList(sortOptions, filterList)
    }

    if (isIncentivizedOnly) {
      result = result.filter(vault => vault.haveFarming)
    }

    setVaultPageList(result)
    setShowVaultsList(result)
    return result
  }

  // 列表排序
  const sortVaultList = (options: SortVaultListOptions, vaultList: any[]) => {
    console.log('🚀 ~ sortVaultList ~ options:', options)
    const { sortRule, sortType } = options

    const result = vaultList?.sort((a: any, b: any) => {
      if (sortType === 'apr') {
        return sortRule === 'desc' ? b.vaultsTotalApy - a.vaultsTotalApy : a.vaultsTotalApy - b.vaultsTotalApy
      }
      return sortRule === 'desc' ? b.vaultsTvl - a.vaultsTvl : a.vaultsTvl - b.vaultsTvl
    })
    return result
  }

  // 获取vault列表
  const fetchVaultList = async (options: QueryVaultListOptions, isLoading = true) => {
    if (isLoading) {
      setVaultListLoading(true)
    }
    const { poolList: list } = await getVaultPoolList()
    // 获取可筛选token列表
    getVaultsTokenList(list)
    // 获取vaultLP Token信息
    getVaultsLpTokenList(list)
    const result = filterVaultList(options, JSON.parse(JSON.stringify(list)))
    console.log('🚀🚀🚀 ~ useVaultList.ts:84 ~ fetchVaultList ~ result:', result)
    setVaultListLoading(false)
    setVaultPageList(result)
    setShowVaultsList(result)
  }

  // 列表筛选用
  // packages/web/src/hooks/vault-v2/useVaultList.ts
  const getVaultsTokenList = async (list: any) => {
    if (!list || list.length === 0) return
    const tokenList: string[] = []
    const haedalV1TokenSet = new Set<string>()
    const haedalV2TokenSet = new Set<string>()

    for (const vault of list) {
      const tokenACoinType = vault.displayTokenA.coin_type
      const tokenBCoinType = vault.displayTokenB.coin_type

      if (!tokenList.includes(tokenACoinType)) tokenList.push(tokenACoinType)
      if (!tokenList.includes(tokenBCoinType)) tokenList.push(tokenBCoinType)

      const addTokenToSet = (target: Set<string>, other: Set<string>, token: string) => {
        if (other.has(token) || target.has(token)) return
        target.add(token)
      }

      for (const vault of list) {
        const tokenA = fixCoinType(vault.displayTokenA.coin_type, false)
        const tokenB = fixCoinType(vault.displayTokenB.coin_type, false)

        if (vault.category === 'haedal') {
          addTokenToSet(haedalV1TokenSet, haedalV2TokenSet, tokenA)
          addTokenToSet(haedalV1TokenSet, haedalV2TokenSet, tokenB)
        } else if (vault.category === 'haevault_v2') {
          addTokenToSet(haedalV2TokenSet, haedalV1TokenSet, tokenA)
          addTokenToSet(haedalV2TokenSet, haedalV1TokenSet, tokenB)
        }
      }
    }

    if (haedalV1TokenSet.size > 0) {
      await getPythLastPrice(Array.from(haedalV1TokenSet), 'haedal')
    }
    if (haedalV2TokenSet.size > 0) {
      await getPythLastPrice(Array.from(haedalV2TokenSet), 'haevault_v2')
    }

    if (tokenList.length > 0) {
      fetchTokenPrices(tokenList)
    }

    const tokenInfos = await getTokenListInfo(tokenList)
    setVaultsTokenList(Array.from(tokenInfos.values()))
  }

  // LP Token信息
  const getVaultsLpTokenList = async (list: any[]) => {
    const tokenInfoObj: Record<string, Token | undefined> = {}
    for (let i = 0; i < list.length; i++) {
      const vault = list[i]
      const lpTokenType = vault?.lpTokenType
      if (vaultsMaps[vault.vaultId]?.lpToken) {
        tokenInfoObj[lpTokenType] = vaultsMaps[vault.vaultId]?.lpToken
      } else {
        if (lpTokenInfoObj[lpTokenType]) {
          tokenInfoObj[lpTokenType] = lpTokenInfoObj[lpTokenType]
        } else {
          tokenInfoObj[lpTokenType] = (await fetchTokenInfo(lpTokenType)) as Token
        }
      }
    }
    setLpTokenInfoObj(tokenInfoObj)
    return tokenInfoObj
  }

  // 通过tokenA tokenB 筛选列表
  const filterVaultListByCoinList = (listOrigin: any[], selectCoinList: any[]) => {
    const firstTokenAddress = selectCoinList[0]?.coin_type ? fixCoinType(selectCoinList[0]?.coin_type) : undefined
    const lastTokenAddress = selectCoinList[1]?.coin_type ? fixCoinType(selectCoinList[1]?.coin_type) : undefined
    const filterArr = listOrigin?.filter((filterItem: any) => {
      if (firstTokenAddress && lastTokenAddress) {
        return (
          (fixCoinType(filterItem.displayTokenA.coin_type) == firstTokenAddress &&
            fixCoinType(filterItem.displayTokenB.coin_type) == lastTokenAddress) ||
          (fixCoinType(filterItem.displayTokenA.coin_type) == lastTokenAddress &&
            fixCoinType(filterItem.displayTokenB.coin_type) == firstTokenAddress)
        )
      } else if (firstTokenAddress) {
        return (
          fixCoinType(filterItem.displayTokenA.coin_type) == firstTokenAddress || fixCoinType(filterItem.displayTokenB.coin_type) == firstTokenAddress
        )
      } else {
        return filterItem
      }
    })
    return filterArr
  }

  // 筛选我的质押的vault
  const filterMyVaultList = (list: any[]) => {
    return list.filter(info => {
      const vaultBalance = vaultsPositionObj[info.vaultId]
      if (vaultBalance && d(vaultBalance.balance).gt(0)) {
        return true
      }
      return false
    })
  }

  return {
    filterVaultList,
    sortVaultList,
    fetchVaultList,
    vaultPageList,
    getVaultsLpTokenList,
    getVaultsTokenList,
    setVaultPageList
  }
}
