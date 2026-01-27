import useZapSubmit from '@/hooks/zap/useZapSubmit'
import { Button } from '@chakra-ui/react'

export default function ZapSubmitBtn() {
  const { btnDisabled, btnText, handleZapIn, isPreLoading } = useZapSubmit()
  return (
    <Button
      w="calc(100% + 34px)"
      h="52px"
      margin="-1px -1px 5px"
      fontSize="18px"
      fontWeight="500"
      borderRadius="16px"
      isDisabled={isPreLoading || btnDisabled}
      isLoading={isPreLoading}
      onClick={handleZapIn}
    >
      {btnText}
    </Button>
  )
}
