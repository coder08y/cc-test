import useMergeSwapStore from '@/store/merge-swap/useMergeSwapStore'
import { TradeInput } from '@cetus/design'
import { useGetTokenBalance } from '@cetus/hooks/src/useTokenBalance'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { Token } from '@cetus/types'
import { Icon } from '@cetus/ui-kit'
import { Button, Center, HStack, VStack } from '@chakra-ui/react'
import { useMemo } from 'react'

type MergeTradeInputFromProps = {
  openSelectTokenModal: (selectType: 'single' | 'multiple', fromIndex: number) => void
  handleRemoveClick: (token: Token) => void
}

export function MergeTradeInputFrom({ handleRemoveClick, openSelectTokenModal }: MergeTradeInputFromProps) {
  const { fromTokenList } = useMergeSwapStore()

  const showAddToken = useMemo(() => {
    return fromTokenList.length < 6
  }, [fromTokenList])

  return (
    <VStack w="100%" gap="8px">
      {/* 默认占位框 */}
      {fromTokenList.length === 0 && <MergeTradeInputFromPlaceholder openSelectTokenModal={openSelectTokenModal} />}

      {/* coin输入框 */}
      {fromTokenList.map((token, index) => (
        <MergeTradeInputTokenItem
          key={token.coin_type}
          token={token}
          showRemoveIcon={fromTokenList.length > 1}
          handleRemoveClick={handleRemoveClick}
          openSelectTokenModal={() => {
            openSelectTokenModal('single', index)
          }}
        />
      ))}

      {/* 添加token */}
      {showAddToken && (
        <Button
          bg="primary_opacity.10"
          color="primary"
          w="100%"
          h="44px"
          fontSize="14px"
          borderRadius="12px"
          _hover={{
            bg: 'primary_opacity.20'
          }}
          variant="solid"
          leftIcon={<Icon cursor={'pointer'} svgFill="primary" xlinkHref={'#icon-a-icon_add1'} fontSize="14px" />}
          onClick={() => {
            openSelectTokenModal('multiple', 0)
          }}
        >
          Add one more token
        </Button>
      )}
    </VStack>
  )
}

type MergeTradeInputTokenItemProps = {
  token: Token
  showRemoveIcon: boolean
  handleRemoveClick: (token: Token) => void
  openSelectTokenModal: () => void
}

function MergeTradeInputTokenItem({ token, handleRemoveClick, openSelectTokenModal, showRemoveIcon }: MergeTradeInputTokenItemProps) {
  const { setFromAmountObj, fromAmountObj } = useMergeSwapStore()
  const { getTokenAmountValue } = useTokenPrice()
  const { balanceInfo } = useGetTokenBalance(token)
  const tokenAmount = fromAmountObj[token.coin_type] || ''
  const totalAmountOutValue = getTokenAmountValue(token.coin_type, tokenAmount)

  return (
    <HStack w="100%" gap="8px" bg={showRemoveIcon ? 'primary_opacity.10' : 'transparent'} borderRadius="12px" pr={showRemoveIcon ? '8px' : '0px'}>
      <TradeInput
        value={tokenAmount || ''}
        balance={balanceInfo?.balanceFormat || '0'}
        token={token}
        inputAllowed={true}
        selectable={true}
        placeholder={'0'}
        openSelectTokenModal={openSelectTokenModal}
        onChange={function (value: string): void {
          setFromAmountObj(token.coin_type, value)
        }}
        amountValue={totalAmountOutValue}
        wrapStyle={{
          h: '98px',
          borderRadius: '12px'
        }}
      />
      {showRemoveIcon && (
        <Center
          w="18px"
          h="18px"
          borderRadius="50%"
          bg="primary_opacity.10"
          cursor="pointer"
          _hover={{ bg: 'primary', svg: { fill: 'black' } }}
          onClick={() => {
            handleRemoveClick(token)
            setFromAmountObj(token.coin_type, '')
          }}
        >
          <Icon svgFill="primary" xlinkHref={'#icon-tx_remove'} fontSize="10px" svgHover="black" />
        </Center>
      )}
    </HStack>
  )
}

function MergeTradeInputFromPlaceholder({
  openSelectTokenModal
}: {
  openSelectTokenModal: (selectType: 'single' | 'multiple', fromIndex: number) => void
}) {
  return (
    <TradeInput
      value={''}
      balance={''}
      inputAllowed={true}
      selectable={true}
      placeholder={'0'}
      half={false}
      max={false}
      openSelectTokenModal={() => {
        openSelectTokenModal('multiple', 0)
      }}
      onChange={() => {}}
      amountValue={''}
      wrapStyle={{
        h: '98px',
        borderRadius: '12px'
      }}
      // rightJustify='flex-end'
      symbolTipStyle={{
        fontSize: '16px'
      }}
    />
  )
}
