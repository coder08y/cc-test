import useLimitActionStore from '@/store/limit/useLimitAction'
import { InputBox } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Button, HStack, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'

interface CustomExpiryModalProps {
  isOpen: boolean
  onClose: () => void
}

const CustomExpiryModal = ({ isOpen, onClose }: CustomExpiryModalProps) => {
  const { isApp } = useWindowWidth()
  const { setCustomExpiresVal, setExpiresIn } = useLimitActionStore()
  const [hourVal, setHourVal] = useState('')
  const [minuteVal, setMinuteVal] = useState('')
  const handleInputHourChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^\d]/g, '') // 去掉非数字字符
    setHourVal(value)
  }
  const handleInputMinuteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/[^\d]/g, '') // 去掉非数字字符
    setMinuteVal(value)
  }
  const [timeInfo, setTimeInfo] = useState({})
  const calculateTime = (hours: string, minutes: string) => {
    const totalMinutes = Number(hours ? hours : 0) * 60 + Number(minutes || 0)
    const d = Math.floor(totalMinutes / (60 * 24))
    const h = Math.floor((totalMinutes % (60 * 24)) / 60)
    const m = totalMinutes % 60

    let result = ''
    if (d > 0) {
      result += d + 'd '
    }
    if (h > 0) {
      result += h + 'h '
    }
    if (m > 0) {
      result += m + 'm '
    }
    setTimeInfo({
      timeText: result.trim() || '0 m',
      time: totalMinutes * 60 * 1000
    })
  }
  useEffect(() => {
    calculateTime(hourVal, minuteVal)
  }, [hourVal, minuteVal])
  const btnDisabled = useMemo(() => {
    if (!hourVal && !minuteVal) {
      return true
    }
    if (Number(hourVal) == 0 && !minuteVal) {
      return true
    }
    if (Number(minuteVal) == 0 && !hourVal) {
      return true
    }
    if (Number(hourVal) == 0 && Number(minuteVal) == 0) {
      return true
    }
    return false
  }, [hourVal, minuteVal])
  const clickSetPeriod = () => {
    setExpiresIn(timeInfo?.timeText)
    setCustomExpiresVal(timeInfo?.time)
    onClose()
  }

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="1200px" w={isApp ? 'calc(100vw - 32px)' : '440px'}>
        <ModalHeader mr="-10px">
          <HStack w="100%" gap="24px" justify="space-between" align="center">
            <Text fontSize="16px" fontWeight="500" color="text_caption">
              Custom Expiry Period
            </Text>
            <HStack gap="0" align="center">
              <ModalCloseButton mt="0" position="static" />
            </HStack>
          </HStack>
        </ModalHeader>

        <ModalBody p={{ base: '8px 16px', lg: '16px' }} pt="0 !important">
          <VStack w="100%">
            <InputBox>
              <HStack>
                <Input
                  value={hourVal}
                  onChange={handleInputHourChange}
                  placeholder="0.0"
                  style={{
                    width: 'calc(100% - 8px)',
                    background: 'none',
                    whiteSpace: 'nowrap',
                    opacity: 1,
                    outline: 'none',
                    color: 'var(--chakra-colors-text_caption)',
                    fontSize: '20px',
                    touchAction: 'manipulation',
                    transition: 'all 0.3s'
                  }}
                />
                <Text>Hours</Text>
              </HStack>
            </InputBox>
            <InputBox>
              <HStack>
                <Input
                  value={minuteVal}
                  onChange={handleInputMinuteChange}
                  placeholder="0.0"
                  style={{
                    width: 'calc(100% - 8px)',
                    background: 'none',
                    whiteSpace: 'nowrap',
                    opacity: 1,
                    outline: 'none',
                    color: 'var(--chakra-colors-text_caption)',
                    fontSize: '20px',
                    touchAction: 'manipulation',
                    transition: 'all 0.3s'
                  }}
                />
                <Text>Minutes</Text>
              </HStack>
            </InputBox>
            <Button onClick={clickSetPeriod} isDisabled={btnDisabled} w="calc(100% + 32px)" mb="-30px" mt="12px" h="52px" fontWeight="500">
              Set Period
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default CustomExpiryModal
