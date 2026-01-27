import { Token } from '@cetus/types'
import { LimitOrderStatus } from '@cetusprotocol/limit-sdk'

export type LimitOrderEvent = {
  event_type: string
  tx: string
  block_time: number
  order_id: string
  amount: string
}

export type LimitOrderInfo = {
  order_id: string
  pay_coin: Token
  target_coin: Token
  // 价格
  price: string
  // 反向价格
  reseverPrice: string
  // 总共支付数量
  total_pay_amount: string
  // 期望得到数量
  expect_obtain_amount: string
  // 剩余支付数量
  remaining_amount: string
  // 成交支付数量
  deal_amount: string
  // 处理进度百分比
  deal_rate: string
  // 获得目标数量
  obtained_amount: string
  // 已claim 目标数量
  claimed_amount: string
  // 未claim  目标数量
  un_claimed_amount: string
  // 创建时间
  created_ts: number
  // 过期时间
  expire_ts: number
  // 订单状态
  status: LimitOrderStatus
  // 事件记录
  events?: LimitOrderEvent[]
}
