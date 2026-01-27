import useBurn from '@/hooks/burn/useBurn'
import useTransaction from '@/hooks/common/useTransaction'
import usePositionList from '@/hooks/position/usePositionList'
import usePositionStore from '@/store/position'
import { PosBaseInfo } from '@/types'
import { Block } from '@cetus/design'
import useTokenPrice from '@cetus/hooks/src/useTokenPrice'
import { useAccountStore } from '@cetus/stores'
import { CommonTypeInfo } from '@cetus/types'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { formatCurrency } from '@cetus/utils'
import { Button, HStack, Input, Text, VStack } from '@chakra-ui/react'
import { useState } from 'react'
import ModalItem from './ModalItem'

export default function LpBurnNextContent({ onClose, currentLockItem }: { onClose: () => void; currentLockItem: PosBaseInfo }) {
  const { currentAccount } = useAccountStore()
  const { signAndExecuteTransaction } = useTransaction()
  const { getBurnTxPayload } = useBurn()
  const { getPositionBaseList, getPosRelatedData } = usePositionList()
  const { posLiquidityData } = usePositionStore()

  const [toBurnLoading, setToBurnLoading] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [isInputWritingTrue, setIsInputWritingTrue] = useState(false)
  const inputChange = (e: any) => {
    const value = e.target.value
    const filteredValue = value.replace(/[^a-zA-Z0-9\s]+/g, '')
    setInputValue(filteredValue)

    console.log('🚀 ~ inputChange ~ e:', e.target.value, e.target.value.toLowerCase())
    if (e.target.value.toLowerCase() == 'lock my liquidity forever') {
      setIsInputWritingTrue(true)
    } else {
      setIsInputWritingTrue(false)
    }
  }

  const { getTokenAmountValue } = useTokenPrice()
  const currentPosLiquidityData = posLiquidityData[currentLockItem?.posId]
  const amountValueA = getTokenAmountValue(currentLockItem?.displayTokenA?.coin_type, currentPosLiquidityData?.displayCoinAmountA, '--')
  const amountValueB = getTokenAmountValue(currentLockItem?.displayTokenB?.coin_type, currentPosLiquidityData?.displayCoinAmountB, '--')

  const toBurn = async () => {
    console.log('🚀 ~ currentLockItem:', currentLockItem)
    setToBurnLoading(true)
    try {
      const tx = getBurnTxPayload(currentLockItem)
      console.log('🚀 ~ toBurn ~ tx:', tx)
      const res = await signAndExecuteTransaction(tx, {
        getShowInfo: status => {
          const info: CommonTypeInfo = {
            modalDescriptionText: `${currentLockItem?.displayTokenA?.symbol} - ${currentLockItem?.displayTokenB?.symbol} Position Locked`,
            toastTitleText: 'LP Locked'
          }
          console.log('🚀 ~ toBurn ~ status:', status)
          return info
        }
      })
      console.log('🚀 ~ toBurn ~ res:', res)

      if (res) {
        // 重新拿列表数据
        await getPositionBaseList(currentAccount?.address)
        onClose()
      }
      setToBurnLoading(false)
    } catch (error) {
      setToBurnLoading(false)
      console.log('🚀 ~ claimYieldAction ~ error:', error)
    }
  }
  return (
    <VStack w="100%" gap="12px">
      <VStack w="100%" align="flex-start" gap="20px">
        <Text w="100%" color="text_caption" fontSize="16px" textAlign="center" fontWeight="500">
          Lock Liquidity Permanently?
        </Text>
        <Text color="text_caption" textAlign="left" lineHeight="20px">
          Are you sure you want to permanently lock/burn liquidity? You will be unable to access or withdraw underlying position assets, only trading
          fees and mining rewards earned will remain claimable.
        </Text>
      </VStack>
      <VStack w="100%">
        <ModalItem posInfo={currentLockItem} pageFrom="lpBurnNext" />
        <Block w="100%" borderRadius="0 0 8px 8px" p="16px 12px 12px" mt="-20px" borderTop="none" bg="bg_primary">
          <Block p="16px 12px" borderRadius="12px">
            <VStack gap="16px">
              <HStack w="100%" justify="space-between">
                <HStack>
                  <SingleCoinImage
                    imageUrl={currentLockItem?.displayTokenA?.logo_url}
                    w="20px"
                    h="20px"
                    coinType={currentLockItem?.displayTokenA?.coin_type}
                    showTagHeight="10px"
                    showTagWidth="10px"
                  />
                  <Text color="text_caption">
                    {currentPosLiquidityData?.displayCoinAmountA} {currentLockItem?.displayTokenA?.symbol}
                  </Text>
                </HStack>
                <Text color="text_caption">{formatCurrency(amountValueA, 2)}</Text>
              </HStack>
              <HStack w="100%" justify="space-between">
                <HStack>
                  <SingleCoinImage
                    imageUrl={currentLockItem?.displayTokenB?.logo_url}
                    w="20px"
                    h="20px"
                    coinType={currentLockItem?.displayTokenB?.coin_type}
                    showTagHeight="10px"
                    showTagWidth="10px"
                  />
                  <Text color="text_caption">
                    {currentPosLiquidityData?.displayCoinAmountB} {currentLockItem?.displayTokenB?.symbol}
                  </Text>
                </HStack>
                <Text color="text_caption">{formatCurrency(amountValueB, 2)}</Text>
              </HStack>
            </VStack>
          </Block>
        </Block>
      </VStack>
      <HStack gap="12px" bg="primary_yellow_opacity.10" p="16px 12px" borderRadius="12px">
        <Icon xlinkHref="#icon-icon_priceupdated" variant="warning" />
        <Text color="primary_yellow" lineHeight="20px" textAlign="left" fontSize="12px">
          By confirming below, l agree to permanently lock liquidity. l understand access to the underlying assets will be lost forever.
        </Text>
      </HStack>
      <Block borderRadius="12px" p="16px" bg="bg_four">
        <Text color="primary_gray" textAlign="center">
          To confirm, type the following:
        </Text>
        <Text color="text_caption" textAlign="center" fontWeight="900" mt="12px" userSelect="text">
          Lock my liquidity forever
        </Text>
        <Block borderRadius="16px" w="100%" h="56px" p="0" lineHeight="52px" mt="12px">
          <Input
            placeholder="Type confirmation text here"
            fontWeight="500"
            textAlign="center"
            fontSize="14px"
            p="0px"
            value={inputValue}
            onChange={inputChange}
          />
        </Block>
      </Block>
      <VStack w="100%" gap="8px" pb="16px">
        <Button
          isLoading={toBurnLoading}
          w="100%"
          mt="8px"
          h="52px"
          fontWeight="500"
          isDisabled={!isInputWritingTrue || toBurnLoading}
          onClick={toBurn}
        >
          Confirm
        </Button>
        <Button fontWeight="500" variant="outline" w="100%" p="20px" onClick={onClose} cursor="pointer" h="52px">
          Cancel
        </Button>
      </VStack>
    </VStack>
  )
}
