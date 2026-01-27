import { HStack, Text, VStack } from '@chakra-ui/react'
import { VaultsComposition } from './VaultsComposition'
import { VaultsPositionRange } from './VaultsPositionRange'

export default function VaultsPoolDetailInfo({
  currentVaultPool,
  apiVaultInfo,
  depositRatio,
  hardCapUSD,
  vaultTvl,
  vaultsCoinAValue,
  vaultsCoinBValue
}: {
  currentVaultPool?: any
  apiVaultInfo?: any
  depositRatio?: string
  hardCapUSD?: string
  vaultTvl?: string
  vaultsCoinAValue?: string
  vaultsCoinBValue?: string
}) {
  return (
    <VStack w="100%" bg="bg_secondary" borderRadius="16px" p="20px 16px 28px" gap="0">
      {apiVaultInfo?.status !== 'sunset' && (
        <HStack w="100%">
          <Text textAlign="left" fontSize="16px" color="text_caption">
            Details
          </Text>
        </HStack>
      )}
      {apiVaultInfo?.status !== 'sunset' && <VaultsPositionRange currentVaultPool={currentVaultPool} apiVaultInfo={apiVaultInfo} />}
      <VaultsComposition
        currentVaultPool={currentVaultPool}
        apiVaultInfo={apiVaultInfo}
        depositRatio={depositRatio}
        hardCapUSD={hardCapUSD}
        vaultTvl={vaultTvl}
        vaultsCoinAValue={vaultsCoinAValue}
        vaultsCoinBValue={vaultsCoinBValue}
      />
    </VStack>
  )
}
