import useXCetusStore from '@/store/xcetus/useXCetus'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { HTextLabelBox } from '@cetus/ui-kit'
import VTextLabelBox from '@cetus/ui-kit/src/components/VTextLabelBox'
import { formatNumber, fromDecimalsAmountFix } from '@cetus/utils'
import { Button, HStack, Image, ImageProps, Stack, StackProps, Text, VStack } from '@chakra-ui/react'

type XCetusTopHerderProps = {
  totalAmount: string
  availableAmount: string
  redeemingAmount: string
  isLoading: boolean
}

export function XCetusTopHerder(props: XCetusTopHerderProps) {
  const { totalAmount, availableAmount, redeemingAmount, isLoading } = props
  const { currentAccount } = useAccountStore()
  const { availableXCetusAmountLoading } = useXCetusStore()

  return (
    <VStack w={{ base: '100%', lg: '100%' }} gap={{ base: '20px', lg: '28px' }} zIndex="100" mt={{ base: '20px', lg: '32px' }}>
      <VStack
        w="100%"
        h="140px"
        gap="20px"
        borderRadius="20px"
        bg={{ base: 'none', lg: "center / cover no-repeat url('/images/xcetus_banner.png')" }}
        align="center"
        justify="center"
      >
        <Text
          h={{ base: '28px', lg: '32px' }}
          fontSize={{ base: '22px', lg: '32px' }}
          lineHeight={{ base: '28px', lg: '32px' }}
          fontWeight="600"
          fontStyle="normal"
          color="text_caption"
        >
          Manage your{' '}
          <Text
            as="span"
            h={{ base: '28px', lg: '32px' }}
            fontSize={{ base: '22px', lg: '32px' }}
            lineHeight={{ base: '28px', lg: '32px' }}
            fontWeight="600"
            fontStyle="normal"
            color="text_green"
          >
            CETUS
          </Text>{' '}
          and{' '}
          <Text
            as="span"
            h={{ base: '28px', lg: '32px' }}
            fontSize={{ base: '22px', lg: '32px' }}
            lineHeight={{ base: '28px', lg: '32px' }}
            fontWeight="600"
            fontStyle="normal"
            color="primary"
          >
            xCETUS
          </Text>
        </Text>
        <Button
          h="28px"
          w="132px"
          fontSize="14px"
          fontWeight="600"
          variant="outline"
          bg="transparent"
          borderRadius="8px"
          borderColor="text_highlight"
          color="text_highlight"
          onClick={() => {
            window.open('https://cetus-1.gitbook.io/cetus-docs/tokenomics/xcetus', '_blank')
          }}
        >
          Learn more
        </Button>
      </VStack>

      <Stack
        flexDir={{ base: 'column', lg: 'row' }}
        w={{ base: '100%', lg: '80%' }}
        justifyContent={{ base: 'space-between', lg: 'space-around' }}
        align={{ base: 'flex-start', lg: 'center' }}
        gap={{ base: '16px', lg: '40px' }}
      >
        <StakeSummaryItem
          isLoading={isLoading}
          icon="/images/icon_my_total_xWHALE@2x.png"
          title="My total xCETUS"
          amount={currentAccount ? formatNumber(fromDecimalsAmountFix(totalAmount, 9), 9).toString() : '--'}
          w={{ base: '28px', lg: '42px' }}
          h={{ base: '24px', lg: '36px' }}
          wrapStyle={{ gap: '2px' }}
        />
        <StakeSummaryItem
          isLoading={isLoading || availableXCetusAmountLoading}
          icon="/images/icon_available_xWHALE@2x.png"
          title="Available xCETUS"
          amount={currentAccount ? formatNumber(fromDecimalsAmountFix(availableAmount, 9), 9).toString() : '--'}
          w={{ base: '24px', lg: '36px' }}
          h={{ base: '24px', lg: '36px' }}
        />
        <StakeSummaryItem
          isLoading={isLoading || availableXCetusAmountLoading}
          icon="/images/icon_redeeming_xWHALE@2x.png"
          title="Redeeming xCETUS"
          amount={currentAccount ? formatNumber(fromDecimalsAmountFix(redeemingAmount, 9), 9).toString() : '--'}
          w={{ base: '26px', lg: '38px' }}
          h={{ base: '26px', lg: '38px' }}
        />
      </Stack>
    </VStack>
  )
}

type StakeSummaryItemProps = {
  isLoading: boolean
  icon: string
  title: string
  amount: string
  w: ImageProps['w']
  h: ImageProps['h']
  wrapStyle?: StackProps
}

function StakeSummaryItem(props: StakeSummaryItemProps) {
  const { isLoading, icon, title, amount, w, h, wrapStyle = {} } = props
  const { isApp } = useWindowWidth()
  return isApp ? (
    <HTextLabelBox
      label={
        <HStack {...wrapStyle}>
          <Image src={icon} w={w} h={h} />
          <Text>{title}</Text>
        </HStack>
      }
      value={amount}
      isLoading={isLoading}
      labelStyle={{
        fontSize: '14px',
        color: 'primary_gray'
      }}
      valueStyle={{
        fontSize: '14px'
      }}
    />
  ) : (
    <HStack gap="6px" alignItems="center" w={{ base: '100%', lg: 'auto' }} {...wrapStyle}>
      <Image src={icon} w={w} h={h} />
      <VTextLabelBox
        wrapStyle={{
          gap: '8px'
        }}
        title={title}
        titleStyle={{
          fontSize: '14px',
          color: 'primary_gray'
        }}
        valueStyle={{
          fontSize: '16px',
          fontWeight: '500'
        }}
        value={amount}
        isLoading={isLoading}
      />
    </HStack>
  )
}
