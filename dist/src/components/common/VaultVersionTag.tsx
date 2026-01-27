import { HStack, StackProps, Text } from '@chakra-ui/react'

export default function VaultVersionTag({ version, poolType, wrapStyle }: { version: string; poolType: string; wrapStyle?: StackProps }) {
  return (
    <HStack h="18px" p="0px 8px" borderRadius="10px" border="1px solid" borderColor="border" gap="0px" bg="bg_secondary" {...wrapStyle}>
      <Text fontSize="11px" color={poolType === 'clmm' ? 'primary' : 'primary_green'}>
        {version === 'V1' ? 'V1' : 'V2'}
      </Text>
    </HStack>
  )
}
