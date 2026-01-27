import useCurrentVaults from '@/hooks/vault-v2/useCurrentVaults'
import useCalculateVaultFarmingApr from '@/hooks/vaults-farming/useCalculateVaultFarmingApr'
import useCurrentVaultsFarm from '@/hooks/vaults-farming/useCurrentVaultsFarm'
import { CetusTooltip } from '@cetus/design'
import { HTextLabelBox } from '@cetus/ui-kit'
import { Box, HStack, Skeleton, StackProps, Text, TextProps, VStack } from '@chakra-ui/react'
import { useMemo, useState } from 'react'

interface VaultsAprBlockProps {
  wrapStyle?: StackProps
  farmingTextStyle?: TextProps
  apyTextStyle?: TextProps
  vaultId: string
}

function VaultsAprBlock({ vaultId, wrapStyle, farmingTextStyle = {}, apyTextStyle = {} }: VaultsAprBlockProps) {
  const { currentVaultsFarm, isVaultsFarming, isActiveVaultsFarming } = useCurrentVaultsFarm(vaultId)
  const { vaultFarmingAprDisplay } = useCalculateVaultFarmingApr(currentVaultsFarm)
  const { currentVaults } = useCurrentVaults(vaultId)
  const { vaultsApyDisplay, vaultsLstApyDisplay, vaultsTotalApyDisplay, vaultsAprDisplay, category, status } = currentVaults || {}

  const displayApy = useMemo(() => {
    if (category == 'cetus') {
      return vaultsTotalApyDisplay ? vaultsTotalApyDisplay : '-'
    } else {
      return vaultsApyDisplay ? vaultsApyDisplay : '-'
    }
  }, [category, vaultsTotalApyDisplay, vaultsApyDisplay])

  const loading = useMemo(() => {
    if (category == 'cetus') {
      return !vaultsTotalApyDisplay
    } else {
      return !vaultsApyDisplay
    }
  }, [category, vaultsTotalApyDisplay, vaultsApyDisplay])

  return status !== 'sunset' ? (
    <CetusTooltip
      tooltip={
        category == 'cetus' ? (
          <VaultsAprTooltipContentLST
            vaultsApyDisplay={vaultsApyDisplay}
            vaultsLstApyDisplay={vaultsLstApyDisplay}
            vaultsTotalApyDisplay={vaultsTotalApyDisplay}
          />
        ) : (
          <VaultsAprTooltipContent
            vaultsApyDisplay={vaultsApyDisplay}
            vaultsAprDisplay={vaultsAprDisplay}
            vaultFarmingAprDisplay={vaultFarmingAprDisplay}
            isVaultsFarming={!!isActiveVaultsFarming}
          />
        )
      }
      placement="bottom"
    >
      <VStack
        gap={{
          base: '4px',
          lg: '2px'
        }}
        alignItems={{
          base: 'flex-end',
          lg: 'center'
        }}
        {...wrapStyle}
      >
        {loading ? (
          <Skeleton w="80px" h="20px" />
        ) : (
          <Text
            textColor="text_caption"
            textAlign="right"
            fontWeight="500"
            textDecoration={status === 'sunset' ? 'none' : 'underline dotted'}
            color={status === 'sunset' ? 'text_caption' : 'primary'}
            fontSize={{ base: '12px', lg: '14px' }}
            {...apyTextStyle}
          >
            {displayApy}
          </Text>
        )}
        {isActiveVaultsFarming && vaultFarmingAprDisplay && status !== 'sunset' && vaultFarmingAprDisplay !== '0%' && (
          <Text
            bg="primary_yellow_opacity.10"
            color="primary_yellow"
            borderRadius="4px"
            fontSize={{ base: '10px', lg: '12px' }}
            p={{
              base: '0px 6px',
              lg: '0px 4px'
            }}
            {...farmingTextStyle}
          >
            +{vaultFarmingAprDisplay}
          </Text>
        )}
      </VStack>
    </CetusTooltip>
  ) : (
    <Text textColor="text_caption" textAlign="right" fontWeight="500" fontSize={{ base: '12px', lg: '14px' }} {...apyTextStyle}>
      {displayApy}
    </Text>
  )
}

type VaultsAprTooltipContentLSTProps = {
  vaultsLstApyDisplay: string
  vaultsApyDisplay: string
  vaultsTotalApyDisplay: string
}
export const VaultsAprTooltipContentLST = ({ vaultsLstApyDisplay, vaultsApyDisplay, vaultsTotalApyDisplay }: VaultsAprTooltipContentLSTProps) => {
  return (
    <VStack gap="12px" w="100%" pt="8px">
      <VStack>
        <HTextLabelBox
          label="Total APY"
          labelStyle={{
            fontSize: '14px'
          }}
          valueStyle={{
            fontSize: '14px'
          }}
          wrapStyle={{
            gap: '16px'
          }}
          value={vaultsTotalApyDisplay}
        />
        <HStack h="1px" w="100%" backgroundColor="border" />
        <HTextLabelBox
          label="Fees and Rewards"
          labelStyle={{
            fontSize: '12px'
          }}
          valueStyle={{
            fontSize: '12px'
          }}
          wrapStyle={{
            gap: '16px'
          }}
          value={vaultsApyDisplay}
        />
        <HTextLabelBox
          label="LST"
          labelStyle={{
            fontSize: '12px'
          }}
          wrapStyle={{
            gap: '16px'
          }}
          value={vaultsLstApyDisplay}
          valueStyle={{
            fontSize: '12px'
          }}
        />
      </VStack>
    </VStack>
  )
}

type VaultsAprTooltipContentProps = {
  vaultsApyDisplay: string
  vaultsAprDisplay: string
  vaultFarmingAprDisplay: string
  isVaultsFarming: boolean
}
export const VaultsAprTooltipContent = ({
  vaultsApyDisplay,
  vaultsAprDisplay,
  vaultFarmingAprDisplay,
  isVaultsFarming
}: VaultsAprTooltipContentProps) => {
  const [accessHover, setAccessHover] = useState(false)
  return (
    <VStack
      w="250px"
      onClick={e => {
        e.stopPropagation()
      }}
    >
      <VStack bg="bg_fifth" borderRadius="8px" p="12px 16px" gap="10px">
        <HTextLabelBox label="Cetus LP APR" value={vaultsAprDisplay} labelStyle={{ fontSize: '12px' }} valueStyle={{ fontSize: '12px' }} />
        <Box m="8px 0" height="1px" w="100%" bg="border" />
        <HTextLabelBox label="Vault APY" value={vaultsApyDisplay} />
        <Text fontSize="12px" lineHeight="20px">
          (Compounding Cetus LP APR Multiple Times a Day)
        </Text>
      </VStack>
      {isVaultsFarming && vaultFarmingAprDisplay && vaultFarmingAprDisplay !== '0%' && (
        <VStack w="100%" bg="primary_yellow_opacity.10" borderRadius="8px" p="12px 16px" gap="10px" alignItems="flex-start">
          <Text color="text_caption" fontSize="12px">
            3rd party incentives available.
          </Text>
          <Text mt="4px" color="primary_yellow" fontSize="12px">
            LP Rewards APR +{vaultFarmingAprDisplay}
          </Text>
          <Text fontSize="12px">Incentives on Haedal</Text>
        </VStack>
      )}
    </VStack>
  )
}

export default VaultsAprBlock
