import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { placeholderImg } from '@cetus/ui-kit/src/components/SingleCoinImage'
import { HStack, Image, StackProps, Text } from '@chakra-ui/react'

type VaultsTabItemProps = {
  text: string
  beforeLogo: string
  afterLogo: string
  isLST: boolean
  currentTab: any
  value: string
  onClickVaultsTab: (data: any) => void
  isShowSelect?: boolean
  vaultsTabItemStyle?: StackProps
}
type VaultsTabListProps = {
  currentTab: any
  onClickVaultsTab: (data: any) => void
  vaultsTabWrapStyle?: StackProps
  vaultsTabItemStyle?: StackProps
}
export function VaultsTabItem(props: VaultsTabItemProps) {
  const { beforeLogo, afterLogo, isLST, text, currentTab, value, onClickVaultsTab, isShowSelect = false, vaultsTabItemStyle } = props
  const { isApp } = useWindowWidth()
  return (
    <HStack
      p="10px 12px"
      bg={!isShowSelect ? (currentTab.value == value ? 'primary_opacity.10' : 'bg_secondary') : 'unset'}
      borderRadius="12px"
      border={isApp ? 'none' : '1px solid'}
      borderColor={currentTab.value == value ? 'primary' : 'border_secondary'}
      minHeight={!isShowSelect ? '42px' : 'auto'}
      cursor="pointer"
      userSelect="none"
      onClick={() => onClickVaultsTab({ label: text, value })}
      role="group"
      {...vaultsTabItemStyle}
    >
      {beforeLogo && <Image decoding="async" fallbackSrc={placeholderImg} width="20px" height="20px" src={beforeLogo} />}
      {afterLogo && <Image decoding="async" fallbackSrc={placeholderImg} width="20px" height="20px" src={afterLogo} ml={isLST ? '-16px' : '0'} />}
      {isLST && (
        <Text
          bg="checked_bg"
          borderStyle="1px solid"
          borderColor="border_secondary"
          w="20px"
          h="20px"
          fontSize="10px"
          lineHeight="20px"
          textAlign="center"
          borderRadius="50%"
          ml="-16px"
          color="text_paragraph"
          fontWeight="500"
        >
          +3
        </Text>
      )}
      <Text
        color={!isShowSelect ? (currentTab.value == value ? 'primary' : 'text_paragraph') : 'text_caption'}
        _groupHover={{ color: 'primary' }}
        fontSize={vaultsTabItemStyle?.fontSize}
      >
        {text}
      </Text>
    </HStack>
  )
}

export default function VaultsTabList(props: VaultsTabListProps) {
  const { currentTab, onClickVaultsTab, vaultsTabItemStyle, vaultsTabWrapStyle } = props
  const vaultsTabList = [
    {
      text: 'All Vaults',
      value: 'all'
    },
    {
      text: 'LST',
      value: 'cetus',
      isLST: true,
      beforeLogo: 'https://archive.cetus.zone/assets/image/sui/sui.png',
      afterLogo: 'https://archive.cetus.zone/assets/image/sui/hasui.png'
    },
    {
      text: 'SUI',
      value: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
      beforeLogo: 'https://archive.cetus.zone/assets/image/sui/sui.png'
    },
    {
      text: 'USDC',
      value: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      beforeLogo: 'https://uploader.irys.xyz/EGpc2cG886CrWwLMneF2RyVpZ7D33a6znz6XE8n8nU7h'
    },
    {
      text: 'haSUI',
      value: '0xbde4ba4c2e274a60ce15c1cfff9e5c42e41654ac8b6d906a57efa4bd3c29f47d::hasui::HASUI',
      beforeLogo: 'https://archive.cetus.zone/assets/image/sui/hasui.png'
    }
  ]
  return (
    <HStack {...vaultsTabWrapStyle} flexWrap="wrap">
      {vaultsTabList.map(ele => {
        return (
          <VaultsTabItem
            key={ele.value}
            {...ele}
            currentTab={currentTab}
            onClickVaultsTab={value => onClickVaultsTab(value)}
            vaultsTabItemStyle={vaultsTabItemStyle}
            isShowSelect={false}
          />
        )
      })}
    </HStack>
  )
}
