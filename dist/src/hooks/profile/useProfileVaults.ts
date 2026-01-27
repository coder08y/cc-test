import useProfileStore from '@/store/profile'
import useVaultsFarmingStore from '@/store/vaults-farming'
import useVaultsPositionStore from '@/store/vaults-v2/useVaultsPosition'
import { isAvailableObject } from '@cetus/utils'
import useGetVaultPoolList from '../vault-v2/useGetVaultPoolList'
import useGetVaultsContract from '../vault-v2/useGetVaultsContract'
import useGetVaultsPosition from '../vault-v2/useGetVaultsPosition'
import useVaultList from '../vault-v2/useVaultList'
import useGetVaultsFarmingApiInfo from '../vaults-farming/useGetVaultsFarmingApiInfo'

export default function useProfileVaults() {
  const { getVaultsTokenList, getVaultsLpTokenList } = useVaultList()
  const { getVaultsContractInfo } = useGetVaultsContract()
  const { getVaultsPosition } = useGetVaultsPosition()
  const { clearVaultsPositionObj } = useVaultsPositionStore()
  const { getVaultPoolList } = useGetVaultPoolList()
  const { isAutoRefresh } = useProfileStore()
  const { getHaedalFarmingList } = useGetVaultsFarmingApiInfo()
  const { vaultsFarmObj } = useVaultsFarmingStore()

  const fetchVaultsPositionList = async () => {
    console.log('🚀🚀🚀 ~ useProfileVaults.ts:20 ~ fetchVaultsPositionList ~ isAutoRefresh:', isAutoRefresh)
    let vaultsFarmInfoObj = vaultsFarmObj
    if (!isAvailableObject(vaultsFarmInfoObj)) {
      const { vaultsFarmObj: obj } = await getHaedalFarmingList()
      vaultsFarmInfoObj = obj
    }
    const { poolList: list } = await getVaultPoolList()
    console.log('🚀🚀🚀 ~ useProfileVaults.ts:27 ~ fetchVaultsPositionList ~ vaultsFarmInfoObj:', vaultsFarmInfoObj)

    // const vaultsList = await fetchVaultList({
    //   sortOptions: {
    //     sortRule: 'desc',
    //     sortType: 'tvl'
    //   },
    //   currentTab: 'all',
    //   isYourHoldings: false,
    //   selectCoinList: []
    // })
    console.log('🚀 ~ fetchVaultsPositionList ~ vaultsList:', list)
    getVaultsTokenList(list)
    getVaultsLpTokenList(list)
    // const { lstVaultContractInfoObj, haedalVaultContractInfoObj, allClmmPoolContractInfoObj } = await getVaultsContractInfo(list)
    await getVaultsPosition(list, vaultsFarmInfoObj)
  }

  const resetUserData = () => {
    console.log('🚀🚀🚀 ~ useProfileVaults.ts:39 ~ resetUserData ~ clearVaultsPositionObj:', clearVaultsPositionObj)
    clearVaultsPositionObj()
  }
  return { fetchVaultsPositionList, resetUserData }
}
