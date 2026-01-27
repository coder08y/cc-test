import { Icon } from '@cetus/ui-kit'
import { Button, HStack, Menu, MenuButton, MenuList, Skeleton, VStack } from '@chakra-ui/react'
import { VaultsTabItem, default as VaultsTabList } from './VaultsTab'

type VaultsH5Tab = {
  currentTab: any
  onClickVaultsTab: (data: any) => void
  showSkeletonLoading: boolean
}
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
export default function VaultsH5Tab(props: VaultsH5Tab) {
  const { currentTab, onClickVaultsTab, showSkeletonLoading } = props

  return (
    <>
      {showSkeletonLoading && <Skeleton w="100%" h="40px" borderRadius="12px" />}
      {!showSkeletonLoading && (
        <Menu isLazy>
          {({ isOpen, onClose }) => (
            <>
              <MenuButton
                as={Button}
                variant="outline"
                h="40px"
                w="100%"
                border="1px solid"
                bg="bg_secondary !important"
                borderRadius="12px"
                height="40px"
                lineHeight="16px"
                _hover={{ bg: 'none' }}
                _active={{ bg: 'none' }}
                onClick={() => {
                  console.log('Menu opened or toggled')
                }}
              >
                <HStack gap="0" justify="center">
                  <VaultsTabItem
                    key={currentTab.value}
                    {...vaultsTabList.filter(ele => ele.value == currentTab.value)[0]}
                    currentTab={currentTab.value}
                    isShowSelect={true}
                  />
                  <Icon mt="1px" xlinkHref="#icon-icon_arrow" svgW="16px" svgH="16px" />
                </HStack>
              </MenuButton>

              <MenuList zIndex={9999} p="4px" w="calc(100vw - 24px)" minW="150px">
                <VStack>
                  <VaultsTabList
                    currentTab={currentTab}
                    onClickVaultsTab={data => {
                      onClickVaultsTab(data)
                      onClose()
                    }}
                    vaultsTabWrapStyle={{
                      w: '100%',
                      flexDirection: 'column'
                    }}
                    vaultsTabItemStyle={{
                      width: '100%',
                      justifyContent: 'flex-start'
                    }}
                  />
                </VStack>
              </MenuList>
            </>
          )}
        </Menu>
      )}
    </>
  )
}
