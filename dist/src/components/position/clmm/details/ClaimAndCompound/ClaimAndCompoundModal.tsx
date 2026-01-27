import CoinPairInfo from '@/components/common/CoinPairInfo'
import Slippage from '@/components/common/Slippage'
import usePositionStore from '@/store/position'
import usePositionCompoundStore from '@/store/position/compound'
import { PosBaseInfo } from '@/types'
import { SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { RefreshButton, VaulDrawer } from '@cetus/ui-kit'
import { Box, HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import AfterCompound from './AfterCompound'
import ClaimMerged from './ClaimMerged'
import ClaimStandard from './ClaimStandard'
import ClaimableYield from './ClaimableYield'
import CompoundBlock from './CompoundBlock'
import PriceRangeBlock from './PriceRangeBlock'

type Props = {
  isOpen: boolean
  canCompound: boolean
  onClose: () => void
  currentTab: string
  totalYield: string
  isClaimLoading: boolean
  toClaim: () => void
  handleRefresh: () => void
}

function ClaimAndCompoundModal({ handleRefresh, toClaim, isClaimLoading, canCompound, isOpen, onClose, currentTab, totalYield }: Props) {
  const [modalTab, setModalTab] = useState(currentTab)
  const [currentClaim, setCurrentClaim] = useState('Standard')
  const claimList = ['Standard', 'Merged']
  const { currentPosBaseInfo, posPoolsRelatedData } = usePositionStore()
  const { mergeableRewards, compoundableRewards } = usePositionCompoundStore()
  const currentPosPoolsRelatedData = posPoolsRelatedData[currentPosBaseInfo?.posId as string]
  const displayFee = currentPosPoolsRelatedData?.displayFee + '%'
  const { isApp } = useWindowWidth()

  const tabList = useMemo(() => {
    const allTabs = [
      { label: 'Claim', value: 'Claim' },
      { label: 'Compound', value: 'Compound' }
    ]

    return allTabs.filter(tab => currentPosBaseInfo?.posType !== 'burn' || tab.value === 'Claim')
  }, [currentPosBaseInfo?.posType])

  return isApp ? (
    <VaulDrawer isOpen={isOpen} onClose={onClose} padding={modalTab === 'Claim' ? '12px 12px 24px' : '12px'}>
      <VStack align="flex-start">
        <ClaimAndCompoundHeader tabList={tabList} modalTab={modalTab} handleChangeTab={(item: any) => setModalTab(item?.value)} />
        <ClaimAndCompoundContent
          displayFee={displayFee}
          currentPosBaseInfo={currentPosBaseInfo}
          handleRefresh={handleRefresh}
          totalYield={totalYield}
          modalTab={modalTab}
          currentClaim={currentClaim}
          claimList={claimList}
          setCurrentClaim={setCurrentClaim}
          isClaimLoading={isClaimLoading}
          compoundableRewards={compoundableRewards}
          mergeableRewards={mergeableRewards}
          toClaim={toClaim}
        />
      </VStack>
    </VaulDrawer>
  ) : (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent
        w={{ base: '100%', lg: '820px' }}
        minW="unset"
        maxW="unset"
        p="0 !important"
        minH="300px"
        maxH="calc(100vh - 56px)"
        margin="0 !important"
      >
        <ModalHeader p="0px">
          <ClaimAndCompoundHeader tabList={tabList} modalTab={modalTab} handleChangeTab={(item: any) => setModalTab(item?.value)} />
        </ModalHeader>

        <ModalCloseButton />
        <ModalBody p={{ base: '20px 12px 16px', lg: '20px 16px 16px' }} maxH="calc(100% - 59px)" overflowY="scroll">
          <ClaimAndCompoundContent
            displayFee={displayFee}
            currentPosBaseInfo={currentPosBaseInfo}
            handleRefresh={handleRefresh}
            totalYield={totalYield}
            modalTab={modalTab}
            currentClaim={currentClaim}
            claimList={claimList}
            setCurrentClaim={setCurrentClaim}
            isClaimLoading={isClaimLoading}
            compoundableRewards={compoundableRewards}
            mergeableRewards={mergeableRewards}
            toClaim={toClaim}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

interface HeaderProps {
  tabList: { label: string; value: string }[]
  modalTab: string
  handleChangeTab: (item: any) => void
}

const ClaimAndCompoundHeader = (props: HeaderProps) => {
  const { tabList, modalTab, handleChangeTab } = props
  return (
    <Box p={{ base: '0', lg: '0 16px' }} borderBottom="1px solid" borderColor="border" w="100%">
      <SelectTab
        type="borderTab"
        wrapStyle={{
          w: 'fit-content',
          border: 'none',
          h: '58px',
          background: 'transparent',
          gap: '40px'
        }}
        itemStyle={{
          w: 'auto',
          fontSize: '16px'
        }}
        tabList={tabList}
        currentTab={modalTab}
        handleChangeTab={(item: any) => handleChangeTab(item)}
      />
    </Box>
  )
}

interface ClaimAndCompoundContentProps {
  displayFee: string
  currentPosBaseInfo: PosBaseInfo | null
  handleRefresh: () => void
  totalYield: string
  modalTab: string
  currentClaim: string
  claimList: string[]
  setCurrentClaim: (claimType: string) => void
  isClaimLoading: boolean
  compoundableRewards: any
  mergeableRewards: any
  toClaim: () => void
}

const ClaimAndCompoundContent = ({
  displayFee,
  currentPosBaseInfo,
  handleRefresh,
  totalYield,
  modalTab,
  currentClaim,
  claimList,
  setCurrentClaim,
  isClaimLoading,
  compoundableRewards,
  mergeableRewards,
  toClaim
}: ClaimAndCompoundContentProps) => {
  const { isApp } = useWindowWidth()
  return (
    <VStack w="100%" align="flex-start" spacing="16px">
      {/* Header: 币对 + 刷新按钮 */}
      <HStack w="100%" justify="space-between" m="-10px 0">
        <CoinPairInfo
          poolInfo={{
            feeDisplay: displayFee,
            poolAddress: currentPosBaseInfo?.clmmPool,
            ...currentPosBaseInfo
          }}
          symbolEllipsesDecimals={10}
          nameEllipsesDecimals={20}
          symbolFontSize="16px"
          placement="bottom-start"
          versionBlockPosition="right"
          type={isApp ? 'column' : 'row'}
          showPoolTypeTag
          moreDetails
        />
        <RefreshButton handleRefresh={handleRefresh} w="28px" h="28px" innerStyle={{ bg: 'none' }} />
      </HStack>

      <HStack flexDirection={{ base: 'column-reverse', lg: 'row' }} w="100%" justify="space-between" align="flex-start">
        {!isApp && (
          <VStack w={{ base: '100%', lg: '420px' }} align="flex-start">
            <ClaimableYield totalYield={totalYield} isShowMergeable={currentClaim === 'Merged'} isShowCompound={modalTab === 'Compound'} />
            {modalTab === 'Compound' && <PriceRangeBlock />}
          </VStack>
        )}

        <VStack w={{ base: '100%', lg: '360px' }}>
          <VStack w="100%" bg="rgba(180,216,240,0.06)" borderRadius="12px" p={{ base: '12px', lg: '16px' }}>
            {/* Claim 方式切换 */}
            <HStack w="100%" gap="20px" justify="space-between" h={modalTab === 'Compound' ? '28px' : '36px'}>
              {modalTab === 'Compound' ? (
                <Text color="text_caption" fontSize="16px">
                  Compound
                </Text>
              ) : (
                <HStack gap="4px" bg="bg_secondary" p="4px" borderRadius="10px" border="1px solid" borderColor="border">
                  {claimList.map(item => (
                    <Box
                      bg={item == currentClaim ? 'primary_opacity.10' : 'none'}
                      key={item}
                      p="6px 12px"
                      borderRadius="6px"
                      cursor="pointer"
                      onClick={() => setCurrentClaim(item)}
                      transition="all 0.2s"
                    >
                      <Text fontSize="14px" color={currentClaim === item ? 'primary' : 'text_paragraph'} _hover={{ color: 'primary' }}>
                        {item}
                      </Text>
                    </Box>
                  ))}
                </HStack>
              )}
              {/* && compoundableRewards?.length > 0 */}
              {((currentClaim === 'Merged' && mergeableRewards?.length > 0) || modalTab === 'Compound') && (
                <Slippage
                  slippageType="liquidity"
                  poolType="clmm"
                  showFastMode={false}
                  isModal={false}
                  tokenA={currentPosBaseInfo?.tokenA}
                  tokenB={currentPosBaseInfo?.tokenB}
                />
              )}
            </HStack>

            {/* 不同 Claim 模式下展示的内容 */}
            {modalTab === 'Compound' ? (
              <CompoundBlock />
            ) : currentClaim === 'Standard' ? (
              <ClaimStandard isClaimLoading={isClaimLoading} toClaim={toClaim} />
            ) : (
              <ClaimMerged />
            )}
          </VStack>
          {modalTab === 'Compound' && compoundableRewards?.length > 0 && <AfterCompound />}
        </VStack>
      </HStack>
    </VStack>
  )
}

export default ClaimAndCompoundModal
