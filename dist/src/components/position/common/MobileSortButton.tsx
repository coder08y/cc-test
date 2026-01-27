import { Icon } from '@cetus/ui-kit'
import { cancelBubble } from '@cetus/utils'
import { Button, HStack, Text } from '@chakra-ui/react'

export type SortOption = {
  label: string
  value: string
}

interface MobileSortButtonProps {
  sortBy: SortOption
  sortRule: 'asc' | 'desc'
  onClick: () => void
}

function MobileSortButton({ sortBy, sortRule, onClick }: MobileSortButtonProps) {
  return (
    <Button
      onClick={e => {
        cancelBubble(e)
        onClick()
      }}
      h="44px"
      p="12px 3px"
      bg="transparent"
      _hover={{
        bg: 'transparent'
      }}
      _active={{
        bg: 'transparent'
      }}
      sx={{
        '& > div': {
          gap: '4px'
        }
      }}
    >
      <HStack gap="4px" justify="space-between" w="100%">
        <Text fontSize="12px" color="primary">
          Sort
        </Text>
        <Icon
          xlinkHref={sortBy.value ? (sortRule == 'desc' ? '#icon-icon_sort2' : '#icon-icon_sort_asc1') : '#icon-icon_sort2'}
          fontSize="16px"
          svgFill="primary"
        />
      </HStack>
    </Button>
  )
}

export default MobileSortButton
