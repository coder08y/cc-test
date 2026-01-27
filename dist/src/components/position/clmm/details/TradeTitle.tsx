import ZapSwitch from '@/components/zap/ZapSwitch'
import usePositionDetailStore from '@/store/position/detail'
import useZapStore from '@/store/zap'
import { HStack, Text } from '@chakra-ui/react'
import { useEffect } from 'react'

export default function TradeTitle({
  action,
  haveZap,
  resetInputAmount
}: {
  action: 'Deposit' | 'Withdraw'
  haveZap?: boolean
  resetInputAmount?: () => void
}) {
  const { useZapIn, setUseZapIn } = usePositionDetailStore()
  const { setZapAmount, setPreDepositeData } = useZapStore()

  const handleChangeZap = () => {
    resetInputAmount?.()
    setUseZapIn(!useZapIn)
    setZapAmount('')
  }

  useEffect(() => {
    setUseZapIn(false)
    setPreDepositeData(undefined)
  }, [action])

  return (
    <HStack w="100%" justify="space-between" align="center" mb="16px" h="16px">
      <Text color="primary_gray" fontSize="14px">
        {action === 'Withdraw' ? 'Remove Amounts' : 'Deposit Amounts'}
      </Text>
      {haveZap && <ZapSwitch action={action} value={useZapIn} onChange={handleChangeZap} />}
    </HStack>
  )
}
