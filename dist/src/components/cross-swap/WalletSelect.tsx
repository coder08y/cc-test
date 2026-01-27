import { addressAbridge } from '@cetus/utils'
import { Button, Text } from '@chakra-ui/react'

type WalletSelectProps = {
  walletAddress?: string
  onConnectWallet?: () => void
}
export default function WalletSelect(props: WalletSelectProps) {
  const { walletAddress, onConnectWallet } = props
  return (
    <>
      <Button
        _hover={{
          bg: 'primary_opacity.10'
        }}
        variant="unstyled"
        display="flex"
        alignItems="center"
        borderRadius="4px"
        gap="8px"
        cursor="pointer"
        h="20px"
        pl="4px"
        pr="4px"
        mr="-4px"
        onClick={onConnectWallet}
      >
        <Text color="primary">{walletAddress ? addressAbridge(walletAddress) : 'Connect Wallet'}</Text>
      </Button>
    </>
  )
}
