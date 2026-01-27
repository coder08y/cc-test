// import bg_404 from '@/assets/images/bg_404@2x.png'

import { ConnectButton, WalletModal } from '@cetus/design'
import { VStack } from '@chakra-ui/react'
import { useState } from 'react'

export default function WalletTest() {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  return (
    <VStack pt="60px">
      <ConnectButton isCetusPump={false} />
      <WalletModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </VStack>
  )
}
