import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Switch, Text } from '@chakra-ui/react'

type ZapTooltipTextType = {
  [key: string]: string
}
const ZapTooltipText: ZapTooltipTextType = {
  customDeposit:
    'Through Zap-In, you can deposit your liquidity in single token or with customized token ratio. Tokens will be auto converted to match the required ratio. ',
  deposit: 'Through Zap-In, you can deposit your liquidity in single token. Tokens will be auto converted to match the required ratio.',
  withdraw: 'Through Zap-Out, you can withdraw your liquidity in one token. The liquidity will be auto converted to one token you selected.'
}

type ZapSwitchProps = {
  zapText: string
  isCheckedZAP: boolean
  tooltipType: 'customDeposit' | 'deposit' | 'withdraw'
  zapSwitchChange: (status: boolean) => void
}
function ZapSwitch(props: ZapSwitchProps) {
  const { isCheckedZAP, zapText, tooltipType, zapSwitchChange } = props
  const { isApp } = useWindowWidth()
  return (
    <Block bg="none" border="none" padding={{ base: '3px 0', lg: '6px 0' }} borderRadius="8px" width="unset">
      <Popover isLazy trigger={isApp ? 'click' : 'hover'} placement="top" autoFocus={false} returnFocusOnClose={false}>
        <PopoverTrigger>
          <HStack h="14px" cursor="pointer" as="button">
            <Text fontSize="14px" color={isCheckedZAP ? 'primary' : ''} fontWeight="500">
              {zapText}
            </Text>
            <Switch isChecked={isCheckedZAP} onChange={() => zapSwitchChange(!isCheckedZAP)} />
          </HStack>
        </PopoverTrigger>
        <PopoverContent minW="fit-content" w="fit-content">
          <PopoverBody p="12px" lineHeight="20px" fontSize="12px" maxWidth="320px">
            {ZapTooltipText[tooltipType]}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Block>
  )
}

export default ZapSwitch
