import useDeepBookStore from '@/store/deepbook'

export default function useGetOrderBestPrice() {
  const { deepBookAskList, deepBookBidList } = useDeepBookStore()

  const getOrderBestPrice = (orderType: 'bid' | 'ask') => {
    const price = (orderType === 'bid' ? deepBookAskList[0]?.price : deepBookBidList[0]?.price) || '0'
    return price
  }

  return { getOrderBestPrice }
}
