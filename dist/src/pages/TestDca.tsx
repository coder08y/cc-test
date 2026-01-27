import { useGetDcaOrderList } from '@/hooks/dca/useGetDcaOrderList'
import { useEffect } from 'react'

export default function TestDca() {
  const { getDcaOrderList } = useGetDcaOrderList()
  useEffect(() => {
    getDcaOrderList('0x40a76524e8d1d89c1e288ef00b845ea16b9b57375a184bf491a2abce2e015c46')
  }, [])

  return <>1</>
}
