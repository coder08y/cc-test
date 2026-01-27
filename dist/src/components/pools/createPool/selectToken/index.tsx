import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { mockInterval } from '@cetus/utils'
import { useCallback, useEffect, useRef } from 'react'
import { PoolType } from '../SelectPoolType'
import SelectCLMMToken from './SelectCLMMToken'
import SelectDLMMToken from './SelectDLMMToken'
import { SelectCLMMTokenProps, SelectDLMMTokenProps } from './type'

type SelectTokenProps = SelectCLMMTokenProps | SelectDLMMTokenProps

function SelectToken({ poolType, ...props }: SelectTokenProps & { poolType: PoolType }) {
  const { baseToken, quoteToken } = props
  const { fetchTokenPrices } = useTokenPrice()
  const timer = useRef<any>(null)
  const fetchCurrentTokensPrice = useCallback(async () => {
    const getPrice = async () => {
      if (baseToken?.coin_type && quoteToken?.coin_type) {
        console.log('fetchCurrentTokensPrice called')
        await fetchTokenPrices([baseToken?.coin_type, quoteToken?.coin_type])
      }
    }

    await getPrice()
    const { clear } = mockInterval(getPrice, 5000)
    timer.current = clear
  }, [baseToken?.coin_type, quoteToken?.coin_type])

  useEffect(() => {
    fetchCurrentTokensPrice()
    return () => {
      console.log('clear timer', timer.current)
      timer.current?.()
    }
  }, [fetchCurrentTokensPrice])
  return poolType === 'dlmm' ? <SelectDLMMToken {...props} /> : <SelectCLMMToken {...props} />
}

export default SelectToken
