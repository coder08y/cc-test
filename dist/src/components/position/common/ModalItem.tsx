import { PoolShowInfo } from '@/components/common/CoinPairInfo'
import usePosHelper from '@/hooks/position/usePosHelper'
import useDlmmPositionStore from '@/store/dlmm-position'
import usePositionStore from '@/store/position'
import { Block, CetusTooltip } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CheckBox, Icon } from '@cetus/ui-kit'
import { Center, HStack, Text, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'
import FeesRewardsValueBlock from '../clmm/list/FeesRewardsValueBlock'
import LiquidityValueBlock from '../clmm/list/LiquidityValueBlock'

function ModalItem({
  posInfo,
  onClickCheckBox,
  checked,
  pageFrom,
  cursor = 'pointer'
}: {
  posInfo: any
  onClickCheckBox?: (item: any) => void
  checked?: boolean
  pageFrom?: 'lpBurnPrev' | 'lpBurnNext' | 'pendingYieldModal'
  cursor?: string
}) {
  const { getClmmPosName } = usePosHelper()
  const { posPoolsOriginalData } = usePositionStore()
  const tokenName = useMemo(() => {
    if (posInfo?.tokenName) {
      return posInfo?.tokenName.includes('Cetus') ? posInfo?.tokenName : `Cetus LP | ${posInfo?.tokenName}`
    } else {
      const position_index = posPoolsOriginalData?.[posInfo?.clmmPool]?.index
      return getClmmPosName(posInfo?.index, position_index)
    }
  }, [posInfo?.tokenName, posInfo?.index, posInfo?.clmmPool, posPoolsOriginalData])

  const { posPoolsRelatedData } = usePositionStore()
  const { dlmmPosPoolsRelatedData } = useDlmmPositionStore()
  const info = posPoolsRelatedData[posInfo?.posId] || dlmmPosPoolsRelatedData[posInfo?.id]
  const feeDisplay = info?.displayFee
  const binStep = info?.binStep

  const { isApp } = useWindowWidth()

  return (
    <Block w="100%" borderRadius="8px" p={{ base: '8px', lg: '0' }} bg={{ base: 'transparent', lg: 'bg_primary' }}>
      <HStack
        w="100%"
        bg={{ base: 'transparent', lg: 'bg_third' }}
        p={{ base: '0', lg: '12px 16px' }}
        mb={{ base: '8px', lg: '0' }}
        borderRadius="8px"
      >
        <VStack w="100%" align="flex-start" gap="16px">
          <PoolShowInfo
            poolInfo={{ ...posInfo, feeDisplay: feeDisplay?.includes('%') ? feeDisplay : feeDisplay + '%', binStep }}
            poolType={posInfo?.posType === 'dlmm' ? 'dlmm' : 'clmm'}
            symbolEllipsesDecimals={10}
            showPoolTypeTag={true}
            type="column"
            imgStyle={{
              w: '20px',
              h: '20px'
            }}
            symbolFontSize="12px"
          >
            {isApp && (
              <CetusTooltip
                tooltip={
                  <Text fontSize="12px" color="primary_gray">
                    {tokenName}
                  </Text>
                }
              >
                <Center ml="-4px">
                  <Icon xlinkHref="#icon-icon_tips" fontSize="16px" />
                </Center>
              </CetusTooltip>
            )}
          </PoolShowInfo>
          {!isApp && (
            <Text fontSize="12px" color="primary_gray">
              {tokenName}
            </Text>
          )}
        </VStack>
        {onClickCheckBox && (
          <CheckBox
            cursor={cursor}
            checked={checked || false}
            onClick={() => onClickCheckBox(posInfo)}
            wrapStyle={
              isApp
                ? {
                    width: '16px',
                    height: '16px',
                    sx: {
                      '& svg': {
                        w: '12px',
                        h: '12px',
                        fill: checked ? '#000 !important' : 'transparent !important'
                      }
                    }
                  }
                : {}
            }
          />
        )}
      </HStack>
      {pageFrom == 'pendingYieldModal' ? (
        <HStack
          p={{ base: '9px 8px', lg: '0px 16px' }}
          bg={{ base: 'primary_opacity.10', lg: 'transparent' }}
          w="100%"
          justify="space-between"
          gap="4px"
          align="flex-start"
          borderRadius={{ base: '6px', lg: '0' }}
        >
          <Text color="primary_gray" fontSize={{ base: '12px', lg: '14px' }} mb={{ base: '0', lg: '-12px' }} mt={{ base: '0', lg: '12px' }}>
            Claimable yield
          </Text>
          <FeesRewardsValueBlock posInfo={posInfo} />
        </HStack>
      ) : (
        <HStack justify="space-between" p="0 16px">
          <Text color="primary_gray" fontSize="14px" lineHeight="24px" h="24px">
            Liquidity
          </Text>
          <LiquidityValueBlock positionInfo={posInfo} color="primary" fontSize="14px" haveTooltip={pageFrom == 'lpBurnNext' ? false : true} />
        </HStack>
      )}
    </Block>
  )
}
export default ModalItem
