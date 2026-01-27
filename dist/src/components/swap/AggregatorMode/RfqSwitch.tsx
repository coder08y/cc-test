import { HStack, SwitchProps } from '@chakra-ui/react'
import { RfqLogoTitle } from '../rfq/RfqLogoTitle'
import AggregatorSwitch from './AggregatorSwitch'

function RfqSwitch(props: SwitchProps) {
  const { isChecked, onChange } = props
  return (
    <HStack
      mt="-8px"
      mb="-8px"
      w="100%"
      justify="space-between"
      h="52px"
      border="1px solid"
      borderColor="transparent"
      borderBottomColor="border"
      borderTopColor="border"
    >
      <RfqLogoTitle showTooltipIcon={true} />

      <AggregatorSwitch isChecked={isChecked} onChange={onChange} />
    </HStack>
  )
}

export default RfqSwitch
