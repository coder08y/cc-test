import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HTextLabelBox, Icon, SingleCoinImage } from '@cetus/ui-kit'
import { abbreviateTokenName, formatNumberWithDown } from '@cetus/utils'
import { HStack, Text, VStack } from '@chakra-ui/react'

interface AssetsInfoSettledBalanceProps {
  currentDeepBookPool: any
  currentSettledBalance: {
    baseSettle: string
    quoteSettle: string
    canClaim: boolean
  }
  onClaim: () => void
}

export default function AssetsInfoSettledBalance({ currentDeepBookPool, currentSettledBalance, onClaim }: AssetsInfoSettledBalanceProps) {
  const { isApp } = useWindowWidth()
  return (
    <VStack
      sx={{
        bg: 'background',
        p: '8px',
        w: '100%',
        alignContent: 'flex-start',
        gap: '12px',
        mt: isApp ? '12px' : '4px',
        borderRadius: '6px',
        border: '1px solid',
        borderColor: 'border',
        mb: '12px'
      }}
    >
      <HTextLabelBox
        isLoading={false}
        label={
          <HStack gap="2px" alignItems="center">
            <Text fontSize="12px">Settled Balance</Text>
            <CetusTooltip
              tooltip={
                <Text fontSize="12px" lineHeight={'16px'}>
                  Settled balance will be claimed automatically to your free balance if you conduct new actions in the same pool. Or you could
                  manually claim it to wallet from here
                </Text>
              }
              placement="top"
            >
              <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
            </CetusTooltip>
          </HStack>
        }
        value={
          <Text
            color={currentSettledBalance.canClaim ? 'primary' : 'text_paragraph'}
            fontSize="12px"
            cursor={currentSettledBalance.canClaim ? 'pointer' : 'default'}
            opacity={currentSettledBalance.canClaim ? 1 : 0.5}
            onClick={() => {
              if (currentSettledBalance.canClaim) {
                onClaim()
              }
            }}
          >
            Claim
          </Text>
        }
        labelStyle={{ fontSize: '12px', h: '16px', lineHeight: '16px' }}
        valueStyle={{ fontSize: '12px', h: '16px', lineHeight: '16px' }}
        skeletonStyle={{ valueW: '96px', valueH: '16px' }}
      />

      <HTextLabelBox
        isLoading={false}
        label={
          <HStack gap="2px" alignItems="center">
            <HStack w="100%">
              <SingleCoinImage
                imageUrl={currentDeepBookPool?.baseAssets?.logo_url}
                imgBoxStyle={{ w: '20px', h: '20px' }}
                imageStyle={{ w: '20px', h: '20px' }}
              />
              <Text color="text_caption">{abbreviateTokenName(currentDeepBookPool?.baseAssets?.symbol)}</Text>
            </HStack>
          </HStack>
        }
        value={
          <Text color="text_caption" fontSize="12px">
            {formatNumberWithDown(currentSettledBalance.baseSettle)}
          </Text>
        }
        labelStyle={{ fontSize: '12px', h: '20px', lineHeight: '20px' }}
        valueStyle={{ fontSize: '12px', h: '20px', lineHeight: '20px' }}
        skeletonStyle={{ valueW: '96px', valueH: '20px' }}
      />

      <HTextLabelBox
        isLoading={false}
        label={
          <HStack gap="2px" alignItems="center">
            <HStack w="100%">
              <SingleCoinImage
                imageUrl={currentDeepBookPool?.quoteAssets?.logo_url}
                imgBoxStyle={{ w: '20px', h: '20px' }}
                imageStyle={{ w: '20px', h: '20px' }}
              />
              <Text color="text_caption">{abbreviateTokenName(currentDeepBookPool?.quoteAssets?.symbol)}</Text>
            </HStack>
          </HStack>
        }
        value={
          <Text color="text_caption" fontSize="12px">
            {formatNumberWithDown(currentSettledBalance.quoteSettle)}
          </Text>
        }
        labelStyle={{ fontSize: '12px', h: '20px', lineHeight: '20px' }}
        valueStyle={{ fontSize: '12px', h: '20px', lineHeight: '20px' }}
        skeletonStyle={{ valueW: '96px', valueH: '20px' }}
      />
    </VStack>
  )
}
