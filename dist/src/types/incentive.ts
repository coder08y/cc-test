export type IncentiveRewardInfo = {
  rewardCoin: any
  rewardNum: string
  inputNum: string
  releaseRate: string | number
  startTime: number // 毫秒时间戳
  endTime: number
  startIsNow: boolean //是否从现在开始
  amountMode?: 'total' | 'perDay'
}
