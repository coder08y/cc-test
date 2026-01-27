import { CheckBox } from '@cetus/ui-kit'
import { HStack, Text } from '@chakra-ui/react'

type AutoClaimCheckBoxProps = {
  checked: boolean
  isDisabled?: boolean
  onChange: (checked: boolean) => void
}

export function AutoClaimCheckBox({ checked, onChange, isDisabled = false }: AutoClaimCheckBoxProps) {
  return (
    <HStack
      gap="8px"
      borderRadius="12px"
      bg="rgba(118, 200, 255, 0.1)"
      w="100%"
      p="12px"
      alignItems="center"
      sx={{
        div: {
          svg: { fill: '#000 !important', width: '16px', height: '16px' }
        }
      }}
    >
      <CheckBox
        height="16px"
        width="16px"
        isDisabled={isDisabled}
        wrapStyle={{
          border: '1px solid',
          borderColor: !checked ? 'primary' : 'transparent',
          bg: checked ? 'primary' : 'transparent'
        }}
        checked={checked}
        onClick={() => onChange(!checked)}
      />
      <Text color="primary" fontSize="12px">
        Automatically harvest claimable yield
      </Text>
    </HStack>
  )
}
