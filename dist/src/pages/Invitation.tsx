import { CetusTooltip, useGlobalToast } from '@cetus/design'
import { useInviteCodes } from '@cetus/hooks'
import useDocumentSize from '@cetus/hooks/src/useDocumentSize'
import { Icon } from '@cetus/ui-kit'
import { Button, Center, HStack, Image, Input, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
export default function Invitation() {
  const { handleVerifyInviteCode } = useInviteCodes()
  const { showCommonToast } = useGlobalToast()
  const navigate = useNavigate()
  const { size } = useDocumentSize()
  const [isShowCode, setIsShowCode] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const reg = /[\u4e00-\u9fa5]/g // 禁止中文
    const val = e.target.value.replace(reg, '')
    // 这里直接用光标位置处理，避免丢字符
    // 隐藏模式下只取和上次 inputValue 不同的部分
    if (isShowCode) {
      setInputValue(val)
    } else {
      if (val.length < inputValue.length) {
        // 删除
        setInputValue(prev => prev.slice(0, val?.length))
      } else {
        // 新增
        const diff = val.length - inputValue.length
        const newChar = e.target.value.slice(-diff) // 取最后新增的字符
        setInputValue(prev => prev + newChar)
      }
    }
  }

  const displayValue = isShowCode ? inputValue : '*'.repeat(inputValue.length)

  const onsubmit = () => {
    const isVerify = handleVerifyInviteCode(inputValue)
    console.log('🚀 ~ onsubmit ~ isVerify:', inputValue, isVerify)
    if (isVerify) {
      showCommonToast('Verified successfully!', 'success')
      navigate('/swap')
    } else {
      showCommonToast('Invalid code. Please try again.', 'rejected', '')
    }
  }
  return (
    <VStack
      gap="20px"
      justify={{ base: 'flex-start', lg: 'center' }}
      pt={{ base: '100px', lg: '0px' }}
      pb={{ base: '0', lg: '100px' }}
      align="flex-start"
      position={{ base: 'unset', lg: 'absolute' }}
      left="18%"
      w="100%"
      h={size?.h - 80}
    >
      <Image src="/images/logo@2x.png" w="132px" h="32px" />
      <Text fontSize="40px" fontWeight="500" color="text_caption">
        Invitation Only
      </Text>
      <Text color="primary_gray">Cetus DLMM is in private beta phase.</Text>
      <Text color="primary_gray" mt="-12px">
        Please enter your invitation code to access the platform.
      </Text>
      <HStack w={{ base: '100%', lg: '300px' }} gap="0" position="relative" mt="40px">
        <Input
          w={{ base: '100%', lg: '300px' }}
          borderRadius="8px"
          h="44px"
          lineHeight="44px"
          border="1px solid"
          borderColor="border"
          variant="outline"
          value={displayValue}
          onChange={handleChange}
          fontSize="16px"
          placeholder="Enter invitation code"
          pr="40px"
          pl="12px"
          // type={isShowCode ? 'text' : 'password'}
          _placeholder={{ fontSize: '14px' }}
        />
        <CetusTooltip showTooltip={false} placement="bottom-end" tooltip={<Text fontSize="12px">{isShowCode ? 'Hide Code' : 'Show Code'}</Text>}>
          <Center position="absolute" top="50%" right="12px" transform="translateY(-50%)" zIndex="9999">
            <Icon
              xlinkHref={isShowCode ? '#icon-hide_eyes' : '#icon-hide'}
              svgFill={isShowCode ? 'text_caption' : 'text_caption'}
              onClick={() => setIsShowCode(!isShowCode)}
            />
          </Center>
        </CetusTooltip>
      </HStack>
      <Button isDisabled={!inputValue} borderRadius="12px" w={{ base: '100%', lg: '300px' }} h="44px" fontWeight="500" onClick={() => onsubmit()}>
        Submit
      </Button>
    </VStack>
  )
}
