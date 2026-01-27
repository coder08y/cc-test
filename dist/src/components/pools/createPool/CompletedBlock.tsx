import { Icon } from '@cetus/ui-kit'
import { Button, HStack, Text } from '@chakra-ui/react'

interface CompletedBlockProps {
  onEdit: () => void
  children: React.ReactNode
}
function CompletedBlock({ onEdit, children }: CompletedBlockProps) {
  return (
    <HStack
      w="100%"
      p={{ base: '16px 8px', lg: '20px 32px' }}
      border="0px solid"
      borderColor="border"
      borderRadius="12px"
      bg="bg_fifth"
      justify="space-between"
    >
      {children}
      <Button
        onClick={onEdit}
        variant="unstyled"
        border="1px solid"
        borderColor="border"
        cursor="pointer"
        borderRadius="8px"
        p="5px 8px"
        display="flex"
        h="32px"
        alignItems="center"
        gap="8px"
        minW="auto"
        _hover={{
          p: {
            color: '#fff'
          },
          svg: {
            fill: '#fff'
          }
        }}
      >
        <Icon xlinkHref="#icon-icon_edit1" />
        <Text fontSize="12px" fontWeight="500">
          Edit
        </Text>
      </Button>
    </HStack>
  )
}

export default CompletedBlock
