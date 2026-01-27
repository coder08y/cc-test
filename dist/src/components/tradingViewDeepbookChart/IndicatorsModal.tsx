import { Icon } from '@cetus/ui-kit'
import {
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Text,
  VStack
} from '@chakra-ui/react'
import { useState } from 'react'

interface IndicatorsModalProps {
  open: boolean
  onClose: () => void
  indicators: string[]
  handleSetIndicator: (indicator: string) => void
}
export default function IndicatorsModal(props: IndicatorsModalProps) {
  const { open, onClose, indicators, handleSetIndicator } = props
  const [searchQuery, setSearchQuery] = useState('')
  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={open} onClose={onClose} colorScheme="blackAlpha" size="full" isCentered>
      <ModalOverlay />
      <ModalContent bg="transparent" backdropFilter="blur(6px)" backgroundColor="rgba(0, 0, 0, 0.1)">
        <ModalCloseButton size="lg" />
        <ModalBody display="flex" justifyContent="center" alignItems="center">
          <VStack>
            <InputGroup>
              <Input placeholder="Search name or address" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              <InputRightElement>
                {searchQuery ? (
                  <Icon
                    xlinkHref="#icon-icon_close"
                    position="absolute"
                    top="8px"
                    right="8px"
                    onClick={e => {
                      e.stopPropagation()
                      setSearchQuery('')
                    }}
                  />
                ) : null}
              </InputRightElement>
            </InputGroup>
            <HStack>
              <Text>Script Name</Text>
            </HStack>
            <VStack>
              {indicators
                .filter(indicator => indicator.toLowerCase().includes(searchQuery.toLowerCase()))
                .map(indicator => (
                  <button
                    key={indicator}
                    className="mx-[2px] my-[2px] w-[98%] rounded px-2.5 py-2.5 text-left text-sm text-foreground transition-colors hover:bg-accent-hover hover:text-white"
                    onClick={() => handleSetIndicator(indicator)}
                  >
                    {indicator}
                  </button>
                ))}
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
