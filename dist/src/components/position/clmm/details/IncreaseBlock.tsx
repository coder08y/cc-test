import ZapDeposite from '@/components/zap/ZapDeposite'
import ZapSubmiteInfo from '@/components/zap/ZapSubmiteInfo'
import useIsSupportZap from '@/hooks/common/useIsSupportZap'
import useCurrentApiPool from '@/hooks/position/useCurrentApiPool'
import usePosAddPage from '@/hooks/position/usePosAddPage'
import useGlobalStore from '@/store/common/global'
import usePositionStore from '@/store/position'
import usePositionDetailStore from '@/store/position/detail'
import { TradeInputGroup } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import { formatCurrency } from '@cetus/utils'
import { d } from '@cetusprotocol/common-sdk'
import { Box, Button, HStack, Text, VStack } from '@chakra-ui/react'
import { useEffect } from 'react'
import { AutoClaimCheckBox } from '../../common/AutoClaimCheckBox'
import FarmsBlock from './FarmsBlock'
import TradeTitle from './TradeTitle'

function IncreaseBlock() {
  const { currentPosBaseInfo, posPoolsRelatedData, posApiPoolData } = usePositionStore()
  const { currentAccount, onWalletModal } = useAccountStore()
  const { liquiditySlippage } = useGlobalStore()
  const { isFixedDisplayTokenA, curPosContractPoolInfo, useZapIn, currentPosPoolInfo, isAutoClaim, setIsAutoClaim } = usePositionDetailStore()
  const {
    tokenAmountA,
    tokenAmountB,
    displayTokenA,
    displayTokenB,
    tokenABalanceInfo,
    tokenBBalanceInfo,
    tokenAmountValueA,
    tokenAmountValueB,
    handleAmountChange,
    preAddLoading,
    btnStatusText,
    toAdd,
    isAddLoading,
    showDisplayTokenALock,
    showDisplayTokenBLock,
    resetInputAmount,
    currentPoolSqrtPrice
  } = usePosAddPage()

  useEffect(() => {
    return () => {
      resetInputAmount()
    }
  }, [])

  const { getTokenAmountValue } = useTokenPrice()
  const amountValueA = getTokenAmountValue(displayTokenA?.coin_type, tokenAmountA, '--')
  const amountValueB = getTokenAmountValue(displayTokenB?.coin_type, tokenAmountB, '--')
  const totalAmount = amountValueA == '--' || amountValueB == '--' ? '--' : d(tokenAmountValueA).plus(tokenAmountValueB).toString()

  const currentPosPoolsRelatedData = posPoolsRelatedData[currentPosBaseInfo?.posId]

  const { currentApiPoolInfo } = useCurrentApiPool(currentPosBaseInfo, posApiPoolData)

  const { isSupportZap } = useIsSupportZap(displayTokenA?.coin_type, displayTokenB?.coin_type)

  return (
    <VStack w="100%" gap="16px">
      <VStack w="100%" gap="16px" p={{ base: '0 8px 16px', lg: '0 16px 16px' }} bg="card_bg" borderRadius="0px 0px 16px 16px">
        <Box w="100%" position="relative">
          {currentPosBaseInfo?.posType !== 'burn' && (
            <TradeTitle
              haveZap={isSupportZap && !showDisplayTokenALock && !showDisplayTokenBLock}
              action="Deposit"
              resetInputAmount={resetInputAmount}
            />
          )}
          {useZapIn && !showDisplayTokenALock && !showDisplayTokenBLock ? (
            <ZapDeposite
              action="Deposit"
              apiPoolInfo={currentApiPoolInfo}
              currentSqrtPrice={currentPoolSqrtPrice}
              lowerTick={currentPosBaseInfo?.lowerTick}
              upperTick={currentPosBaseInfo?.upperTick}
            />
          ) : (
            <>
              <TradeInputGroup
                from={{
                  wrapStyle: {
                    h: '108px',
                    borderRadius: '12px'
                  },
                  balance: tokenABalanceInfo?.balanceFormat || '',
                  value: tokenAmountA,
                  amountValue: tokenAmountValueA,
                  loading: !isFixedDisplayTokenA && preAddLoading,
                  onChange: value => {
                    handleAmountChange(value, true)
                  },
                  placeholder: '0.0',
                  token: displayTokenA,
                  lock: {
                    isLock: currentPosBaseInfo && curPosContractPoolInfo && showDisplayTokenALock,
                    style: {
                      borderRadius: '12px'
                    }
                  },
                  rightJustify: 'space-around'
                }}
                to={{
                  wrapStyle: {
                    h: '108px',
                    borderRadius: '12px'
                  },
                  balance: tokenBBalanceInfo?.balanceFormat || '',
                  value: tokenAmountB,
                  amountValue: tokenAmountValueB,
                  loading: isFixedDisplayTokenA && preAddLoading,
                  onChange: value => {
                    handleAmountChange(value, false)
                  },
                  placeholder: '0.0',
                  token: displayTokenB,
                  lock: {
                    isLock: currentPosBaseInfo && curPosContractPoolInfo && showDisplayTokenBLock,
                    style: {
                      borderRadius: '12px'
                    }
                  },
                  rightJustify: 'space-around'
                }}
                iconHover={false}
                iconParams={
                  showDisplayTokenALock || showDisplayTokenBLock
                    ? undefined
                    : {
                        xlinkHref: '#icon-icon_add',
                        svgFill: 'text_caption'
                      }
                }
                lock={{
                  isLock: !currentPosBaseInfo || !curPosContractPoolInfo || (currentPosBaseInfo && currentPosBaseInfo?.posType == 'burn'),
                  text: currentPosBaseInfo && currentPosBaseInfo?.posType == 'burn' ? 'Your liquidity has been permanently locked' : undefined,
                  style: {
                    h: '224px',
                    borderRadius: '12px'
                  }
                }}
              />
            </>
          )}
        </Box>

        <AutoClaimCheckBox
          checked={isAutoClaim}
          onChange={() => {
            setIsAutoClaim(!isAutoClaim)
          }}
        />

        {useZapIn ? (
          <ZapSubmiteInfo
            action="Deposit"
            onClick={toAdd}
            isPositionStyle={true}
            hideDepositRatio={true}
            otherLoading={isAddLoading}
            isReverse={currentPosBaseInfo?.isReverse}
          />
        ) : (
          <>
            <Button
              onClick={() => {
                if (currentAccount) {
                  toAdd()
                } else {
                  onWalletModal(true)
                }
              }}
              isLoading={isAddLoading}
              disabled={btnStatusText.disabled || isAddLoading || currentPosBaseInfo?.isFrozen}
              w="100%"
              h="56px"
              fontSize="20px"
              fontWeight="500"
            >
              {btnStatusText.text}
            </Button>
            {totalAmount && currentPosBaseInfo?.posType !== 'burn' && (
              <HStack w="100%" justify="space-between">
                <Text>Deposit Amount</Text>
                <Text color="text_caption">{formatCurrency(totalAmount, 2)}</Text>
              </HStack>
            )}
          </>
        )}
      </VStack>
      {currentPosBaseInfo?.posType !== 'burn' && <FarmsBlock haveFarming={currentPosPoolInfo?.haveFarming} />}
      {/* {currentPosPoolsRelatedData && currentPosPoolsRelatedData?.minPrice !== '0' && currentPosPoolsRelatedData?.maxPrice !== '∞' && (
        <RangeAlerts subscriptionSource="PositionDetail" />
      )} */}
    </VStack>
  )
}
export default IncreaseBlock
