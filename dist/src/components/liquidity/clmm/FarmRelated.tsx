import { CetusTooltip } from '@cetus/design'
import { cancelBubble } from '@cetus/utils'
import { Box, HStack, Skeleton, Stack, Switch, Text, VStack } from '@chakra-ui/react'
import FarmingIcon from '../../common/FarmingIcon'

const FarmRewardsRange = ({
  minPrice,
  maxPrice,
  perText,
  checked,
  onChange,
  loading
}: {
  minPrice: string
  maxPrice: string
  perText: string
  checked: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  loading?: boolean
}) => {
  return (
    <HStack w="100%" justify={{ base: 'space-between', lg: 'center' }} align={{ base: 'flex-start', lg: 'center' }} p={{ base: '0px', lg: '0' }}>
      <Stack flexDir={{ base: 'column', lg: 'row' }}>
        <HStack gap={{ base: '12px', lg: '8px' }}>
          <FarmingIcon
            tooltip={
              <Box as="div" lineHeight="20px" fontSize="12px">
                Farm reward range: Only liquidity within this range is eligible to receive farming rewards of the pool. &nbsp;
                <Box
                  as="a"
                  color="primary"
                  onClick={(e: any) => {
                    cancelBubble(e)
                    window.open('https://medium.com/@CetusProtocol/cetus-new-farms-everything-you-should-know-about-it-c6b60e6a6ae5')
                  }}
                >
                  Learn More
                </Box>
              </Box>
            }
          />
          <Text fontSize={{ base: '12px', lg: '14px' }} ml={{ base: '-8px', lg: '0' }}>
            Farm rewards range
          </Text>
        </HStack>
        <HStack>
          {loading ? (
            <Skeleton w="120px" h={{ base: '12px', lg: '14px' }} />
          ) : (
            <Text color="primary_yellow" fontSize={{ base: '12px', lg: '14px' }}>
              {minPrice}&nbsp;-&nbsp;{maxPrice}
            </Text>
          )}

          <Text fontSize={{ base: '12px', lg: '14px' }}>{perText?.replace('/', ' per ')}</Text>
        </HStack>
      </Stack>

      <Switch isChecked={checked} onChange={onChange} />
    </HStack>
  )
}

const AutoStakePosition = ({
  disabled,
  checked,
  onChange
}: {
  disabled: boolean
  checked: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
}) => {
  return (
    <Box w="100%" p={{ base: '0 12px', lg: '0' }}>
      <HStack
        p={{ base: '12px 8px', lg: '16px' }}
        // border={{ base: 'none', lg: '1px solid' }}
        // borderColor={{ base: 'transparent', lg: 'border' }}
        borderRadius={{ base: '12px', lg: '12px' }}
        bg="card_bg"
        gap={{ base: '6px', lg: '12px' }}
        width="100%"
        justify="space-between"
      >
        {/* <FarmingIcon flex="0 0 24px" h="24px" /> */}
        <Text lineHeight="20px" color="text_highlight" fontSize="12px">
          Automatically stake your position into the farm to enjoy higher yield.
        </Text>
        {disabled ? (
          <CetusTooltip
            tooltip={
              <VStack gap="4px" align="flex-start">
                <Text fontSize="12px">Farming rewards only available</Text>
                <Text fontSize="12px">for active positions.</Text>
              </VStack>
            }
            placement="top"
            maxW="198px"
          >
            <Switch isChecked={checked} isDisabled={disabled} maxW="32px" onChange={onChange} />
          </CetusTooltip>
        ) : (
          <Switch isChecked={checked} isDisabled={disabled} maxW="32px" onChange={onChange} />
        )}
      </HStack>
    </Box>
  )
}

export { AutoStakePosition, FarmRewardsRange }
