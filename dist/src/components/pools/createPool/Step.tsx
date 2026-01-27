import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Box, Divider, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { PoolType } from './SelectPoolType'

const StepLabelMap: Record<PoolType, Record<number, string>> = {
  clmm: {
    2: 'Select token & fee tier'
  },
  dlmm: {
    2: 'Select token & base fee'
  }
}

function Step({
  currentStep,
  handleStepClick,
  totalStep,
  poolType
}: {
  currentStep: number
  totalStep: number
  handleStepClick: (step: number) => void
  poolType: PoolType
}) {
  const { isApp } = useWindowWidth()
  return (
    <Stack
      flexDir={{ base: 'row', lg: 'column' }}
      gap="12px"
      flex={{ base: '1', lg: '0 0 258px' }}
      w={{ base: '100%', lg: '258px' }}
      p={{ base: '12px', lg: '32px' }}
      justify="center"
      align={{ base: 'center', lg: 'flex-start' }}
      bg="bg_fifth"
      borderRadius="12px"
    >
      <StepItem step={1} title="Select pool type" isActive={currentStep >= 1} handleStepClick={handleStepClick} />
      {totalStep >= 2 && (
        <>
          <Box w="32px" h={{ base: '1px', lg: '32px' }}>
            <Divider orientation={isApp ? 'horizontal' : 'vertical'} ml={{ base: '0', lg: '16px' }} />
          </Box>
          <StepItem step={2} title={StepLabelMap[poolType][2]} isActive={currentStep >= 2} handleStepClick={handleStepClick} />
        </>
      )}
      {totalStep >= 3 && (
        <>
          <Box w="32px" h={{ base: '1px', lg: '32px' }}>
            <Divider orientation={isApp ? 'horizontal' : 'vertical'} ml={{ base: '0', lg: '16px' }} />
          </Box>
          <StepItem step={3} title="Set initial price" isActive={currentStep >= 3} handleStepClick={handleStepClick} />
        </>
      )}
      {totalStep >= 4 && (
        <>
          <Box w="32px" h={{ base: '1px', lg: '32px' }}>
            <Divider orientation={isApp ? 'horizontal' : 'vertical'} ml={{ base: '0', lg: '16px' }} />
          </Box>
          <StepItem step={4} title="Deposit your amount" isActive={currentStep >= 4} />
        </>
      )}
    </Stack>
  )
}

interface StepItem {
  step: number
  title: string
  isActive: boolean
  handleStepClick?: (step: number) => void
}
function StepItem({ step, title, isActive, handleStepClick }: StepItem) {
  return (
    <HStack
      w={{ base: '32px', lg: '100%' }}
      cursor={handleStepClick && isActive ? 'pointer' : 'unset'}
      onClick={() => {
        if (handleStepClick && isActive) {
          handleStepClick(step)
        }
      }}
    >
      <Box
        as="div"
        flex="0 0 32px"
        h="32px"
        lineHeight="32px"
        textAlign="center"
        border="1px solid"
        fontSize="12px"
        fontWeight="500"
        color={isActive ? 'text_highlight' : 'text_paragraph'}
        borderColor="border"
        borderRadius="8px"
        bg={isActive ? 'primary_disabled' : 'transparent'}
      >
        {step}
      </Box>
      <VStack align="flex-start" display={{ base: 'none', lg: 'flex' }}>
        <Text fontSize="14px" color={isActive ? 'text_caption' : 'text_paragraph'} fontWeight="500">
          Step &nbsp;{step}
        </Text>
        <Text fontSize="12px" color={isActive ? 'primary' : 'text_paragraph'} fontWeight="500">
          {title}
        </Text>
      </VStack>
    </HStack>
  )
}

export default Step
