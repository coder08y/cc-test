import useCurrentVaultsFarm from '@/hooks/vaults-farming/useCurrentVaultsFarm'
import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import { DlmmPoolData } from '@/types/dlmm'
import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { cancelBubble } from '@cetus/utils'
import { Box, Button, Center, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, VStack } from '@chakra-ui/react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AnalyticsChartsModal from '../liquidity/dlmm/analytics/AnalyticsChartsModal'
import FarmingModal from '../vaults-v2/farming/FarmingModal'
import VaultModal from '../vaults-v2/modal'
import DLMMActionContent from './DLMMActionContent'
import VaultsFarmingStar from './VaultsFarmingStar'
function DLMMParentAction({ isOpen, list, onExpand = () => {} }: { isOpen: boolean; list: DlmmPoolData[]; onExpand?: () => void }) {
  const { isApp } = useWindowWidth()
  const isOnlyOneData = useMemo(() => list?.length === 1, [list])

  return isApp ? (
    <Button h="20px" variant="unstyled" display="flex" gap="2px" bg="transparent" onClick={onExpand}>
      <Box p="4px 8px" bg="primary_opacity.10" border="1px solid" borderColor="card_bg" borderRadius="10px" className="dlmm_action_pools">
        <Text fontWeight="500" fontSize="10px !important" color={isOpen ? 'text_caption' : 'primary_gray'}>
          {list?.length} {list?.length > 1 ? 'Pools' : 'Pool'}
        </Text>
      </Box>
      {/* {isOnlyOneData ? (
        <Icon xlinkHref="#icon-icon_descending_nor" transform="rotate(270deg)" transition="transform 0.5s" fontSize="20px" />
      ) : (
        <ExpandArrow isOpen={isOpen} />
      )} */}

      <Icon
        xlinkHref="#icon-icon_descending_nor"
        transform={isOnlyOneData ? 'rotate(270deg)' : isOpen ? 'rotate(-180deg)' : 'rotate(0deg)'}
        transition="transform 0.5s"
        fontSize="18px"
      />
    </Button>
  ) : (
    <Button variant="unstyled" display="flex" gap="4px" bg="transparent" className="dlmm_action">
      <Box p="3px 8px" bg="card_bg" border="1px solid" borderColor="card_bg" borderRadius="12px" className="dlmm_action_pools">
        <Text fontWeight="500" fontSize="12px" color={isOpen ? 'text_caption' : 'primary_gray'}>
          {list?.length} {list?.length > 1 ? 'Pools' : 'Pool'}
        </Text>
      </Box>
      {/* {isOnlyOneData ? (
        <Icon xlinkHref="#icon-icon_descending_nor" transform="rotate(270deg)" transition="transform 0.5s" fontSize="20px" />
      ) : (
        <ExpandArrow isOpen={isOpen} />
      )} */}
      <Icon
        xlinkHref="#icon-icon_descending_nor"
        transform={isOnlyOneData ? 'rotate(270deg)' : isOpen ? 'rotate(-180deg)' : 'rotate(0deg)'}
        transition="transform 0.5s"
        fontSize="20px"
      />
    </Button>
  )
}

function DLMMChildActions({ poolInfo }: { poolInfo: any }) {
  const { isApp } = useWindowWidth()
  const [isOpenVaultModal, setIsOpenVaultModal] = useState(false)
  const [isShowAutoTip, setIsShowAutoTip] = useState(false)
  const { clearVaultsActionData } = useVaultsActionStore()
  const [isHover, setIsHover] = useState(false)
  useEffect(() => {
    console.log('🚀🚀🚀 ~ ActionsBlock.tsx:22 ~ useEffect ~ clearVaultsActionData:')
    clearVaultsActionData()
  }, [isOpenVaultModal])
  const navigate = useNavigate()

  const [isOpenAnalyticsModal, setIsOpenAnalyticsModal] = useState(false)
  const [isOpenFarmingModal, setIsOpenFarmingModal] = useState(false)

  const { isVaultsFarming, isActiveVaultsFarming } = useCurrentVaultsFarm(poolInfo.vaultId)
  const [farmingModalAction, setFarmingModalAction] = useState('Stake')

  return (
    <HStack
      pr={{
        base: '0px',
        lg: 'unset'
      }}
      justify={isApp ? 'space-between' : 'flex-end'}
      gap="8px"
    >
      {poolInfo.vaultCategory ? (
        <CetusTooltip
          placement="bottom-end"
          tooltip={
            isVaultsFarming && isActiveVaultsFarming ? (
              <VStack p="4px 4px 0" alignItems="flex-start">
                <Text fontSize="12px" color="text_caption">
                  3rd party incentives available.
                </Text>
                <Text fontSize="12px">Incentives on Haedal</Text>
              </VStack>
            ) : (
              <Text
                _hover={{ color: 'primary' }}
                cursor="pointer"
                color={isApp ? 'primary' : 'text_paragraph'}
                onClick={(e: any) => {
                  e.stopPropagation()
                  setIsOpenVaultModal(!isOpenVaultModal)
                }}
              >
                Auto
              </Text>
            )
          }
          showTooltip={isShowAutoTip}
        >
          <Center>
            <Button
              p="0"
              variant="ghost"
              w={{
                base: '100%',
                lg: '32px'
              }}
              padding={{ base: '0 6px 0 2px', lg: '0px' }}
              h={{ base: '22px', lg: '32px' }}
              borderRadius={{ base: '6px', lg: '8px' }}
              sx={{
                _hover: {
                  svg: {
                    fill: 'primary'
                  }
                }
              }}
              onClick={(e: any) => {
                e.stopPropagation()
                e.preventDefault()
                setIsOpenVaultModal(!isOpenVaultModal)
              }}
              onMouseMove={() => {
                setIsShowAutoTip(true)
                setIsHover(true)
              }}
              onMouseLeave={() => {
                setIsShowAutoTip(false)
                setIsHover(false)
              }}
            >
              <Icon svgFill="text_paragraph" xlinkHref="#icon-icon_auto" svgW={isApp ? '14px' : '20px'} svgH={isApp ? '14px' : '20px'} />
              {isVaultsFarming && isActiveVaultsFarming && <VaultsFarmingStar isHover={isHover} />}
              {isApp && (
                <Text color="text_paragraph" marginLeft={{ base: '2px', lg: '4px' }} fontSize={{ base: '12px', lg: '14px' }} fontWeight="500">
                  Auto
                </Text>
              )}
            </Button>
          </Center>
        </CetusTooltip>
      ) : null}
      <Button
        w={{ base: '54px', lg: 'unset' }}
        p={{ base: '4px 8px', lg: '8px' }}
        h={{ base: '22px', lg: '32px' }}
        fontSize="12px"
        borderRadius={{ base: '6px', lg: '8px' }}
        fontWeight="500"
        onClick={() => {
          navigate(`/dlmm?poolId=${poolInfo?.poolId}`)
        }}
      >
        Deposit
      </Button>
      {!isApp && (
        <Popover isLazy trigger="hover" placement="bottom-end" autoFocus={false} returnFocusOnClose={false}>
          <PopoverTrigger>
            <Center
              onClick={(e: any) => {
                cancelBubble(e)
              }}
            >
              <Button
                variant="ghost"
                w="32px"
                h="32px"
                p="0"
                borderRadius="8px"
                sx={{
                  _hover: {
                    svg: {
                      fill: 'primary'
                    }
                  }
                }}
              >
                <Icon svgFill={isApp ? 'primary' : 'text_paragraph'} xlinkHref="#icon-icon_more" svgW="16px" svgH="16px" />
              </Button>
            </Center>
          </PopoverTrigger>
          <Portal>
            <PopoverContent borderRadius="12px" w="fit-content">
              <PopoverBody p="0" fontSize="12px" w="fit-content">
                <DLMMActionContent poolInfo={poolInfo} changeAnalyticsModal={(isOpen: boolean) => setIsOpenAnalyticsModal(isOpen)} />
              </PopoverBody>
            </PopoverContent>
          </Portal>
        </Popover>
      )}

      {isOpenAnalyticsModal && (
        <AnalyticsChartsModal poolInfo={poolInfo} isOpen={isOpenAnalyticsModal} onClose={() => setIsOpenAnalyticsModal(false)} />
      )}

      {isOpenVaultModal ? (
        <VaultModal
          key={poolInfo.vaultId}
          isOpen={isOpenVaultModal}
          setIsOpen={setIsOpenVaultModal}
          setIsOpenFarmingModal={setIsOpenFarmingModal}
          setFarmingModalAction={setFarmingModalAction}
          displayTokenA={poolInfo.displayTokenA}
          displayTokenB={poolInfo.displayTokenB}
          feeDisplay={poolInfo.feeDisplay}
          clmmPool={poolInfo.poolAddress}
          category={poolInfo.vaultCategory}
          vaultId={poolInfo.vaultId}
          isReverse={poolInfo.isReverse}
          isVaultsFarming={isVaultsFarming}
          onClose={() => {
            setIsShowAutoTip(false)
            setIsOpenVaultModal(false)
          }}
        />
      ) : null}

      {isOpenFarmingModal && poolInfo && (
        <FarmingModal
          isOpen={isOpenFarmingModal}
          setIsOpen={setIsOpenFarmingModal}
          setIsOpenPre={setIsOpenVaultModal}
          onClose={() => setIsOpenFarmingModal(false)}
          farmingModalAction={farmingModalAction}
          vaultsId={poolInfo.vaultId}
          isDetail={false}
        />
      )}
    </HStack>
  )
}

function DLMMActions({
  poolInfo,
  isParent,
  isOpen,
  list,
  onExpand,
  ...rest
}: {
  poolInfo: any
  isParent?: boolean
  isOpen?: boolean
  list?: DlmmPoolData[]
  onExpand?: () => void
  [key: string]: any
}) {
  return isParent ? <DLMMParentAction isOpen={isOpen!} list={list!} onExpand={onExpand} /> : <DLMMChildActions poolInfo={poolInfo} />
}

export default DLMMActions
