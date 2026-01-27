import { Icon } from '@cetus/ui-kit'
import { Button, ButtonProps } from '@chakra-ui/react'

type ActionButtonProps = {
  type: 'Add' | 'Sub'
  onClick: (data?: any) => void
  disabled?: boolean
  wrapStyle?: ButtonProps
}
export default function ActionButton(props: ActionButtonProps) {
  const { type, onClick, disabled, wrapStyle = {} } = props
  return (
    <Button
      variant="unstyled"
      display="flex"
      justifyContent="center"
      alignItems="center"
      minW={{ base: '32px', lg: '24px' }}
      w={{ base: '32px', lg: '24px' }}
      h={{ base: '32px', lg: '24px' }}
      bg="bg_secondary"
      border="1px solid"
      borderColor="border"
      borderRadius={{ base: '6px', lg: '8px' }}
      lineHeight="1"
      cursor={disabled ? 'not-allowed' : 'pointer'}
      onClick={onClick}
      isDisabled={disabled}
      _hover={{
        color: disabled ? 'text_paragraph' : 'text_caption',
        svg: {
          fill: disabled ? 'text_paragraph' : 'text_caption'
        }
      }}
      {...wrapStyle}
    >
      <Icon cursor={disabled ? 'not-allowed' : 'pointer'} xlinkHref={type === 'Add' ? '#icon-a-icon_add1' : '#icon-tx_remove'} fontSize="14px" />
    </Button>
  )
}
