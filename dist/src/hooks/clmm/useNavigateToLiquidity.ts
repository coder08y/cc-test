import useLiquidityStore from '@/store/clmm'
import useDlmmLiquidityStore from '@/store/dlmm'
import { useNavigate } from 'react-router-dom'
import useWrapPoolData from '../pool/useWrapPoolData'

export default function useNavigateToLiquidity() {
  const navigate = useNavigate()
  const { setApiPoolInfo } = useLiquidityStore()
  const { setDlmmApiPoolInfo } = useDlmmLiquidityStore()
  const { wrapPoolData, wrapDLmmPoolData } = useWrapPoolData()
  const goLiquidity = (url: string, poolApiInfo: any) => {
    setApiPoolInfo(wrapPoolData(poolApiInfo))
    navigate(url)
  }

  const goDlmmLiquidity = (url: string, poolApiInfo: any) => {
    setDlmmApiPoolInfo(wrapDLmmPoolData(poolApiInfo))
    navigate(url)
  }

  return {
    goLiquidity,
    goDlmmLiquidity
  }
}
