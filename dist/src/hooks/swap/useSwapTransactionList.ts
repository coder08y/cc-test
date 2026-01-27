import { useAccountStore } from '@cetus/stores'
import { formatNumber, fromDecimalsAmountFix } from '@cetus/utils'
import { useEffect, useState } from 'react'

export function useSwapTransactionList() {
  const [nextCursor, setNextCursor] = useState('')
  const [historyList, setHistoryList] = useState([]) // 已加载的数据
  const [remainingList, setRemainingList] = useState([]) // 剩余未展示的数据
  const [historyLoading, setHistoryLoading] = useState(false)

  const getWalletSwapHis = async (walletAddress: string, nextCursor: string, accumulatedList = []) => {
    setHistoryLoading(true)
    try {
      const response = await fetch(
        // `https://api.blockvision.org/v2/sui/account/activities?address=${walletAddress}&protocol=cetus amm&cursor=${nextCursor}&packageIds=0x3864c7c59a4889fec05d1aae4bc9dba5a0e0940594b424fbed44cb3f6ac4c032,0x34ef25b60b51f9d07cd9b7dc5b08dfdf26c7b0ff00c57bb17454c161fa6b6b83`,
        `https://api-sui-cf.cetus.zone/proxy/v2/sui/account/activities?address=${walletAddress}&protocol=cetus&cursor=${nextCursor}&packageIds=0x3864c7c59a4889fec05d1aae4bc9dba5a0e0940594b424fbed44cb3f6ac4c032,0x34ef25b60b51f9d07cd9b7dc5b08dfdf26c7b0ff00c57bb17454c161fa6b6b83`,
        {
          method: 'GET',
          headers: {
            accept: 'application/json'
            // 'x-api-key': '2pQ56nlGm5vHmNdH5sqFpEGPENU'
          }
        }
      )
      const result = await response.json()
      const newList = result?.result?.data || []
      const swapList = newList.filter((item: any) => item?.type === 'Swap' && item?.coinChanges?.length <= 3)

      const updatedList: any = [...accumulatedList, ...swapList]
      if (updatedList.length < 10 && result?.result?.nextPageCursor) {
        // 递归请求，直到满足 10 条或无更多数据
        return getWalletSwapHis(walletAddress, result.result.nextPageCursor, updatedList)
      }

      setNextCursor(result?.result?.nextPageCursor || '')
      console.log('🚀 ~ useSwapTransactionList ~ remainingList:', historyList, remainingList, accumulatedList, swapList, [
        ...historyList,
        ...updatedList.slice(0, 10)
      ])

      // 如果 accumulatedList + swapList 超过 10 条，保留多余的部分到 remainingList
      setHistoryList(prev => [...prev, ...updatedList.slice(0, 10)])
      setRemainingList(updatedList.slice(10)) // 保存多余的数据
      setHistoryLoading(false)
    } catch (e) {
      console.log(e, 'error')
      setHistoryLoading(false)
    }
  }
  const getAmount = (amount: string, decimal: number) => {
    console.log('🚀 ~ getAmount ~ decimal:', amount, decimal)
    const result = fromDecimalsAmountFix(amount, decimal).toString()
    const minusSign = result.replace('-', '')
    return amount?.indexOf('-') > -1 ? `-${formatNumber(minusSign, decimal)}` : `+${formatNumber(minusSign, decimal)}`
  }

  const { currentAccount } = useAccountStore()
  useEffect(() => {
    console.log('🚀 ~ useEffect ~ currentAccount?.address:', currentAccount?.address)
    if (!currentAccount?.address) {
      setHistoryList([])
    }
  }, [currentAccount?.address])

  const handleRefreshSwapHis = () => {
    if (currentAccount?.address) {
      setHistoryList([])
      getWalletSwapHis(currentAccount.address, '')
    }
  }
  return {
    handleRefreshSwapHis,
    getAmount,
    getWalletSwapHis,
    nextCursor,
    historyList,
    remainingList, // 需要在组件里一起管理
    historyLoading
  }
}
