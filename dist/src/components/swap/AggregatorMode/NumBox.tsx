import { HStack, Text } from '@chakra-ui/react'

type NumBoxProps = {
  num: number
  total?: number
}

function NumBox({ num, total }: NumBoxProps) {
  return (
    <HStack h="16px" lineHeight="16px" p="2px 8px" borderRadius="8px" bg="aggregator_switch" gap="0px">
      <Text as="div" display="inline-block" fontSize="10px" h="10px" lineHeight="10px" color="primary">
        {num}&nbsp;
      </Text>
      {total !== undefined && (
        <Text as="div" display="inline-block" fontSize="10px" h="10px" lineHeight="10px" color="text_paragraph">
          / {total}
        </Text>
      )}
    </HStack>
  )
}

export default NumBox
