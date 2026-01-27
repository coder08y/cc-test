import usePositionStore from '@/store/position'
import { Block } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { Icon } from '@cetus/ui-kit'
import { HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CoinPairInfo from '../common/CoinPairInfo'
import CompensationPositionItem from './CompensationPositionItem'

export default function CompensationPoolItem({ poolInfo, isShowPowered, isVault }: { poolInfo: any; isShowPowered: boolean; isVault: boolean }) {
  const navigate = useNavigate()
  const { posPoolsRelatedData } = usePositionStore()
  const [isOpenExpend, setIsOpenExpend] = useState(true)
  const feeDisplay = useMemo(() => {
    if (!isVault) {
      return (posPoolsRelatedData[poolInfo?.list?.[0]?.posId]?.displayFee || '--') + '%'
    }
    return poolInfo.feeDisplay
  }, [isVault, posPoolsRelatedData, poolInfo])
  const { isApp } = useWindowWidth()

  return (
    <Block w="100%" p={isApp ? '8px' : isOpenExpend ? '12px 16px 16px' : '12px 16px 8px'} borderRadius="16px">
      <VStack w="100%" gap={{ base: '16px', lg: '12px' }}>
        <Stack
          direction={{ base: 'column', lg: 'row' }}
          justify="space-between"
          w="100%"
          gap={{ base: '4px', lg: '8px' }}
          onClick={() => setIsOpenExpend(!isOpenExpend)}
          height={{
            lg: '64px'
          }}
        >
          <CoinPairInfo
            type="row"
            symbolFontWeight="500"
            symbolFontSize="16px"
            symbolEllipsesDecimals={10}
            nameEllipsesDecimals={20}
            poolInfo={{ feeDisplay, ...poolInfo, poolAddress: isVault ? poolInfo?.vaultId : poolInfo?.clmmPoolAddress, poolType: 'clmm' }}
            haveName={!isVault}
            isShowPowered={isShowPowered}
            versionBlockPosition="right"
            clickFun={() => {
              if (isVault) {
                navigate(`/vaults/${poolInfo?.vaultId}`)
              } else {
                navigate(`/clmm?poolAddress=${poolInfo?.clmmPoolAddress}`)
              }
            }}
          />

          <HStack flexDirection={{ base: 'column', lg: 'row' }} gap={{ base: '0px', lg: '8px' }}>
            <HStack
              mr={{ base: '0px', lg: '8px' }}
              w={{ base: '100%', lg: 'unset' }}
              justify={{ base: 'space-between', lg: 'flex-start' }}
              flexWrap={{ base: 'wrap', lg: 'nowrap' }}
            />
            <HStack w={{ base: '100%', lg: 'unset' }} flexDirection={{ base: 'column', lg: 'row' }} justify="space-between">
              <Block
                cursor="pointer"
                w={{ base: '100%', lg: 'unset' }}
                p="4px 0 4px 8px"
                h="32px"
                borderRadius="8px"
                bg="none"
                border={{ base: '1px solid', lg: 'none' }}
                borderColor="border"
                _hover={{
                  lg: {
                    svg: { fill: 'text_caption' },
                    p: { color: 'text_caption' }
                  }
                }}
              >
                <HStack justify="center" w="100%" h="100%" gap="4px">
                  <Text fontSize="12px" color={isOpenExpend ? 'text_caption' : 'text_paragraph'}>
                    {poolInfo?.list?.length} {poolInfo?.list?.length > 1 ? (isVault ? 'NFTs' : 'Positions') : isVault ? 'NFT' : 'Position'}
                  </Text>
                  <Icon
                    svgW="14px"
                    svgH="14px"
                    w="14px"
                    h="14px"
                    xlinkHref="#icon-icon_arrow"
                    fontSize="12px"
                    transition="transform 0.5s"
                    transform={isOpenExpend ? 'rotate(180deg)' : 'rotate(0deg)'}
                    svgFill={isOpenExpend ? 'text_caption' : 'text_paragraph'}
                  />
                </HStack>
              </Block>
            </HStack>
          </HStack>
        </Stack>
        {isOpenExpend && <CompensationPositionItem poolInfo={poolInfo} isVault={isVault} />}
      </VStack>
    </Block>
  )
}
