import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { Box, Button, HStack, Image, Input, Menu, MenuButton, MenuList, Text, VStack } from '@chakra-ui/react'
import { isValidSuiAddress } from '@mysten/sui/utils'
import { useEffect, useRef, useState } from 'react'

function TraderCon({ traderAddress, setTraderAddress }: { traderAddress: string; setTraderAddress: any }) {
  const { isApp } = useWindowWidth()
  const [inputChange, setInputChange] = useState('')
  const [isValidAddress, setIsValidAddress] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [menuWidth, setMenuWidth] = useState<string | number>('auto')
  const verifyAddress = (value: string) => {
    const isValid = isValidSuiAddress(value)
    setIsValidAddress(isValid)
  }

  const handleCancel = () => {
    setInputChange('')
    setTraderAddress('')
    setIsValidAddress(true)
  }

  const handleApply = () => {
    setTraderAddress(inputChange)
  }

  useEffect(() => {
    setInputChange(traderAddress)
  }, [traderAddress])

  return (
    <Menu
      isLazy
      placement="bottom-start"
      onClose={() => {
        setInputChange(traderAddress)
        verifyAddress(traderAddress)
      }}
      onOpen={() => {
        verifyAddress(traderAddress)
        if (buttonRef.current) {
          setMenuWidth(buttonRef.current.offsetWidth)
        }
      }}
    >
      {({ isOpen, onClose }) => (
        <>
          <MenuButton
            ref={buttonRef}
            as={Button}
            variant="outline"
            position="relative"
            h="36px"
            border="none"
            bg="none"
            p="0"
            w={{ base: '100%', lg: 'unset' }}
            height="16px"
            lineHeight="16px"
            _hover={{ bg: 'none' }}
            _active={{ bg: 'none' }}
          >
            <HStack gap="0" justify="center">
              <Text color="primary_gray" fontSize="13px">
                Trader
              </Text>
              <Icon mt="1px" xlinkHref="#icon-icon_filter" svgW="16px" svgH="16px" />
            </HStack>
          </MenuButton>

          {isOpen && (
            <MenuList
              minW="unset"
              zIndex={9999}
              p="4px"
              w={`${menuWidth}px`}
              sx={{
                position: 'absolute',
                left: { base: '0', lg: '-80px' }, // 使其左对齐
                top: '8px'
              }}
            >
              <VStack w="100%" spacing="0">
                <Block h="48px" lineHeight="46px" w="100%" p="0 12px" borderRadius="8px">
                  <HStack w="100%" h="100%">
                    <Input
                      w="100%"
                      h="24px"
                      type="text"
                      placeholder="Trader address"
                      fontSize="14px"
                      lineHeight="24px"
                      value={inputChange}
                      pr="16px"
                      onChange={e => {
                        const val = e.target.value
                        setInputChange(val)
                        verifyAddress(val)
                      }}
                    />
                    {inputChange ? (
                      <Box position="absolute" top="18px" right="10px" onClick={() => setInputChange('')}>
                        <Icon xlinkHref="#icon-icon_close" />
                      </Box>
                    ) : null}
                  </HStack>
                </Block>

                {inputChange &&
                  (isValidAddress ? (
                    <HStack
                      h="52px"
                      gap="4px"
                      justify="flex-start"
                      mt="-20px"
                      bg="primary_green_opacity.10"
                      w="100%"
                      p="24px 12px 8px"
                      zIndex="-1"
                      borderRadius="8px"
                    >
                      <Image src="/images/icon_yes.png" w="18px" h="18px" />
                      <Text fontSize="12px" color="primary_green">
                        Valid address
                      </Text>
                    </HStack>
                  ) : (
                    <HStack
                      h="52px"
                      gap="6px"
                      justify="flex-start"
                      mt="-20px"
                      bg="primary_red_opacity.10"
                      w="100%"
                      p="26px 12px 8px"
                      zIndex="-1"
                      borderRadius="8px"
                    >
                      <Icon xlinkHref="#icon-icon-warning" w="16px" h="16px" variant="error" />
                      <Text fontSize="12px" color="primary_red">
                        Invalid address
                      </Text>
                    </HStack>
                  ))}

                <HStack w="100%" justify="space-between" mt="8px" p="0">
                  <Button
                    fontSize="12px"
                    h="28px"
                    lineHeight="28px"
                    borderRadius="8px"
                    variant="outline"
                    w="50%"
                    onClick={() => {
                      handleCancel()
                      onClose()
                    }}
                  >
                    Clear
                  </Button>
                  <Button
                    fontSize="12px"
                    w="50%"
                    h="28px"
                    lineHeight="28px"
                    borderRadius="8px"
                    isDisabled={!isValidAddress}
                    onClick={() => {
                      handleApply()
                      onClose()
                    }}
                  >
                    Apply
                  </Button>
                </HStack>
              </VStack>
            </MenuList>
          )}
        </>
      )}
    </Menu>
  )
}

export default TraderCon
