import { aggregatorStatusPath } from '@/apis/path'
import { useFetch } from '@cetus/hooks'
import useWebConfigStore from '@cetus/stores/src/useWebConfigStore'

export default function useGetRouterConfig() {
  const { fetchByApi } = useFetch()
  const { providers: storeProviders, setProviders, setProvidersLoading, providersLoading } = useWebConfigStore()

  /**
   * 获取router配置信息
   * TODO 每次打开调用一次？
   */
  const fetchRouterConfig = async () => {
    try {
      setProvidersLoading(storeProviders.length === 1)
      const res = await fetchByApi(aggregatorStatusPath, 'GET')
      const { providers } = res
      if (providers && providers.length > 0) {
        setProviders(providers)
      }
      console.log('🚀 ~ file: useGetRouterConfig.ts:13 ~ fetchRouterConfig ~ res:', res)
    } catch (error) {
      console.log('🚀 ~ file: useGetRouterConfig.ts:18 ~ fetchRouterConfig ~ error:', error)
    } finally {
      setProvidersLoading(false)
    }
  }

  return {
    fetchRouterConfig,
    providersLoading
  }
}
