import useExplorer from '@cetus/hooks/src/useExplorer'
import { BatchAuthStep, TransactionStatusType, defaultExplorers } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { Box, HStack, Image, Text, VStack } from '@chakra-ui/react'

type AuthStepProps = {
  step: BatchAuthStep
  showLine: boolean
}

const getStepIndexText = (step: number) => {
  switch (step) {
    case 1:
      return 'first'
    case 2:
      return 'second'
    case 3:
      return 'third'
    case 4:
      return 'fourth'
    case 5:
      return 'fifth'
    case 6:
      return 'sixth'
    case 7:
      return 'seventh'
    case 8:
      return 'eighth'
    case 9:
      return 'ninth'
    case 10:
      return 'tenth'
    default:
      return ''
  }
}

export function AuthStep(props: AuthStepProps) {
  const { step, showLine } = props
  return (
    <HStack w="100%" gap="12px" pl={{ base: 0, lg: '30px' }} justifyContent="start" alignItems="flex-start">
      <VStack gap="0px" alignItems="center" alignSelf="stretch">
        <StepSymbol step={step.index} status={step.status} isActiveStep={step.isActiveStep} />
        {showLine && (
          <Box
            flex="1"
            borderLeft="2px solid"
            borderRadius="4px"
            mt="4px"
            mb="4px"
            borderColor={step.status === 'rejected' ? 'primary_red_opacity.50' : 'primary_opacity.30'}
          />
        )}
      </VStack>
      <StepContent step={step.index} status={step.status} isActiveStep={step.isActiveStep} tx={step.tx} error={step.error} />
    </HStack>
  )
}

type StepContentProps = {
  step: number
  status: TransactionStatusType
  isActiveStep: boolean
  tx?: string
  error?: string
}

export function StepContent({ step, status, isActiveStep, tx, error }: StepContentProps) {
  const { getExplorerUrl } = useExplorer()
  return (
    <VStack alignItems="start" justifyContent="start" mt="5px" pb="30px">
      {status === 'confirmation' && (
        <Text whiteSpace="nowrap" color={isActiveStep ? 'primary' : 'text_paragraph'}>{`Confirm the ${getStepIndexText(step)} transaction`}</Text>
      )}
      {(status === 'submitted' || status === 'success') && (
        <Text whiteSpace="nowrap" color={'text_caption'}>{`Completed the ${getStepIndexText(step)} transaction`}</Text>
      )}
      {status === 'rejected' && (
        <VStack alignItems="start" justifyContent="start">
          <Text whiteSpace="nowrap" color={'primary_red'}>{`The ${getStepIndexText(step)} transaction failed`}</Text>
          <Text whiteSpace="nowrap" fontSize="12px">
            {error}
          </Text>
        </VStack>
      )}

      {tx && (
        <HStack w="100%" justifyContent="start" gap="16px">
          {defaultExplorers.map(explorer => {
            return (
              <HStack
                gap="4px"
                borderRadius="12px"
                cursor="pointer"
                onClick={() => {
                  window.open(getExplorerUrl(tx, 'tx', explorer), '_blank')
                }}
                _hover={{
                  svg: {
                    fill: 'text_caption'
                  },
                  img: {
                    opacity: '1'
                  },
                  p: {
                    color: 'text_caption'
                  }
                }}
              >
                <Image opacity="0.6" src={explorer.img} alt="SVG Image" boxSize="18px" objectFit="cover" borderRadius="8px" />
                <Text fontSize="12px">{explorer.name}</Text>
                <Icon xlinkHref="#icon-icon_link3" fontSize="14px" />
              </HStack>
            )
          })}
        </HStack>
      )}
    </VStack>
  )
}
type StepSymbolProps = {
  step: number
  status: TransactionStatusType
  isActiveStep: boolean
}

function StepSymbol({ step, status, isActiveStep }: StepSymbolProps) {
  return (
    <VStack>
      {status === 'confirmation' &&
        (isActiveStep ? (
          <Box position="relative" w="24px" h="24px" display="flex" alignItems="center" justifyContent="center">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="12" fill="#2A3238" />
              <path d="M12 2 A10 10 0 0 1 12 22" stroke="#75C8FF" strokeWidth="2" fill="none" />
            </svg>
            <Text position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" color="primary" fontWeight="500" fontSize="14px">
              {step}
            </Text>
          </Box>
        ) : (
          <Box position="relative" w="24px" h="24px" display="flex" alignItems="center" justifyContent="center">
            <svg width="24" height="24" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="11" stroke="#2A3238" strokeWidth="2" fill="transparent" />
            </svg>
            <Text position="absolute" top="50%" left="50%" transform="translate(-50%, -50%)" color="text_paragraph" fontWeight={500} fontSize="14px">
              {step}
            </Text>
          </Box>
        ))}

      {(status === 'submitted' || status === 'success') && (
        <Box w="24px" h="24px" display="flex" alignItems="center" justifyContent="center" borderRadius="24px" bg="primary_opacity.10">
          <Icon xlinkHref="#icon-icon_check" fontSize="12px" svgFill="primary" />
        </Box>
      )}
      {status === 'rejected' && (
        <Box position="relative" w="24px" h="24px" display="flex" alignItems="center" justifyContent="center">
          <svg width="24" height="24" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="12" fill="rgba(255,80,115,0.1)" />
          </svg>
          <svg width="8" height="12" viewBox="0 0 8 12" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}>
            <path d="M4 1L4 8M4 10L4 11" stroke="#FF5073" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </Box>
      )}
    </VStack>
  )
}
