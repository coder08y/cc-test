import useCurrentVaultsFarm from '@/hooks/vaults-farming/useCurrentVaultsFarm'
import useVaultsActionStore from '@/store/vaults-v2/useVaultsAction'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Token } from '@cetus/types'
import { HTextLabelBox } from '@cetus/ui-kit'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect, useState } from 'react'
import FarmingModal from '../farming/FarmingModal'
import VaultsAprBlock from '../list/common/VaultsAprBlock'
import VaultModal from '../modal/index'

type VaultBannerProps = {
  displayTokenA?: Token
  displayTokenB?: Token
  feeDisplay: string
  clmmPool: string
  vaultId: string
  isReverse: boolean
  category: string // haedal | cetus
}

// 添加流动性页面Vault快捷入口
function VaultBanner(props: VaultBannerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { displayTokenA, displayTokenB, feeDisplay, clmmPool, vaultId, isReverse, category } = props
  const { isApp } = useWindowWidth()
  const { clearVaultsActionData } = useVaultsActionStore()

  useEffect(() => {
    clearVaultsActionData()
  }, [isOpen])

  const { isVaultsFarming } = useCurrentVaultsFarm(vaultId)

  const [isOpenFarmingModal, setIsOpenFarmingModal] = useState(false)
  const [farmingModalAction, setFarmingModalAction] = useState('Stake')

  return (
    <Box w="100%" sx={{ ...(isApp && { p: '0 12px' }) }}>
      <VStack
        width={isApp ? '100%' : '460px'}
        height="128px"
        backgroundImage="/images/bg_autorebalancer@2x.png"
        backgroundSize={{ base: '100% 130%', lg: '100% 100%' }}
        padding={{ base: '8px 12px 16px', lg: '12px 16px 20px' }}
        flexDirection="column"
        justifyContent="space-between"
        gap="8px"
        borderRadius={{ base: '12px', lg: '0' }}
      >
        <HStack width="100%" justifyContent="space-between" alignItems="center" py={{ base: '6px', lg: '0' }}>
          <Text
            as="div"
            fontSize={{ base: '14px', lg: '16px' }}
            lineHeight={{ base: '16px', lg: '20px' }}
            color={{ base: 'text_caption', lg: 'primary' }}
            fontWeight="500"
          >
            Join via an Auto Vault{' '}
            {isApp && (
              <HTextLabelBox
                label=""
                showLabel={false}
                wrapStyle={{
                  w: 'unset',
                  gap: isApp ? '4px' : '6px',
                  paddingBottom: '6px'
                  // mb: '4px'
                }}
                labelStyle={{
                  fontSize: isApp ? '12px' : '14px',
                  color: 'text_highlight',
                  fontWeight: '500'
                }}
                value={
                  <VaultsAprBlock
                    wrapStyle={{ flexDirection: 'row' }}
                    vaultId={vaultId}
                    apyTextStyle={{ fontSize: '12px' }}
                    farmingTextStyle={{ fontSize: '10px', p: '0px 4px', borderRadius: '8px' }}
                  />
                }
                valueStyle={{
                  color: 'text_highlight',
                  h: isApp ? '16px' : '20px',
                  lineHeight: isApp ? '16px' : '20px',
                  fontSize: isApp ? '12px' : '14px',
                  fontWeight: '500',
                  textDecoration: 'none'
                }}
              />
            )}
          </Text>
          <HStack>
            {!isApp && (
              <HTextLabelBox
                label=""
                wrapStyle={{
                  w: 'unset',
                  gap: isApp ? '4px' : '6px'
                }}
                labelStyle={{
                  fontSize: '14px',
                  color: 'text_highlight',
                  fontWeight: '500'
                }}
                value={<VaultsAprBlock wrapStyle={{ flexDirection: 'row' }} vaultId={vaultId} />}
                valueStyle={{
                  color: 'text_highlight',
                  h: '20px',
                  lineHeight: '20px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textDecoration: 'none'
                }}
              />
            )}
            <Button
              width={{ base: '61px', lg: '88px' }}
              height={{ base: '26px', lg: '24px' }}
              borderRadius={{ base: '6px', lg: '4px' }}
              fontSize="12px"
              onClick={() => setIsOpen(true)}
              fontWeight="500"
            >
              Deposit
            </Button>
          </HStack>
        </HStack>
        <HStack w="100%" mt={isApp ? '10px' : '14px'}>
          <Text
            lineHeight={isApp ? '16px' : '20px'}
            maxWidth="290px"
            fontSize={isApp ? '10px' : '12px'}
            sx={{ ...(isApp && { maxWidth: '217px', position: 'relative', top: '-3px' }) }}
          >
            Automate your LPing by selecting a {category == 'haedal' ? '3rd party' : ''} strategy provider and enjoy higher yields powered by experts!{' '}
          </Text>
        </HStack>
      </VStack>
      <VaultModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        displayTokenA={displayTokenA}
        displayTokenB={displayTokenB}
        feeDisplay={feeDisplay}
        clmmPool={clmmPool}
        vaultId={vaultId}
        isReverse={isReverse}
        category={category}
        isVaultsFarming={isVaultsFarming}
        setIsOpenFarmingModal={setIsOpenFarmingModal}
        setFarmingModalAction={setFarmingModalAction}
        onClose={() => setIsOpen(false)}
      />
      {isOpenFarmingModal && (
        <FarmingModal
          isOpen={isOpenFarmingModal}
          setIsOpen={setIsOpenFarmingModal}
          setIsOpenPre={setIsOpen}
          onClose={() => setIsOpenFarmingModal(false)}
          farmingModalAction={farmingModalAction}
          vaultsId={vaultId}
          isDetail={false}
        />
      )}
    </Box>
  )
}
export default VaultBanner
