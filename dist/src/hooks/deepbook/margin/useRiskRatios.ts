import { RiskRatioItem } from '@/components/deepbook/Margin/MarginRiskRatios'
import useDeepBookStore from '@/store/deepbook'
import { formatNumber } from '@cetus/utils'

export const useRiskRatios = () => {
  const currentDeepBookPool = useDeepBookStore(state => state.currentDeepBookPool)
  const riskRatios: RiskRatioItem[] = [
    {
      label: 'LR',
      value: currentDeepBookPool?.liquidationRiskRatio,
      tooltipTitle: 'Liquidation Risk Ratio',
      tooltipContent:
        "If your Margin Risk Level falls below this level, your account will be liquidated. It's recommended to keep your Margin Risk Level safely above this level, as market volatility or interest accrual may push it down and trigger liquidation."
    },
    {
      label: 'MCR',
      //兼容1.4999的情况 需要展示为1.5
      value: formatNumber(currentDeepBookPool?.minBorrowRiskRatio, 2),
      tooltipTitle: 'Min Collateral Risk Ratio',
      tooltipContent:
        'This is the minimum required Collateral Risk Ratio to borrow or add exposure. When your ratio approaches this level, borrowing and position increases will be restricted.'
    },
    {
      label: 'MWR',
      value: currentDeepBookPool?.minWithdrawRiskRatio,
      tooltipTitle: 'Min Withdraw Risk Ratio',
      tooltipContent: 'To withdraw funds to your wallet, your Margin Risk Level must remain above the Min Withdraw Risk Ratio after the withdrawal.'
    }
  ]
  return riskRatios
}
