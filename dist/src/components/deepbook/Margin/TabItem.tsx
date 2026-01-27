import { Text } from '@chakra-ui/react'

export const TabItem = ({
  active,
  children,
  onClick,
  hasBg = false,
  cursor = 'pointer',
  ...reset
}: {
  active?: boolean
  children: React.ReactNode
  onClick?: () => void
  hasBg?: boolean
  opacity?: number
  cursor?: string
} & React.HTMLAttributes<HTMLDivElement>) => (
  <Text
    as="div"
    fontSize="12px"
    lineHeight="16px"
    cursor={cursor}
    p="4px 12px"
    bg={active ? 'primary_opacity.10' : hasBg ? 'background' : 'transparent'}
    onClick={onClick}
    fontWeight={active ? '500' : '400'}
    color={active ? 'primary' : 'text_paragraph'}
    borderRadius="6px"
    _hover={{
      color: 'primary'
    }}
    {...reset}
  >
    {children}
  </Text>
)
