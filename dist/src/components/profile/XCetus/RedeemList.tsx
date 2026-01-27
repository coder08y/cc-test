import XCetusToCetus from '@/components/xcetus/XCetusToCetus'
import useXCetusCancelAction from '@/hooks/xcetus/useXCetusCancelAction'
import useXCetusClaimAction from '@/hooks/xcetus/useXCetusClaimAction'
import useXCetusStore from '@/store/xcetus/useXCetus'
import useCountdown from '@cetus/hooks/src/useCountdown'
import { Icon, Pagination } from '@cetus/ui-kit'
import { LockCetus, XCetusUtil } from '@cetusprotocol/xcetus-sdk'
import { Box, Button, Center, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
function RedeemList() {
  const { lockCetusList, lockCetusListLoading } = useXCetusStore()
  const [paginationList, setPaginationList] = useState<LockCetus[]>([])
  const [total, setTotal] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10
  useEffect(() => {
    if (lockCetusList?.length > 0) {
      const start = (currentPage - 1) * pageSize
      if (lockCetusList?.length <= start) {
        setCurrentPage(1)
      }
    }
  }, [lockCetusList])
  useEffect(() => {
    if (lockCetusList?.length > 0) {
      setTotal(lockCetusList?.length)
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      console.log('🚀 ~ useEffect ~ start:', currentPage, lockCetusList.slice(0, end), start, end)
      if (lockCetusList?.length > start) {
        setPaginationList(lockCetusList.slice(start, end))
      }
    }
  }, [currentPage, lockCetusList])

  return (
    lockCetusList &&
    lockCetusList.length > 0 && (
      <>
        {/* <Box w="100%" h="1px" bg="border" /> */}
        <VStack w="100%" align="flex-start" gap="12px">
          <Text fontWeight="500" fontSize="14px" color="text_caption">
            Vesting
          </Text>
          <VStack w="100%" gap="12px">
            {paginationList?.map(order => (
              <VestingItem key={order?.id} order={order} />
            ))}
          </VStack>

          {lockCetusList?.length > pageSize && (
            <Center w="100%">
              <Pagination
                total={total}
                size={pageSize}
                currentPage={currentPage}
                onChange={current => {
                  setCurrentPage(current)
                }}
              />
            </Center>
          )}
        </VStack>
      </>
    )
  )
}

const VestingItem = ({ order }: { order: LockCetus }) => {
  const [isCanClaim, setIsCanClaim] = useState<boolean>(!XCetusUtil.isLocked(order))

  useEffect(() => {
    setIsCanClaim(!XCetusUtil.isLocked(order))
  }, [order?.id])

  const { cancelOrderLoading, handleCancelOrder } = useXCetusCancelAction()
  const { claimOrderLoading, handleClaimOrder } = useXCetusClaimAction()

  const { days, hours, minutes, seconds } = useCountdown(
    order.locked_until_time * 1000,
    () => {
      setIsCanClaim(true)
    },
    'days'
  )
  const handleButtonClick = (isClickClaim: boolean) => {
    if (isClickClaim) {
      handleClaimOrder(order.id)
    } else {
      handleCancelOrder(order)
    }
  }

  return (
    <HStack
      flexDirection={{ base: 'column', lg: 'row' }}
      align={{ base: 'flex-start', lg: 'center' }}
      justify="space-between"
      w="100%"
      h={{ base: 'unset', lg: '80px' }}
      p={{ base: '12px', lg: '0 20px' }}
      bg={{ base: 'bg_secondary', lg: 'bg_nine' }}
      // border={{ base: '1px solid', lg: 'none' }}
      // borderColor={{ base: 'border', lg: 'none' }}
      borderRadius="12px"
    >
      {isCanClaim ? (
        <HStack p="8px 12px 8px 8px" borderRadius="8px" bg="primary_opacity.10">
          <Icon xlinkHref="#icon-icon_check" svgFill="primary" fontSize="20px" />
          <Text color="primary" fontSize="13px">
            Available
          </Text>
        </HStack>
      ) : (
        <HStack p="8px" borderRadius="8px" bg="text_paragraph_opacity.10">
          <Icon xlinkHref="#icon-icon_time" svgFill="text_paragraph" fontSize="20px" />
          <Box as="div">
            <Text as="span" color="text_paragraph" fontSize="13px">
              Available in{' '}
            </Text>
            <Text as="span" color="text_caption" fontSize="13px">
              {days}d : {hours}h : {minutes}m : {seconds}s
            </Text>
          </Box>
        </HStack>
      )}
      <HStack flexDirection={{ base: 'column', lg: 'row' }} align={{ base: 'flex-start', lg: 'center' }} w={{ base: '100%', lg: 'unset' }} gap="12px">
        <XCetusToCetus xcetus_amount={order.xcetus_amount} cetus_amount={order.cetus_amount} imageSize="20px" />
        <Button
          onClick={() => {
            if (cancelOrderLoading || claimOrderLoading) {
              return
            }
            handleButtonClick(isCanClaim)
          }}
          variant="unstyled"
          border="none"
          h="28px"
          w={{ base: '100%', lg: '80px' }}
          borderRadius="8px"
          fontSize="12px"
          display="flex"
          justifyContent="center"
          alignItems="center"
          isLoading={cancelOrderLoading || claimOrderLoading}
          color={isCanClaim ? 'background' : 'primary_gray'}
          bg={isCanClaim ? 'primary' : 'card_bg'}
          _hover={{
            bg: isCanClaim ? 'primary_hover' : 'button_ghost_hov_bg',
            color: isCanClaim ? 'background' : 'text_caption'
          }}
        >
          {isCanClaim ? 'Claim' : 'Cancel'}
        </Button>
      </HStack>
    </HStack>
  )
}

export default RedeemList
