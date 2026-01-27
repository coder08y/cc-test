import { Icon } from '@cetus/ui-kit'
import { Button, HStack } from '@chakra-ui/react'
import { ClaimAllBtnBlock } from './ClaimAllBtnBlock'

type ExpendItemProps = {
  apiInfo: any
  disabled: boolean
  isOpen: boolean
}

export function TableActions({ isOpen, apiInfo, disabled }: ExpendItemProps) {
  return (
    <HStack justify="flex-end" gap="20px">
      <ClaimAllBtnBlock apiInfo={apiInfo} disabled={disabled} />
      <Button
        w="32px"
        h="90px"
        borderRadius="8px"
        variant="ghost"
        p="0 !important"
        sx={{
          _hover: {
            svg: {
              fill: 'text_caption'
            }
          }
        }}
      >
        <Icon
          svgW="16px"
          xlinkHref="#icon-icon_arrow"
          variant="gray"
          transition="transform 0.5s"
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
        />
      </Button>
    </HStack>
  )
}
