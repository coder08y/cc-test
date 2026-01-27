import useDlmmLiquidityStore from '@/store/dlmm'
import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { StrategyType } from '@cetusprotocol/dlmm-sdk'
import { HStack, Image, Stack, StackProps, Text } from '@chakra-ui/react'

function SelectStrategy() {
  const { strategy, setStrategy } = useDlmmLiquidityStore()
  const { isApp } = useWindowWidth()
  return (
    <HStack w="100%" justify="space-between" gap={isApp ? '6px' : '0px'}>
      <Strategy size="m" type={StrategyType.Spot} isActive={strategy === StrategyType.Spot} onClick={() => setStrategy(StrategyType.Spot)} />
      <Strategy size="m" type={StrategyType.Curve} isActive={strategy === StrategyType.Curve} onClick={() => setStrategy(StrategyType.Curve)} />
      <Strategy size="m" type={StrategyType.BidAsk} isActive={strategy === StrategyType.BidAsk} onClick={() => setStrategy(StrategyType.BidAsk)} />
    </HStack>
  )
}

type StrategyProps = {
  isActive: boolean
  onClick: (type: StrategyType) => void
  type: StrategyType
  size?: 's' | 'm' | 'l'
}

const strategyMap = {
  [StrategyType.Spot]: {
    title: 'Spot',
    activeIcon: '/images/strategy/img_spo_sel.png',
    inactiveIcon: '/images/strategy/img_spo_nor.png',
    tooltip: 'Evenly distributes liquidity across the selected price range, providing uniform coverage throughout the range.'
  },
  [StrategyType.Curve]: {
    title: 'Curve',
    activeIcon: '/images/strategy/img_cur_sel.png',
    inactiveIcon: '/images/strategy/img_cur_nor.png',
    tooltip: 'Concentrates liquidity within your selected price range to enhance capital efficiency.'
  },
  [StrategyType.BidAsk]: {
    title: 'Bid-Ask',
    activeIcon: '/images/strategy/img_bid_sel.png',
    inactiveIcon: '/images/strategy/img_bid_nor.png',
    tooltip: 'Allocates liquidity in an inverse curve distribution to capture volatility of bid-ask spread.'
  }
}

const styleMap: Record<'s' | 'm' | 'l', StackProps> = {
  s: {
    flexDir: 'column-reverse',
    gap: '8px',
    p: '12px'
  },
  m: {
    flexDir: 'column-reverse',
    gap: '6px',
    align: 'center',
    p: '8px 12px 8px'
  },
  l: {
    flexDir: 'column-reverse',
    gap: '8px',
    p: '12px 44px'
  }
}

const sizeMap = {
  s: {
    w: '60px',
    h: '24px'
  },
  m: {
    w: '86px',
    h: '24px'
  },
  l: {
    w: '80px',
    h: '32px'
  }
}

export const Strategy = ({ isActive, onClick, type, size = 's' }: StrategyProps) => {
  const { title, activeIcon, inactiveIcon, tooltip } = strategyMap[type]

  const style = styleMap[size]

  const { w, h } = sizeMap[size]
  const { isApp } = useWindowWidth()

  return (
    <CetusTooltip
      gutter={-4}
      tooltip={
        <Text fontSize="12px" lineHeight="20px">
          {tooltip}
        </Text>
      }
      showTooltip={isApp ? false : true}
      triggerStyle={{
        flex: '1'
      }}
    >
      <Stack
        w="100%"
        bg={
          isActive
            ? "center -10px / cover no-repeat url('/images/strategy/img_light.png')"
            : "center -80px / cover no-repeat url('/images/strategy/img_light.png') "
        }
        {...style}
        alignItems="center"
        onClick={() => onClick(type)}
        cursor="pointer"
        _hover={{ p: { color: 'text_caption' } }}
        sx={{
          ...(isApp && {
            borderRadius: '8px',
            border: '1px solid',
            borderColor: 'border',
            backgroundColor: isActive ? 'primary_opacity.10' : 'transparent',
            p: '8px 16px'
          })
        }}
        // border="1px solid"
        // borderColor={!isActive ? 'border' : 'transparent'}
      >
        <Text
          whiteSpace="nowrap"
          fontSize={isApp ? '12px' : '14px'}
          fontWeight={isActive ? '500' : '400'}
          color={isActive ? 'primary !important' : 'primary_gray'}
        >
          {title}
        </Text>
        <Image src={isActive ? activeIcon : inactiveIcon} w={{ base: '50px', lg: w }} h={{ base: '24px', lg: h }} opacity={isActive ? 1 : 0.5} />
      </Stack>
    </CetusTooltip>
  )
}

export default SelectStrategy
