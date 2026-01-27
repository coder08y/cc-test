import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Switch, Text } from '@chakra-ui/react'

type ZapSwitchProps = {
  value: boolean
  action: 'Deposit' | 'Withdraw'
  onChange: () => void
  padding?: string
}
function ZapSwitch(props: ZapSwitchProps) {
  const { value, action, onChange, padding = '6px 0px' } = props
  const { isApp } = useWindowWidth()
  return envConfigs.env === 'testnet' ? (
    <></>
  ) : (
    <Block bg="none" border="none" padding={padding} borderRadius="8px" width="unset">
      <Popover isLazy trigger={isApp ? 'click' : 'hover'} placement="top" autoFocus={false} returnFocusOnClose={false}>
        <PopoverTrigger>
          <HStack h="14px" cursor="pointer">
            <Text whiteSpace="nowrap" fontSize="14px" color={value ? 'primary' : 'text_paragraph'} fontWeight="500">
              Zap {action === 'Deposit' ? 'In' : 'Out'}
            </Text>
            <Switch
              isChecked={value}
              onChange={() => {
                onChange()
              }}
            />
          </HStack>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverBody p="12px" lineHeight="20px" fontSize="12px">
            {action == 'Deposit'
              ? 'Through Zap-In, you can deposit your liquidity in single token or with customized token ratio. Tokens will be auto converted to match the required ratio. '
              : 'Through Zap-Out, you can withdraw your liquidity in one token. The liquidity will be auto converted to one token you selected.'}
          </PopoverBody>
        </PopoverContent>
      </Popover>
    </Block>
  )
}

export default ZapSwitch
