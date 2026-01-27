import { Block } from '@cetus/design'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { SingleCoinImage } from '@cetus/ui-kit'
import { formatPrice } from '@cetus/utils'
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'
import React from 'react'
import HiddenDotted from '../HiddenDotted'
type HoldingType = 'cetus' | 'xcetus' | 'rewards'
const TypeMap: Record<HoldingType, { title: string; imgUrl: string; bgUrl: string }> = {
  cetus: {
    title: 'CETUS Holdings',
    imgUrl: envConfigs.cetus_coin.logo_url as string,
    bgUrl: '/images/bg_cetus.png'
  },
  xcetus: {
    title: 'Available xCETUS',
    imgUrl: envConfigs.x_cetus_coin.logo_url as string,
    bgUrl: '/images/bg_xcetus.png'
  },
  rewards: {
    title: 'xCETUS Rewards',
    imgUrl: '/images/icon_rewards.png',
    bgUrl: '/images/bg_rewards.png'
  }
}

type HoldingProps = {
  amount: React.ReactNode
  amountUSD?: string
  type: HoldingType
  isLoading: boolean
  children?: React.ReactNode
}
function Holding({ type, amount, amountUSD, isLoading, children }: HoldingProps) {
  const { title, imgUrl, bgUrl } = TypeMap[type]
  return (
    <Block
      border="none"
      flex="1"
      bg={`center / cover no-repeat url(${bgUrl})`}
      p={{ base: '8px', lg: '20px' }}
      borderRadius="16px"
      backdropFilter="blur(50px)"
    >
      <VStack w="100%" align="flex-start" h="88px" gap="22px">
        <HStack>
          <SingleCoinImage
            imageUrl={imgUrl}
            imgBoxStyle={{
              w: '20px',
              h: '20px',
              bg: 'block_color',
              borderColor: 'transparent',
              borderRadius: '20px'
            }}
          />
          <Text>{title}</Text>
        </HStack>
        <HStack w="100%" justify="space-between">
          <HiddenDotted>
            <VStack align="flex-start" w="100%" gap="4px">
              <Skeleton isLoaded={!isLoading} h="24px">
                <Text color="text_caption" h="24px" lineHeight="24px" fontSize="20px">
                  {amount}
                </Text>
              </Skeleton>
              {amountUSD !== undefined && (
                <Skeleton isLoaded={!isLoading} h="17px">
                  <Text h="17px" lineHeight="17px" fontSize="14px">
                    ${formatPrice(amountUSD, 2)}
                  </Text>
                </Skeleton>
              )}
            </VStack>
          </HiddenDotted>

          {children}
        </HStack>
      </VStack>
    </Block>
  )
}

export default Holding
