import { useAccountStore } from '@cetus/stores'
import { Button } from '@chakra-ui/react'
import { useCurrentWallet } from '@mysten/dapp-kit'

const TestSignMessage = () => {
  const { currentAccount } = useAccountStore()
  const { currentWallet } = useCurrentWallet()

  const signMessage = async () => {
    if (!currentAccount?.address) {
      throw new Error('Wallet not connected')
    }
    console.log('🚀🚀🚀 ~ file: TestSignMessage.tsx:15 ~ signMessage ~ currentWallet:', currentWallet)
    console.log('🚀🚀🚀 ~ file: TestSignMessage.tsx:15 ~ signMessage ~ currentWallet?.features:', currentWallet?.features)
    console.log(
      '🚀🚀🚀 ~ file: TestSignMessage.tsx:15 ~ signMessage ~ currentWallet?.features[sui:signMessage]:',
      currentWallet?.features['sui:signMessage']
    )
    console.log('🚀🚀🚀 ~ file: TestSignMessage.tsx:28 ~ signMessage ~ JSON.stringify(currentWallet):', JSON.stringify(currentWallet))
    const signature = await currentWallet?.features['sui:signMessage'].signMessage({
      message: '',
      account: currentAccount
    })

    const signatureBuffer = Buffer.from(signature.signature)
    return signatureBuffer
  }

  const signPersonalMessage = async () => {
    if (!currentAccount?.address) {
      throw new Error('Wallet not connected')
    }

    console.log('🚀🚀🚀 ~ file: TestSignMessage.tsx:15 ~ signMessage ~ currentWallet:', currentWallet)
    console.log('🚀🚀🚀 ~ file: TestSignMessage.tsx:15 ~ signMessage ~ currentWallet?.features:', currentWallet?.features)
    console.log(
      '🚀🚀🚀 ~ file: TestSignMessage.tsx:15 ~ signMessage ~ currentWallet?.features[sui:signMessage]:',
      currentWallet?.features['sui:signMessage']
    )
    console.log('🚀🚀🚀 ~ file: TestSignMessage.tsx:28 ~ signMessage ~ JSON.stringify(currentWallet):', JSON.stringify(currentWallet))
    const signature = await currentWallet?.features['sui:signPersonalMessage'].signPersonalMessage({
      message: new TextEncoder().encode(new Uint8Array().toString()),
      account: currentAccount
    })

    const signatureBuffer = Buffer.from(signature.signature)
    return signatureBuffer
  }
  return (
    <div>
      <Button onClick={() => signMessage()}>signMessage</Button>
      <Button onClick={() => signPersonalMessage()}>signPersonalMessage</Button>
    </div>
  )
}

export default TestSignMessage
