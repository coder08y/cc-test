import { FeeSelect } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { HStack, MenuButton, Text, VStack } from '@chakra-ui/react'
import { maxBy } from 'lodash-es'
import { useEffect, useRef } from 'react'
import { CLMMSelectFeeProps, SelectPoolProps } from './type'

export const CLMMSelectFee = ({
  feeTier,
  feeTierList,
  onFeeTierChange,
  fromSource,
  children
}: CLMMSelectFeeProps & Pick<SelectPoolProps, 'fromSource'> & { children?: React.ReactNode }) => {
  const feeBtnRef = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (fromSource === 'addLiquidity' && feeTierList?.length > 0) {
      const _pool = maxBy(feeTierList, item => Number(item?.tvl || '0'))

      if (_pool) {
        onFeeTierChange(_pool)
      }
    }
  }, [fromSource, feeTierList])
  return (
    <VStack w="100%" align="flex-start" gap="16px">
      <VStack w="100%" align="flex-start" gap="8px">
        <Text fontSize="16px" fontWeight="500" color="text_caption">
          Fee tier
        </Text>
        <Text fontSize="12px" fontWeight="500">{`The ${(typeof feeTier === 'object' && feeTier?.feeDisplay) || '%'} you will earn in fees.`}</Text>
      </VStack>
      <FeeSelect<'clmm'>
        poolType="clmm"
        selectType="fee"
        value={feeTier}
        onChange={fee => onFeeTierChange(fee)}
        options={feeTierList}
        placement="bottom"
        wrapStyle={{ w: feeBtnRef?.current?.clientWidth || '463px' }}
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
            ref={feeBtnRef}
          >
            <HStack w="100%" justifyContent="space-between" p="9px 16px">
              {feeTier ? (
                <Text color="text_caption" fontSize="16px" fontWeight="500">
                  {`${typeof feeTier === 'object' && feeTier?.feeDisplay}`}
                </Text>
              ) : (
                <Text color="text_caption" fontSize="14px" fontWeight="500">
                  Select fee tier
                </Text>
              )}
              <HStack>
                <Text fontSize="12px">{typeof feeTier === 'object' && feeTier?.title}</Text>
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
