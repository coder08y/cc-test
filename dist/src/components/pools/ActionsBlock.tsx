import useNavigateToLiquidity from '@/hooks/clmm/useNavigateToLiquidity'
import useCurrentVaultsFarm from '@/hooks/vaults-farming/useCurrentVaultsFarm'
import useGlobalStore from '@/store/common/global'
import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import { CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { cancelBubble } from '@cetus/utils'
import { Button, Center, HStack, Popover, PopoverBody, PopoverContent, PopoverTrigger, Portal, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import AnalyticsChartsModal from '../liquidity/clmm/analytics/AnalyticsChartsModal'
import FarmingModal from '../vaults-v2/farming/FarmingModal'
import VaultModal from '../vaults-v2/modal'
import ActionContent from './ActionContent'
import VaultsFarmingStar from './VaultsFarmingStar'

function ActionsBlock({ poolInfo }: { poolInfo: any }) {
  const { isApp } = useWindowWidth()
  const [isOpenVaultModal, setIsOpenVaultModal] = useState(false)
  const [isShowAutoTip, setIsShowAutoTip] = useState(false)
  const { clearVaultsActionData } = useVaultsActionStore()

  useEffect(() => {
    clearVaultsActionData()
  }, [isOpenVaultModal])

  const [isOpenFarmingModal, setIsOpenFarmingModal] = useState(false)
  const [farmingModalAction, setFarmingModalAction] = useState('Stake')
  const { isVaultsFarming, currentVaultsFarm, isActiveVaultsFarming } = useCurrentVaultsFarm(poolInfo?.vaultId)

  const [isOpenAnalyticsModal, setIsOpenAnalyticsModal] = useState(false)

  return (
    <>
      {isApp ? (
        <HStack>
          <AutoButton
            poolInfo={poolInfo}
            isOpenVault={isOpenVaultModal}
            onOpenVaultChange={isOpen => setIsOpenVaultModal(isOpen)}
            isShowAutoTip={isShowAutoTip}
            onShowAutoTipChange={isShow => setIsShowAutoTip(isShow)}
            isOpenFarming={isOpenFarmingModal}
          />
          <DepositButton poolInfo={poolInfo} />
        </HStack>
      ) : (
        <HStack
          w={{
            base: 'calc(100vw - 8px)',
            lg: 'unset'
          }}
          pr={{
            base: '16px',
            lg: 'unset'
          }}
          justify={isApp ? 'space-between' : 'flex-end'}
          gap="8px"
        >
          <AutoButton
            poolInfo={poolInfo}
            isOpenVault={isOpenVaultModal}
            onOpenVaultChange={isOpen => setIsOpenVaultModal(isOpen)}
            isShowAutoTip={isShowAutoTip}
            onShowAutoTipChange={isShow => setIsShowAutoTip(isShow)}
            isOpenFarming={isOpenFarmingModal}
          />
          <DepositButton poolInfo={poolInfo} />
          <Popover
            isLazy
            trigger={isApp ? 'click' : 'hover'}
            placement={isApp ? 'top-start' : 'bottom-end'}
            autoFocus={false}
            returnFocusOnClose={false}
          >
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
                  <ActionContent poolInfo={poolInfo} changeAnalyticsModal={(isOpen: boolean) => setIsOpenAnalyticsModal(isOpen)} />
                </PopoverBody>
              </PopoverContent>
            </Portal>
          </Popover>
        </HStack>
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

      {isOpenFarmingModal && (
        <FarmingModal
          isOpen={isOpenFarmingModal}
          setIsOpen={setIsOpenFarmingModal}
          setIsOpenPre={setIsOpenVaultModal}
          onClose={() => setIsOpenFarmingModal(false)}
          farmingModalAction={farmingModalAction}
          vaultsId={poolInfo?.vaultId}
          isDetail={false}
        />
      )}

      {isOpenAnalyticsModal && (
        <AnalyticsChartsModal poolInfo={poolInfo} isOpen={isOpenAnalyticsModal} onClose={() => setIsOpenAnalyticsModal(false)} />
      )}
    </>
  )
}

export default ActionsBlock

const DepositButton = ({ poolInfo }: { poolInfo: any }) => {
  const { setBackUrl } = useGlobalStore()
  const { goLiquidity } = useNavigateToLiquidity()
  return (
    <Button
      p={{ base: '6px', lg: '8px' }}
      h={{ base: '22px', lg: '32px' }}
      fontSize={{ base: '12px', lg: '12px' }}
      borderRadius={{ base: '6px', lg: '8px' }}
      fontWeight="500"
      onClick={() => {
        setBackUrl('/pools')
        // navigate(`/liquidity?poolAddress=${poolInfo?.poolAddress}`)
        goLiquidity(`/clmm?poolAddress=${poolInfo?.poolAddress}`, poolInfo)
      }}
    >
      Deposit
    </Button>
  )
}

interface AutoButtonProps {
  poolInfo: any
  isOpenVault: boolean
  onOpenVaultChange: (isOpen: boolean) => void
  isShowAutoTip: boolean
  onShowAutoTipChange: (isShow: boolean) => void
  isOpenFarming: boolean
}

const AutoButton = ({ poolInfo, isOpenVault, onOpenVaultChange, isShowAutoTip, onShowAutoTipChange, isOpenFarming }: AutoButtonProps) => {
  const { isVaultsFarming, currentVaultsFarm, isActiveVaultsFarming } = useCurrentVaultsFarm(poolInfo?.vaultId)

  const { isApp } = useWindowWidth()
  return poolInfo.vaultCategory ? (
    isApp ? (
      <OnlyAutoButton
        poolInfo={poolInfo}
        isOpenVault={isOpenVault}
        onOpenVaultChange={onOpenVaultChange}
        isShowAutoTip={isShowAutoTip}
        onShowAutoTipChange={onShowAutoTipChange}
        isOpenFarming={isOpenFarming}
        isVaultsFarming={isVaultsFarming}
        isActiveVaultsFarming={isActiveVaultsFarming}
      />
    ) : (
      <CetusTooltip
        placement="bottom-end"
        tooltip={
          isVaultsFarming && isActiveVaultsFarming ? (
            <VStack p="4px 4px 0" alignItems="flex-start">
              <Text fontSize="12px" color="text_caption">
                3rd party farming rewards available.
              </Text>
              <Text fontSize="12px">Incentives on Haedal</Text>
            </VStack>
          ) : (
            <Text
              _hover={{ color: 'primary' }}
              cursor="pointer"
              color={isApp ? 'primary' : 'text_paragraph'}
              onClick={(e: any) => {
                cancelBubble(e)
                onOpenVaultChange(!isOpenVault)
              }}
            >
              Auto
            </Text>
          )
        }
        showTooltip={isShowAutoTip && !isOpenFarming && !isOpenVault}
      >
        <OnlyAutoButton
          poolInfo={poolInfo}
          isOpenVault={isOpenVault}
          onOpenVaultChange={onOpenVaultChange}
          isShowAutoTip={isShowAutoTip}
          onShowAutoTipChange={onShowAutoTipChange}
          isOpenFarming={isOpenFarming}
          isVaultsFarming={isVaultsFarming}
          isActiveVaultsFarming={isActiveVaultsFarming}
        />
      </CetusTooltip>
    )
  ) : null
}

interface OnlyAutoButtonProps extends AutoButtonProps {
  isVaultsFarming: boolean
  isActiveVaultsFarming?: boolean
}

const OnlyAutoButton = ({
  poolInfo,
  isOpenVault,
  onOpenVaultChange,
  isShowAutoTip,
  onShowAutoTipChange,
  isOpenFarming,
  isVaultsFarming,
  isActiveVaultsFarming
}: OnlyAutoButtonProps) => {
  const { isApp } = useWindowWidth()
  const [isHover, setIsHover] = useState(false)
  return (
    <Center position="relative">
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
          cancelBubble(e)
          e.preventDefault()
          onOpenVaultChange(!isOpenVault)
        }}
        onMouseMove={() => {
          onShowAutoTipChange(true)
          if (isApp) return
          setIsHover(true)
        }}
        onMouseLeave={() => {
          // setIsShowAutoTip(false)
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
  )
}
