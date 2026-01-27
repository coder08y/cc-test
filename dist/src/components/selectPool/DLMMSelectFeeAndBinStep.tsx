import { FeeSelect } from '@cetus/design'
import useBinStepConfigStore from '@cetus/stores/src/binStepConfig'
import { Icon } from '@cetus/ui-kit'
import { HStack, MenuButton, Text, VStack } from '@chakra-ui/react'
import { maxBy } from 'lodash-es'
import { useEffect, useRef } from 'react'
import { DLMMSelectFeeAndBinStepProps, SelectPoolProps } from './type'

export const DLMMSelectFeeAndBinStep = ({
  fromSource,
  baseFee,
  onBaseFeeChange,
  binStep,
  binStepList,
  onBinStepChange,
  getBinStepListLoading,
  children
}: DLMMSelectFeeAndBinStepProps & Pick<SelectPoolProps, 'fromSource'> & { children?: React.ReactNode }) => {
  const ref = useRef<HTMLButtonElement>(null)
  const { binStepConfig } = useBinStepConfigStore()
  useEffect(() => {
    if (fromSource === 'addLiquidity' && binStepList?.length > 0) {
      const _pool = maxBy(binStepList, item => Number(item?.tvl || '0'))

      if (_pool) {
        onBinStepChange(_pool)
      }
    }
  }, [fromSource, binStepList])

  return (
    <VStack w="100%" align="flex-start" gap="16px">
      <VStack w="100%" align="flex-start" gap="8px">
        <Text fontSize="16px" fontWeight="500" color="text_caption">
          Select base fee
        </Text>
        <Text fontSize="12px" fontWeight="500">
          The minimum fee rate LP will earn in each swap
        </Text>
      </VStack>
      <FeeSelect<'dlmm'>
        poolType="dlmm"
        selectType="fee"
        value={baseFee}
        onChange={value => onBaseFeeChange(value)}
        placement="bottom"
        options={binStepConfig}
        wrapStyle={{ w: ref?.current?.clientWidth || '463px' }}
        // wrapStyle={{ w: '580px' }}
      >
        {({ isOpen, onClick }) => (
          <MenuButton
            w="100%"
            borderRadius="12px"
            h="48px"
            border="1px solid"
            borderColor="border"
            cursor="pointer"
            onClick={onClick}
            bg="bg_secondary"
            ref={ref}
          >
            <HStack w="100%" justifyContent="space-between" p="9px 16px">
              {baseFee ? (
                <HStack>
                  <Text color="text_caption" fontWeight="500">
                    {baseFee?.feeDisplay || '--'}
                  </Text>
                </HStack>
              ) : (
                <Text color="text_caption" fontWeight="500">
                  Select base fee
                </Text>
              )}

              <HStack>
                <Icon
                  xlinkHref="#icon-icon_arrow"
                  fontSize="12px"
                  transition="transform 0.5s"
                  transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                />
              </HStack>
            </HStack>
          </MenuButton>
        )}
      </FeeSelect>
      <VStack w="100%" align="flex-start" gap="8px">
        <Text fontSize="16px" fontWeight="500" color="text_caption">
          Select bin step
        </Text>
        <Text fontSize="12px" fontWeight="500">
          The price step between bins
        </Text>
      </VStack>
      <FeeSelect<'dlmm'>
        poolType="dlmm"
        selectType="binStep"
        value={binStep}
        options={binStepList}
        loading={getBinStepListLoading}
        onChange={value => onBinStepChange(value)}
        placement="bottom"
        wrapStyle={{ w: ref?.current?.clientWidth || '463px' }}
        // wrapStyle={{ w: '580px' }}
      >
        {({ isOpen, onClick }) => (
          <MenuButton
            w="100%"
            borderRadius="12px"
            h="48px"
            border="1px solid"
            borderColor="border"
            cursor={!baseFee ? 'not-allowed' : 'pointer'}
            onClick={onClick}
            bg="bg_secondary"
            ref={ref}
            disabled={!baseFee}
          >
            <HStack w="100%" justifyContent="space-between" p="9px 16px">
              {binStep ? (
                <HStack>
                  <Text color="text_caption" fontWeight="500">
                    {binStep?.binStep || '--'} bps
                  </Text>
                </HStack>
              ) : (
                <Text color="text_caption" fontWeight="500">
                  Select bin step
                </Text>
              )}

              <HStack>
                <Text fontSize="12px">{typeof binStep === 'object' && binStep?.title}</Text>
                <Icon
                  xlinkHref="#icon-icon_arrow"
                  fontSize="12px"
                  transition="transform 0.5s"
                  transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
                />
              </HStack>
            </HStack>
          </MenuButton>
        )}
      </FeeSelect>
      {children}
    </VStack>
  )
}
