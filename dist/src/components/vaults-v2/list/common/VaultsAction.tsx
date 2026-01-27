import { Icon } from '@cetus/ui-kit'
import { Button, Stack } from '@chakra-ui/react'

export function VaultsAction({
  isOpen,
  jumpVaultsDetail,
  onExpand,
  isFrozen,
  status,
  isMigrate
}: {
  onExpand?: () => void
  isOpen: boolean
  jumpVaultsDetail: () => void
  isFrozen: boolean
  status: string
  isMigrate: boolean
}) {
  return (
    <Stack
      w={{ base: '100%', lg: 'auto' }}
      flexDir={{ base: 'column', lg: 'row' }}
      justifyContent={{ base: 'center', lg: 'end' }}
      align="center"
      gap={{ base: '8px', lg: '12px' }}
    >
      <Button
        fontSize="14px"
        h={{ base: '40px', lg: '32px' }}
        w={{ base: '100%', lg: '100px' }}
        variant="outline"
        borderRadius="8px"
        onClick={jumpVaultsDetail}
        isDisabled={isFrozen}
      >
        {isMigrate ? 'Migrate' : status == 'sunset' || status == 'sunsetSoon' ? 'Withdraw' : 'Deposit'}
      </Button>
      <Button
        variant="unstyled"
        _hover={{
          bg: 'button_ghost_hov_bg',
          svg: {
            fill: 'text_caption'
          }
        }}
        w={{ base: '100%', lg: '32px' }}
        h={{ base: '40px', lg: '32px' }}
        minW="unset"
        minH="unset"
        bg="button_ghost_bg"
        display="flex"
        justifyContent="center"
        alignItems="center"
        borderRadius="8px"
        border="1px solid"
        borderColor="border"
        onClick={onExpand ? onExpand : () => {}}
      >
        <Icon
          svgW="16px"
          xlinkHref="#icon-icon_arrow"
          variant="gray"
          transition="transform 0.5s"
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
        />
      </Button>
    </Stack>
  )
}
