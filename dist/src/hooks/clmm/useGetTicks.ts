import { useFetch } from '@cetus/hooks'

export default function useGetTicks(id?: string) {
  const { fetchByApi } = useFetch()

  const getTicks = (args: { url: string; poolAddress: string | undefined }) => {
    if (!id) {
      return undefined
    }
    const params = {
      address: args.poolAddress,
      orderBy: 'index',
      limit: 1000
    }

    return fetchByApi(args.url, 'GET', params)
  }

  return {
    getTicks
  }
}
