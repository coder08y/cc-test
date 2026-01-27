import useXCetusCancelAction from '@/hooks/xcetus/useXCetusCancelAction'
import useXCetusClaimAction from '@/hooks/xcetus/useXCetusClaimAction'
import { Block } from '@cetus/design'
import useCountdown from '@cetus/hooks/src/useCountdown'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { LockCetus, XCetusUtil } from '@cetusprotocol/xcetus-sdk'
import { Button, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import XCetusToCetus from './XCetusToCetus'

type RewardVestingProps = {
  lockCetusList: LockCetus[]
}

export function RewardVesting(props: RewardVestingProps) {
  const { lockCetusList } = props
  return (
    <Block p={{ base: '16px 8px 8px', lg: '16px' }} borderRadius="16px">
      <VStack w="100%" alignItems="start" gap="16px">
        <Text fontSize="16px" color="text_caption" mt="4px">
          Vesting
        </Text>

        {lockCetusList.map(item => {
          return <RewardVestingItem key={item.id} info={item} />
        })}
      </VStack>
    </Block>
  )
}

type RewardVestingItemProps = {
  info: LockCetus
}

function RewardVestingItem(props: RewardVestingItemProps) {
  const { info } = props
  const [isCanClaim, setIsCanClaim] = useState<boolean>(false)
  const { days, hours, minutes, seconds } = useCountdown(
    info.locked_until_time * 1000,
    () => {
      setIsCanClaim(true)
    },
    'days'
  )

  useEffect(() => {
    setIsCanClaim(!XCetusUtil.isLocked(info))
  }, [])

  const { cancelOrderLoading, handleCancelOrder } = useXCetusCancelAction()
  const { claimOrderLoading, handleClaimOrder } = useXCetusClaimAction()
  const handleButtonClick = (isClickClaim: boolean) => {
    if (isClickClaim) {
      handleClaimOrder(info.id)
    } else {
      handleCancelOrder(info)
    }
  }
  const { isApp } = useWindowWidth()
  return (
    <Block borderRadius="12px" p={{ base: '20px 12px', lg: '20px 24px' }} bg="bg_primary">
      <Stack
        flexDir={{ base: 'column', lg: 'row' }}
        w="100%"
        justifyContent={{ base: 'flex-start', lg: 'space-between' }}
        gap={{ base: '20px', lg: '8px' }}
      >
        <VStack gap={{ base: '20px', lg: '8px' }} alignItems="start">
          <HStack gap="6px">
            <Text color="primary_gray">Available {isCanClaim ? '' : ' in'} </Text>
            {!isCanClaim && (
              <Text color="text_caption">
                {days}d : {hours}h : {minutes}m : {seconds}s
              </Text>
            )}
          </HStack>
          <XCetusToCetus xcetus_amount={info?.xcetus_amount} cetus_amount={info?.cetus_amount} />
        </VStack>
        <HStack w={{ base: '100%', lg: 'auto' }} justify="center">
          <Button
            onClick={() => {
              if (cancelOrderLoading || claimOrderLoading) {
                return
              }

              if (isCanClaim) {
                handleButtonClick(true)
              } else {
                handleButtonClick(false)
              }
            }}
            variant="outline"
            h={{ base: '40px', lg: '28px' }}
            w={{ base: '168px', lg: '80px' }}
            borderRadius={{ base: '12px', lg: '8px' }}
            fontSize="14px"
            isLoading={cancelOrderLoading || claimOrderLoading}
            color={isCanClaim ? 'text_highlight' : 'primary_gray'}
            bg="button_ghost_bg"
          >
            {isCanClaim ? 'Claim' : 'Cancel'}
          </Button>
        </HStack>
      </Stack>
    </Block>
  )
}
