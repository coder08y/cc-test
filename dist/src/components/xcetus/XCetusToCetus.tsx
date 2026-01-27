import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import envConfigs from '@cetus/types/src/config/envConfigs'
import { SingleCoinImage } from '@cetus/ui-kit'
import { formatNumber, fromDecimalsAmountFix } from '@cetus/utils'
import { HStack, LayoutProps, Text, VStack } from '@chakra-ui/react'
import HiddenDotted from '../profile/HiddenDotted'
type XCetusToCetusProps = {
  xcetus_amount: string
  cetus_amount: string
  imageSize?: LayoutProps['w']
}
function XCetusToCetus({ xcetus_amount, cetus_amount, imageSize = '24px' }: XCetusToCetusProps) {
  const { isApp } = useWindowWidth()
  return isApp ? (
    <VStack w="100%" align="center" gap="8px">
      <HStack w={{ base: '100%', lg: 'unset' }}>
        <SingleCoinImage
          imageUrl={envConfigs.x_cetus_coin.logo_url}
          p="4px"
          imgBoxStyle={{
            w: imageSize,
            h: imageSize,
            bg: 'block_color',
            borderColor: 'transparent',
            borderRadius: '20px'
          }}
        />
        <Item amount={xcetus_amount} token="xCETUS" />
        <Text color="text_caption">→</Text>
      </HStack>
      <HStack w={{ base: '100%', lg: 'unset' }}>
        <SingleCoinImage
          imageUrl={envConfigs.cetus_coin.logo_url}
          p="2px"
          imgBoxStyle={{
            w: imageSize,
            h: imageSize,
            bg: 'block_color',
            borderColor: 'transparent',
            borderRadius: '20px'
          }}
        />
        <Item amount={cetus_amount} token="CETUS" />
      </HStack>
    </VStack>
  ) : (
    <HStack>
      <SingleCoinImage
        imageUrl={envConfigs.x_cetus_coin.logo_url}
        p="4px"
        imgBoxStyle={{
          w: imageSize,
          h: imageSize,
          bg: 'block_color',
          borderColor: 'transparent',
          borderRadius: '20px'
        }}
      />
      <Item amount={xcetus_amount} token="xCETUS" />
      <Text color="text_caption"> →</Text>

      <SingleCoinImage
        imageUrl={envConfigs.cetus_coin.logo_url}
        p="2px"
        imgBoxStyle={{
          w: imageSize,
          h: imageSize,
          bg: 'block_color',
          borderColor: 'transparent',
          borderRadius: '20px'
        }}
      />
      <Item amount={cetus_amount} token="CETUS" />
    </HStack>
  )
}

const Item = ({ amount, token }: { amount: string; token: string }) => {
  return (
    <HStack as="div">
      <HiddenDotted>
        <Text as="span" color="text_caption">
          {formatNumber(fromDecimalsAmountFix(amount, 9), 9)}{' '}
        </Text>
      </HiddenDotted>
      <Text as="span" color="text_paragraph">
        {token}
      </Text>
    </HStack>
  )
}

export default XCetusToCetus
