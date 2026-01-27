import icon_clmm from '@/assets/images/icon_clmm.png'
import icon_dlmm from '@/assets/images/icon_dlmm.png'
import { FromSource } from '@/components/selectPool/type'
import { CheckBox } from '@cetus/ui-kit'
import { Button, Divider, HStack, Heading, Image, Stack, StackProps, Text, VStack } from '@chakra-ui/react'
import CompletedBlock from './CompletedBlock'
export type PoolType = 'clmm' | 'dlmm'

type SelectPoolTypeProps = {
  currentStep: number
  type: PoolType
  onChange: (type: PoolType) => void
  onEdit?: () => void
  onContinue?: () => void
  wrapStyle?: StackProps
  fromSource: FromSource
}
function SelectPoolType({ currentStep, type, onChange, wrapStyle = {}, onEdit, onContinue, fromSource }: SelectPoolTypeProps) {
  if (currentStep > 1) {
    const { icon, title, description } = PoolsMap[type]
    return <CompletedBlock onEdit={onEdit!}>{<CompletedPoolType icon={icon} title={title} description={description} />}</CompletedBlock>
  }
  return (
    <VStack w="100%" gap="16px" bg="bg_fifth" borderRadius="12px" p={{ base: '16px 8px', lg: '32px' }} {...wrapStyle}>
      <VStack w="100%" align="flex-start">
        <Heading fontSize="16px" fontWeight="500">
          Select pool type
        </Heading>
        <Text fontSize="12px" fontWeight="400">
          Select the pool type you want to create
        </Text>
      </VStack>
      <PoolTypeCheck checked={type === 'clmm'} type="clmm" onChange={onChange} />
      <PoolTypeCheck checked={type === 'dlmm'} type="dlmm" onChange={onChange} />
      {fromSource === 'createPool' && (
        <Button w="100%" borderRadius="12px" h="48px" isDisabled={type === undefined} onClick={onContinue}>
          Continue
        </Button>
      )}
    </VStack>
  )
}

const CompletedPoolType = ({ icon, title, description }: { icon: string; title: string; description: string }) => {
  return (
    <HStack>
      <Image w="24px" h="24px" src={icon} />
      <Stack flexDir={{ base: 'column', lg: 'row' }} align={{ base: 'flex-start', lg: 'flex-end' }} gap={{ base: '6px', lg: '8px' }}>
        <Text fontSize={{ base: '14px', lg: '16px' }} color="text_caption" fontWeight="500">
          {title}
        </Text>
        <Text fontSize="12px">{description}</Text>
      </Stack>
    </HStack>
  )
}

interface PoolInfo {
  icon: string
  title: string
  description: string
  detail: string
  color: string
  bg: string
  url: string
  dividerColor: string
  checkbox: {
    color: string
    bg: string
    border: string
  }
}

const PoolsMap: Record<PoolType, PoolInfo> = {
  clmm: {
    icon: icon_clmm,
    title: 'CLMM Pools',
    description: 'Concentrated Liquidity Market Maker',
    detail:
      'Concentrate liquidity within your defined price ranges for higher capital efficiency and fee potential, liquidity outside your range requires active management',
    url: '',
    color: 'primary',
    bg: 'primary_opacity.10',
    dividerColor: 'primary_opacity.15',
    checkbox: {
      color: 'primary',
      bg: 'clmm_checked_bg',
      border: 'clmm_checked_border'
    }
  },
  dlmm: {
    icon: icon_dlmm,
    title: 'DLMM Pools',
    description: 'Dynamic Liquidity Market Maker',
    detail:
      'Divide liquidity into discrete price bins with dynamic, volatility-based fees, select flexible distribution strategies for improved capital efficiency',
    url: '',
    color: 'primary_green',
    bg: 'primary_green_opacity.10',
    dividerColor: 'primary_green_opacity.15',
    checkbox: {
      color: 'dlmm_checked_color',
      bg: 'dlmm_checked_bg',
      border: 'dlmm_checked_border'
    }
  }
}

type PoolTypeCheckProps = {
  onChange: (type: PoolType) => void
  checked: boolean
  type: PoolType
}
const PoolTypeCheck = ({ type, checked, onChange }: PoolTypeCheckProps) => {
  const {
    icon,
    title,
    description,
    detail,
    url,
    color,
    bg,
    dividerColor,
    checkbox: { color: checkedColor, bg: checkedBg, border }
  } = PoolsMap[type]

  return (
    <VStack
      w="100%"
      p="12px"
      bg={checked ? bg : 'none'}
      borderRadius="8px"
      gap="12px"
      border="1px solid"
      borderColor={checked ? 'transparent' : 'border'}
    >
      <HStack w="100%" justify="space-between" onClick={() => onChange(type)} cursor="pointer">
        <HStack>
          <Image src={icon} w={{ base: '18px', lg: '24px' }} h={{ base: '18px', lg: '24px' }} />
          <Stack flexDir={{ base: 'column', lg: 'row' }} align={{ base: 'flex-start', lg: 'flex-end' }} gap={{ base: '6px', lg: '8px' }}>
            <Text fontSize={{ base: '14px', lg: '16px' }} fontWeight="500" color={checked ? color : 'text_caption'}>
              {title}
            </Text>
            <Text color={checked ? color : 'text_paragraph'} fontSize="12px">
              {description}
            </Text>
          </Stack>
        </HStack>
        <CheckBox
          checked={checked}
          onClick={() => {}}
          wrapStyle={{
            border: '1px solid',
            borderColor: checked ? border : 'transparent',
            bg: checked ? checkedBg : 'background',
            sx: {
              svg: {
                fill: checkedColor
              },
              _hover: {
                svg: {
                  fill: checkedColor
                }
              }
            }
          }}
        />
      </HStack>

      {checked && (
        <>
          <Divider orientation="horizontal" borderColor={dividerColor} />
          <VStack align="flex-start" gap="4px">
            <Text fontSize="12px" lineHeight="20px">
              {detail}
            </Text>
          </VStack>
        </>
      )}
    </VStack>
  )
}

export default SelectPoolType
