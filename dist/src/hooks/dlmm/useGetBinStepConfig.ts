import { useSdk } from '@cetus/sdk-factory'
import useBinStepConfigStore from '@cetus/stores/src/binStepConfig'
import { camelCaseObject } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { FEE_PRECISION } from '@cetusprotocol/dlmm-sdk'
import { groupBy, sortBy } from 'lodash-es'

export default function useGetBinStepConfig() {
  const { binStepConfig, setBinStepConfig } = useBinStepConfigStore()
  const dlmmSdk = useSdk('dlmm')
  /**
   * 获取bin step list 配置信息
   *
   */
  const fetchBinStepConfig = async () => {
    try {
      const globalConfig = await dlmmSdk?.Config.getDlmmGlobalConfig()
      const binStepList = await dlmmSdk?.Config.getBinStepConfigList(globalConfig?.bin_steps?.id)
      const binStepConfigMap = groupBy(
        sortBy(
          binStepList?.map(item => {
            const fee = (item?.bin_step * item?.base_factor * 10) / FEE_PRECISION
            return {
              ...camelCaseObject(item),
              fee,
              feeDisplay: d(fee).mul(100).toString() + '%',
              title: 'Not Created'
            }
          }),
          'fee'
        ),
        'fee'
      )
      const binStepConfigList = Object.keys(binStepConfigMap).map(item => {
        return {
          fee: item,
          feeDisplay: d(item).mul(100).toString() + '%',
          binStepList: sortBy(binStepConfigMap[item], 'binStep')
        }
      })
      setBinStepConfig(binStepConfigList)
      console.log(binStepConfigList, 'binStepConfigList')
    } catch (error) {
      console.log('🚀 ~ file: useGetRouterConfig.ts:18 ~ fetchRouterConfig ~ error:', error)
    }
  }

  return {
    binStepConfig,
    fetchBinStepConfig
  }
}
