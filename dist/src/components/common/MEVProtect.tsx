import MEV_ICON from '@/assets/images/logo_mev@2x.png'
import useGlobalStore from '@/store/common/global'
import { CetusTooltip } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { Center, HStack, Image, Switch, Text, VStack } from '@chakra-ui/react'

function MEVProtect() {
  const { mevProtect, setMevProtect } = useGlobalStore()
  return (
    <CetusTooltip
      tooltip={
        <VStack w="100%" gap="12px">
          <HStack w="100%" justify="space-between">
            <HStack>
              <Image src={MEV_ICON} w="20px" h="20px" />
              <Text fontSize="14px" color="text_caption">
                MEV Protect
              </Text>
            </HStack>
            <Switch isChecked={mevProtect} onChange={() => setMevProtect(!mevProtect)} />
          </HStack>
          <Text fontSize="12px" lineHeight="20px">
            By enabling this, your txn will be submitted via 3rd party MEV service provider. MEV value retained will be redistributed to all users who
            successfully execute their trades with Shio through its point campaign.
          </Text>
        </VStack>
      }
    >
      <Center w="28px" h="28px" border="1px solid" borderColor="border" borderRadius="8px" bg="bg_secondary" cursor="pointer">
        <Icon xlinkHref="#icon-icon_mev" svgFill={mevProtect ? 'text_highlight' : 'text_paragraph'} />
      </Center>
    </CetusTooltip>
  )
}

export default MEVProtect
