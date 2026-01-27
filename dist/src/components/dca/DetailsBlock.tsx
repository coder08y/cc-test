import { Block } from '@cetus/design'
import { HStack, Text, VStack } from '@chakra-ui/react'
import DetailsContent, { detailsDataType } from './DetailsContent'

interface DetailsBlockProps {
  detailsData: detailsDataType
}
export default function DetailsBlock({ detailsData }: DetailsBlockProps) {
  return (
    <Block>
      <VStack gap="20px">
        <HStack w="100%" justify="space-between">
          <Text color="text_caption">Details</Text>
          <Text fontSize="12px">Your first invest cycle will begin immediately</Text>
        </HStack>
        <DetailsContent detailsData={detailsData} />
      </VStack>
    </Block>
  )
}
