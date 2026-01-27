import usePositionCompoundStore from '@/store/position/compound'
import { SingleCoinImage } from '@cetus/ui-kit'
import TextWrap from '@cetus/ui-kit/src/components/TextWarp'
import { formatNumber, textEllipses } from '@cetus/utils'
import { Button, HStack, Text, VStack } from '@chakra-ui/react'

type ClaimStandardProps = {
  isClaimLoading: boolean
  toClaim: () => void
}

function ClaimStandard({ toClaim, isClaimLoading }: ClaimStandardProps) {
  const { rewardAndFeeList } = usePositionCompoundStore()
  return (
    <VStack w="100%" align="flex-start">
      <Text mt="4px" fontSize="12px" lineHeight="16px">
        The following tokens will be claimed to your wallet
      </Text>
      {rewardAndFeeList?.length > 0 && (
        <VStack gap="8px" w="100%" borderRadius="14px" bgColor="blue_bg" backgroundPosition="center" backgroundSize="100% 100%" p="12px">
          {rewardAndFeeList?.map((reward: any) => (
            <HStack key={reward?.token?.coin_type} w="100%" justify="space-between">
              <HStack gap="4px">
                <SingleCoinImage imageUrl={reward?.token?.logo_url} imgBoxStyle={{ w: '18px', h: '18px' }} />
                <Text fontWeight="500">{textEllipses(reward?.token?.symbol, 10)}</Text>
              </HStack>

              {/* <Text fontWeight="500" color="text_caption">
                {formatNumber(reward?.amount)}
              </Text> */}
              <TextWrap color="text_caption" fontWeight="500" w={{ base: 'unset', lg: '172px' }} boxStyle={{ w: '172px', p: { textAlign: 'right' } }}>
                {formatNumber(reward?.amount)}
              </TextWrap>
            </HStack>
          ))}
        </VStack>
      )}
      <Button
        onClick={toClaim}
        isLoading={isClaimLoading}
        disabled={isClaimLoading || !rewardAndFeeList || rewardAndFeeList?.length == 0}
        fontWeight="500"
        h="48px"
        w="100%"
        mt="8px"
      >
        Claim
      </Button>
    </VStack>
  )
}

export default ClaimStandard
