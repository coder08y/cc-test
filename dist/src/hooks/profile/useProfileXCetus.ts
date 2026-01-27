import useXCetusStore from '@/store/xcetus/useXCetus'
import { useSdk } from '@cetus/sdk-factory'
import { useAccountStore } from '@cetus/stores'
import { xcetusConfig } from '@cetus/types/src/config/envConfigs'
import { getObjectFields, getPackagerConfigs } from '@cetusprotocol/common-sdk'
import { DividendManager, XCetusUtil, XcetusManager } from '@cetusprotocol/xcetus-sdk'

export function useProfileXCetus() {
  const { currentAccount } = useAccountStore()
  const { setXCetusManager, setDividendManager } = useXCetusStore()
  const xCetusSdk = useSdk('xcetus')

  /**
   * 获取xCetus 基础信息
   * @param veNFT
   */
  const fetchXCetusBaseInfo = async () => {
    try {
      const { xcetus, xcetus_dividends } = xcetusConfig
      const { dividend_manager_id } = getPackagerConfigs(xcetus_dividends)
      const { xcetus_manager_id } = getPackagerConfigs(xcetus)

      const res = await xCetusSdk!.FullClient.batchGetObjects([xcetus_manager_id, dividend_manager_id], {
        showType: true,
        showContent: true
      })

      // 获取 xCetusManager
      const xCetusManagerRes = res.find(item => item.data?.type?.includes('xcetus::XcetusManager'))
      if (xCetusManagerRes) {
        const fields = getObjectFields(xCetusManagerRes)
        const xCetusManager: XcetusManager = {
          id: fields.id.id,
          index: Number(fields.index),
          has_venft: {
            handle: fields.has_venft.fields.id.id,
            size: fields.has_venft.fields.size
          },
          nfts: {
            handle: fields.nfts.fields.id.id,
            size: fields.nfts.fields.size
          },
          total_locked: fields.total_locked,
          treasury: fields.treasury.fields.total_supply.fields.value
        }
        console.log('🚀 ~ fetchXCetusBaseInfo ~ xCetusManager:', xCetusManager)
        setXCetusManager(xCetusManager)
      }

      // 获取 dividendManager
      const dividendManagerRes = res.find(item => item.data?.type?.includes('dividend::DividendManager'))
      if (dividendManagerRes) {
        const fields = getObjectFields(dividendManagerRes)
        const dividendManager: DividendManager = XCetusUtil.buildDividendManager(fields)
        console.log('🚀 ~ fetchXCetusBaseInfo ~ dividendManager:', dividendManager)
        xCetusSdk!.updateCache(`${dividend_manager_id}_getDividendManager`, dividendManager)
        setDividendManager(dividendManager)
      }
    } catch (error) {
      console.log('🚀 ~ fetchXCetusBaseInfo ~ error:', error)
    }
  }

  return { fetchXCetusBaseInfo }
}
