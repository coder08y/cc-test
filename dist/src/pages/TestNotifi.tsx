import useNotifiSubscription from '@/hooks/notifi/useNotifiSubscription'
import { useAccountStore } from '@cetus/stores'
import { Button } from '@chakra-ui/react'

export default function TestNotifi() {
  const { notifiSubscription } = useNotifiSubscription()
  const { currentAccount } = useAccountStore()

  return <Button onClick={() => notifiSubscription()}>notifiSubscription</Button>
}
