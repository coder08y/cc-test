import useActiveOrdersStore from '@/store/profile/activeOrders'
import { convertSecondsToString } from '@/utils/dca'
import { useGetToken } from '@cetus/hooks/src/useToken'
import { useSdk } from '@cetus/sdk-factory'
import { CoinType, Token } from '@cetus/types'
import { d, formatNumber, timeFormatUTC } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { DcaOrder } from '@cetusprotocol/dca-sdk'
import Decimal from 'decimal.js'

export function useGetDcaOrderList() {
  const { getTokenListInfo } = useGetToken()
  const { setDcaOrderListLoading, setDcaActiveOrderList, setDcaPastOrderList } = useActiveOrdersStore()
  const dcaSdk = useSdk('dca')

  const getDcaOrderList = async (walletAddress: string, isLoading = true) => {
    console.log('🚀 ~ getDcaOrderList ~ walletAddress:', walletAddress)
    try {
      const list = await dcaSdk!.Dca.getDcaOrders(walletAddress)
      console.log('🚀 ~ getDcaOrderList ~ list:', list)
      if (list && list?.data && list?.data?.length > 0) {
        const { activeResult, pastResult } = await buildDcaOrderList(list?.data)
        console.log('🚀 ~ getDcaOrderList ~ activeResult, pastResult:', { activeResult, pastResult })
        setDcaActiveOrderList(activeResult)
        setDcaPastOrderList(pastResult)
      } else {
        setDcaActiveOrderList([])
        setDcaPastOrderList([])
      }
    } catch (error) {
      console.log('🚀 ~ getDcaOrderList ~ error:', error)
      setDcaActiveOrderList([])
      setDcaPastOrderList([])
    } finally {
      setDcaOrderListLoading(false)
    }
  }

  // Helper: 获取 token 信息
  const getTokenListDetails = async (tokenTypeList: string[]) => {
    try {
      const tokenMap = await getTokenListInfo(tokenTypeList as CoinType[])

      const tokenDetailMap = new Map<string, any>()
      tokenMap?.forEach((value, key) => {
        const decimalsPow = Decimal.pow(10, (value as Token)?.decimals)
        tokenDetailMap.set(key, { token: value, decimalsPow })
      })
      return tokenDetailMap
    } catch (error) {
      console.log('🚀 ~ getTokenListDetails ~ error:', error)
    }
  }

  // Helper: 计算价格区间
  const calculatePriceRanges = (
    inAmountPerCycle: string,
    inCoinDecimalsPow: Decimal,
    outCoinDecimalsPow: Decimal,
    maxOutAmountPerCycle: string,
    minOutAmountPerCycle: string
  ) => {
    const minPrice = d(inAmountPerCycle).div(inCoinDecimalsPow).div(d(maxOutAmountPerCycle).div(outCoinDecimalsPow)).toString()

    const maxPrice = d(inAmountPerCycle).div(inCoinDecimalsPow).div(d(minOutAmountPerCycle).div(outCoinDecimalsPow)).toString()

    return {
      minPrice,
      maxPrice,
      minPriceResever: d(1).div(d(maxPrice)).toString(),
      maxPriceResever: d(1).div(d(minPrice)).toString()
    }
  }

  // Helper: 确定订单状态
  const determineOrderStatus = (order: any) => {
    if (order.in_withdrawn > 0 && order.in_withdrawn == order.in_deposited) {
      // 订单关闭 = 提取incoin数量大于0并且等于总支付incoin数量
      return 'Close'
    } else if (order.in_withdrawn > 0 && order.out_withdrawn > 0) {
      // 部分成交 = 提取数量大于0并且可提取outcoin数量大于0
      return 'PartialDeal'
    } else if (order.amount_left_next_cycle == 0 && order.next_cycle_at == 0) {
      // 完全成交 = 订单下次支付数量为0并且下次执行时间为0
      return 'AllDeal'
    }
    return 'Active'
  }

  // Helper: 计算订单当前价格及相关数据
  const calculateCurrentOrderMetrics = (
    orderStatus: string,
    inDeposited: Decimal,
    inWithdrawn: Decimal,
    inBalance: Decimal,
    outBalance: Decimal,
    outWithdraw: Decimal,
    inCoinDecimalsPow: Decimal
  ) => {
    const calculateReseverPrice = (price: string) => (price === '--' ? '--' : d(1).div(price).toString())

    switch (orderStatus) {
      case 'Close':
        return {
          currentAvgPrice: '--',
          currentAvgPriceResever: '--',
          inBalanceRatio: '0',
          inDepositedOut: '0'
        }
      case 'PartialDeal': {
        const currentAvgPrice = inDeposited.sub(inWithdrawn).div(outWithdraw).toString()
        const inBalanceRatio = inDeposited.sub(inWithdrawn).div(inDeposited).mul(100).toDP(2, Decimal.ROUND_HALF_UP).toString()
        return {
          currentAvgPrice,
          currentAvgPriceResever: calculateReseverPrice(currentAvgPrice),
          inBalanceRatio,
          inDepositedOut: inDeposited.sub(inWithdrawn).toString()
        }
      }
      case 'AllDeal': {
        const currentAvgPrice = inDeposited.div(outWithdraw).toString()
        return {
          currentAvgPrice,
          currentAvgPriceResever: calculateReseverPrice(currentAvgPrice),
          inBalanceRatio: '100',
          inDepositedOut: inDeposited.sub(inBalance).toString()
        }
      }
      case 'Active': {
        const currentAvgPrice = outBalance.gt(0) || outWithdraw.gt(0) ? inDeposited.sub(inBalance).div(outBalance.add(outWithdraw)).toString() : '--'
        const inBalanceRatio = inDeposited.sub(inBalance).div(inDeposited).mul(100).toDP(2, Decimal.ROUND_HALF_UP).toString()
        return {
          currentAvgPrice,
          currentAvgPriceResever: calculateReseverPrice(currentAvgPrice),
          inBalanceRatio,
          inDepositedOut: inDeposited.sub(inBalance).toString()
        }
      }
      default:
        return {
          currentAvgPrice: '--',
          currentAvgPriceResever: '--',
          inBalanceRatio: '0',
          inDepositedOut: '0'
        }
    }
  }

  // Helper: 是否显示提示

  const shouldShowTradeTips = (createdAt: number, cycleFrequency: number, outBalance: Decimal, outWithdraw: Decimal): boolean => {
    const nowTime = Date.now() / 1000
    const executedTimes = d(nowTime).sub(createdAt).div(cycleFrequency)
    const noRewards = outBalance.lte(0) && d(outWithdraw).lte(0)

    return executedTimes.gt(3) && noRewards
  }

  // Main Function
  const buildDcaOrderList = async (list: DcaOrder[]) => {
    const activeResult: any[] = []
    const pastResult: any[] = []
    const coinTypeList: Set<string> = new Set()
    list?.forEach(item => {
      coinTypeList.add(fixCoinType(item.in_coin_type, false))
      coinTypeList.add(fixCoinType(item.out_coin_type, false))
    })

    const tokenDetailMap = await getTokenListDetails(Array.from(coinTypeList) as CoinType[])

    if (tokenDetailMap) {
      for (const order of list) {
        // Step 1: 获取 token 信息
        try {
          const { token: inCoin, decimalsPow: inCoinDecimalsPow } = tokenDetailMap.get(fixCoinType(order.in_coin_type, false))
          const { token: outCoin, decimalsPow: outCoinDecimalsPow } = tokenDetailMap.get(fixCoinType(order.out_coin_type, false))

          // Step 2: 计算基本数据
          const inDeposited = d(order.in_deposited).div(inCoinDecimalsPow)
          // console.log('🚀 ~ buildDcaOrderList ~ order.in_deposited:', order.in_deposited, inCoinDecimalsPow)
          const cycleCount = d(order.in_deposited).div(order.in_amount_per_cycle).floor().toString()
          const inAmountPerCycle = d(order.in_amount_per_cycle).div(inCoinDecimalsPow).toString()
          const inBalance = d(order.in_balance).div(inCoinDecimalsPow)
          const inWithdrawn = d(order.in_withdrawn).div(inCoinDecimalsPow)
          const outBalance = d(order.out_balance).gt(0) ? d(order.out_balance).div(outCoinDecimalsPow) : d(0)
          const outWithdraw = d(order.out_withdrawn).div(outCoinDecimalsPow)
          const eachOrderSize = formatNumber(inDeposited.div(cycleCount).toString())
          const ofOrderLeft = inBalance.div(inAmountPerCycle).floor().toNumber()

          // Step 3: 计算价格区间
          const { minPrice, maxPrice, minPriceResever, maxPriceResever } = calculatePriceRanges(
            order.in_amount_per_cycle,
            inCoinDecimalsPow,
            outCoinDecimalsPow,
            order.max_out_amount_per_cycle,
            order.min_out_amount_per_cycle
          )

          // Step 4: 确定订单状态
          const orderStatus = determineOrderStatus(order)

          // Step 5: 计算订单当前价格及其他相关数据
          const { currentAvgPrice, currentAvgPriceResever, inBalanceRatio, inDepositedOut } = calculateCurrentOrderMetrics(
            orderStatus,
            inDeposited,
            inWithdrawn,
            inBalance,
            outBalance,
            outWithdraw,
            inCoinDecimalsPow
          )
          const isShowTradeTips = shouldShowTradeTips(Number(order.created_at), Number(order.cycle_frequency), outBalance, outWithdraw)

          // Step 6: 构造订单项
          const orderItem = {
            createAt: timeFormatUTC(Number(order.created_at) * 1000, 'YMDHM'),
            cycleFrequency: order.cycle_frequency,
            orderID: order.id,
            inAmountPerCycle,
            nextCycleAt: timeFormatUTC(Number(order.next_cycle_at) * 1000, 'YMDHM'),
            inDeposited: inDeposited.toString(),
            cycleCount,
            inDepositedOut,
            inBalance: inBalance.toString(),
            minPrice: formatNumber(minPrice),
            maxPrice: formatNumber(maxPrice),
            minPriceResever: formatNumber(minPriceResever),
            maxPriceResever: formatNumber(maxPriceResever),
            inCoin,
            outCoin,
            outBalance: outBalance.toString(),
            inBalanceRatio,
            outWithdraw: outWithdraw.toString(),
            investEvery: convertSecondsToString(Number(order.cycle_frequency)),
            eachOrderSize,
            currentAvgPrice: currentAvgPrice === '--' ? '--' : formatNumber(currentAvgPrice, (outCoin as Token).decimals),
            currentAvgPriceResever: currentAvgPrice === '--' ? '--' : formatNumber(currentAvgPriceResever, (inCoin as Token).decimals),
            orderStatus,
            inWithdrawn: inWithdrawn.toString(),
            ofOrderLeft,
            isShowTradeTips,
            next_cycle_at: order.created_at + ofOrderLeft * Number(order.cycle_frequency),
            nextCycleAtTimeStamp: Number(order.next_cycle_at) * 1000,
            created_at: order.created_at,
            version: order.version
          }

          if (orderStatus === 'Active') {
            activeResult.push(orderItem)
          } else {
            pastResult.push(orderItem)
          }
        } catch (error) {
          console.log('🚀 ~ buildDcaOrderList ~ error:', error)
        }
      }
    }

    const sortActiveResult = activeResult?.sort((a, b) => {
      return b.version - a.version
    })
    const sortPastResult = pastResult?.sort((a, b) => {
      return b.version - a.version
    })
    console.log('🚀 ~ buildDcaOrderList ~ activeResult, pastResult:', { activeResult, pastResult })
    return { activeResult: sortActiveResult, pastResult: sortPastResult }
  }

  return { getDcaOrderList, buildDcaOrderList }
}
