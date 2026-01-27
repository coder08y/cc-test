import useSelectChain from '@/hooks/cross-swap/useSelectChain'
import { SearchInput } from '@cetus/design/src/components/common/tokenSelectModal/SearchInput'
import { Chain, CrossSwapPlatform } from '@cetusprotocol/cross-swap-sdk'
import { Box, Flex, HStack, Skeleton, SkeletonCircle, VStack } from '@chakra-ui/react'
import { Suspense } from 'react'
import ChainList from './ChainList'

type SelectChainRowProps = {
  crossPlatform: CrossSwapPlatform
  currentChain: Chain
  onChangeChain: (chain: Chain) => void
}

export function SelectChainRow(props: SelectChainRowProps) {
  const { crossPlatform, currentChain, onChangeChain } = props
  const { inputValue, handleInputChange, chainList, isLoading } = useSelectChain(crossPlatform)

  return (
    <VStack w="100%">
      <Box p="0 16px" w="100%">
        <SearchInput placeholder="Search by chain name" inputValue={inputValue} changeInputValue={(value: string) => handleInputChange(value)} />
      </Box>
      <Suspense
        fallback={
          <Flex marginTop="16px" flexDirection="column">
            {[...Array(5)].map((_, index) => (
              <HStack gap="0" key={index} height="64px" padding="0">
                <SkeletonCircle size="9" />
                <VStack gap="4px" ml="4px" align="flex-start">
                  <Skeleton height="4" width="100px" />
                </VStack>
              </HStack>
            ))}
          </Flex>
        }
      >
        <ChainList chainList={chainList} currentChain={currentChain} onChangeChain={onChangeChain} isLoading={isLoading} />
      </Suspense>
    </VStack>
  )
}
