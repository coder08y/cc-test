import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { textEllipses } from '@cetus/utils'
import { Button, HStack, Menu, MenuButton, MenuList, Text, VStack } from '@chakra-ui/react'

function NewMenuButton({
  current,
  handleChange,
  menuList,
  title
}: { current: any; handleChange: (item: string) => void; menuList: any; title: string }) {
  console.log('🚀 ~ NewMenuButton ~ current:', current, menuList)
  return (
    <Menu isLazy>
      {({ isOpen, onClose }) => (
        <>
          <MenuButton
            w={{ base: '50%', lg: '160px' }}
            bg="bg_secondary !important"
            border="1px solid"
            borderColor="border"
            borderRadius={{ base: '8px', lg: '12px' }}
            _hover={{ bg: 'bg_secondary !important', svg: { fill: 'text_caption' } }}
            _active={{ bg: 'bg_secondary !important', svg: { fill: 'text_caption' } }}
            isActive={isOpen}
            as={Button}
            p="0 12px !important"
            h={{ base: '32px', lg: '40px' }}
          >
            <HStack w="100%" justifyContent="space-between" gap="4px">
              <Text fontSize="12px">{title}</Text>
              <HStack justifyContent="flex-end" gap="4px">
                {title == 'Pools' && current?.value !== 'All' && (
                  <SingleCoinImage w="20px" h="20px" imgBoxStyle={{ w: '20px', h: '20px' }} showTag={false} imageUrl={current?.logo_url} />
                )}
                <Text color="text_caption" fontSize="12px">
                  {title == 'Pools' && current?.value !== 'All' ? textEllipses(current?.symbol, 6) : current?.value}
                </Text>
                <Icon xlinkHref="#icon-icon_descending_nor" transition="transform 0.5s" transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'} />
              </HStack>
            </HStack>
          </MenuButton>
          <MenuList w={{ base: 'calc(100vw - 24px)', lg: '160px' }} minW="unset" p="0">
            <VStack w="100%" p="4px" gap="0px">
              {menuList.map((item: any) => {
                console.log('🚀 ~ NewMenuButton ~ item:', current, item)
                return (
                  <HStack
                    onClick={e => {
                      handleChange(item)
                      onClose()
                    }}
                    h={{ base: '32px', lg: '40px' }}
                    key={item?.value}
                    w="100%"
                    p="0 12px"
                    bg={item?.value == current?.value ? 'primary_opacity.10' : 'none'}
                    _hover={{ cursor: 'pointer', p: { color: 'text_caption' } }}
                    borderRadius="8px"
                    justifyContent={title == 'Pools' ? 'flex-start' : 'center'}
                  >
                    {title == 'Pools' && item?.value !== 'All' && (
                      <SingleCoinImage w="20px" h="20px" imgBoxStyle={{ w: '20px', h: '20px' }} showTag={false} imageUrl={item?.logo_url} />
                    )}
                    <Text fontSize="12px" cursor="pointer" color={item?.value == current?.value ? 'text_caption' : 'primary_gray'}>
                      {textEllipses(item?.label, 8)}
                    </Text>
                  </HStack>
                )
              })}
            </VStack>
          </MenuList>
        </>
      )}
    </Menu>
  )
}

export default NewMenuButton
