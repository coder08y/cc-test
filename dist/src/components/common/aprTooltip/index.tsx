import { PoolType } from '@/components/pools/createPool/SelectPoolType'
import { PoolApiInfo } from '@/types'
import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { cancelBubble } from '@cetus/utils'
import { DlmmPool } from '@cetusprotocol/dlmm-sdk'
import { Center, Divider, HStack, PlacementWithLogical, Skeleton, SkeletonCircle, Text, VStack } from '@chakra-ui/react'
import { ReactNode, Suspense, lazy } from 'react'
const TooltipInfo = lazy(() => import('./TooltipInfo'))
const AprTooltip = ({
  poolInfo,
  isPosition = false,
  showAprSize = '14px',
  children,
  placement = 'top',
  poolType = 'clmm'
}: {
  poolInfo: PoolApiInfo | DlmmPool
  poolType?: PoolType
  isPosition?: boolean
  showAprSize?: string
  children?: ReactNode
  placement?: PlacementWithLogical | undefined
}) => {
  const { isApp } = useWindowWidth()
  return (
    <HStack
      justify="flex-end"
      w="100%"
      onClick={e => {
        isApp ? cancelBubble(e) : ''
      }}
    >
      {(poolInfo?.haveFarming || poolInfo?.haveMining) && poolInfo?.totalAprDisplay !== '--' ? (
        <CetusTooltip
          placement={placement}
          maxW="350px"
          tooltip={
            <Suspense
              fallback={
                <VStack w="296px" h="279px" align="flex-start" gap="16px">
                  <Skeleton w="100%" h="16px" />
                  <Skeleton w="80%" h="16px" />
                  <Divider orientation="horizontal" />
                  <HStack justify="space-between" w="100%">
                    <Skeleton w="30%" h="20px" />
                    <Skeleton w="30%" h="20px" />
                  </HStack>
                  <HStack justify="space-between" gap="20px" w="100%">
                    <SkeletonCircle w="64px" h="64px" />
                    <VStack w="calc(100% - 84px)">
                      <HStack justify="space-between" w="100%">
                        <Skeleton w="40%" h="16px" />
                        <Skeleton w="30%" h="16px" />
                      </HStack>
                      <HStack justify="space-between" w="100%">
                        <Skeleton w="40%" h="16px" />
                        <Skeleton w="30%" h="16px" />
                      </HStack>
                      <HStack justify="space-between" w="100%">
                        <Skeleton w="40%" h="16px" />
                        <Skeleton w="30%" h="16px" />
                      </HStack>
                    </VStack>
                  </HStack>
                  <Skeleton w="40%" h="20px" />
                  <Skeleton w="70%" h="16px" />
                  <Skeleton w="70%" h="16px" />
                </VStack>
              }
            >
              <TooltipInfo poolInfo={poolInfo} poolType={poolType} />
            </Suspense>
          }
        >
          <Center>
            <AprInfo poolInfo={poolInfo} isPosition={isPosition} showAprSize={showAprSize} children={children} />
          </Center>
        </CetusTooltip>
      ) : (
        <Center>
          <AprInfo poolInfo={poolInfo} isPosition={isPosition} showAprSize={showAprSize} children={children} />
        </Center>
      )}
    </HStack>
  )
}
export default AprTooltip

const AprInfo = ({
  poolInfo,
  isPosition = false,
  showAprSize = '14px',
  children
}: {
  poolInfo: any
  isPosition?: boolean
  showAprSize?: string
  children?: ReactNode
}) => {
  return (
    <>
      {children ? (
        children
      ) : (
        <VStack flexDir={{ base: 'row', lg: 'column' }} align={{ base: 'center', lg: 'flex-end' }} gap="4px">
          <Text
            as="span"
            fontSize={showAprSize}
            textDecoration={isPosition ? 'underline dotted' : 'unset'}
            textUnderlineOffset={showAprSize == '12px' ? '1px' : '3px'}
            color="primary"
            fontWeight="500"
            cursor={poolInfo?.haveFarming || poolInfo?.haveMining ? 'help' : 'text'}
          >
            {isPosition ? poolInfo?.totalAprDisplay : poolInfo?.feeAndMiningAprDisplay}
          </Text>
          {!isPosition && poolInfo?.haveFarming && (
            <Text as="span" fontWeight="500" p="2px 4px" fontSize="12px" color="primary_yellow" bg="primary_yellow_opacity.10" borderRadius="4px">
              {poolInfo?.farmingAprDisplay == '--' ? '--' : '+' + poolInfo?.farmingAprDisplay}
            </Text>
          )}
        </VStack>
      )}
    </>
  )
}
