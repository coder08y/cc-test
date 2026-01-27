import { MSafeWallet } from '@msafe/sui-wallet'
import { useConnectWallet } from '@mysten/dapp-kit'
import { getFullnodeUrl } from '@mysten/sui/client'
import { useEffect } from 'react'

export default function useMsafeAutoConnect() {
  const { mutate: connect } = useConnectWallet()
  // const isInMsafe = MSafeWallet.inMSafeWallet()

  useEffect(() => {
    if (MSafeWallet.inMSafeWallet()) {
      connect({
        wallet: new MSafeWallet('cetus', getFullnodeUrl('mainnet'), 'sui:mainnet'),
        silent: true
      })
    }
  }, [])
}
