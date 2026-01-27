import useGlobalStore from '@/store/common/global'
import useCrossSwapStore from '@/store/cross-swap/useCrossSwap'
import useCrossSwapWalletStore from '@/store/cross-swap/useCrossSwapWallet'
import { useCurrentValue } from '@cetus/hooks'
import { useDebounceFunction } from '@cetus/hooks/src/useDebounce'
import { d, toDecimalsAmount } from '@cetusprotocol/common-sdk'
import { CrossSwapPlatform, CrossSwapQuote } from '@cetusprotocol/cross-swap-sdk'
import { useEffect, useState } from 'react'
import { v4 } from 'uuid'
import { useCrossFindRouter } from './useCrossFindRouter'
import { useGetChainAddress, useGetCrossSwapOptions } from './useCrossHelper'
import { useCrossPrice } from './useCrossPriceBatch'
import useCrossSwapUrlSync from './useCrossSwapUrlSync'
import { useTokenBalance } from './useCrossTokenBalance'
import { useCrossWallet } from './useCrossWallet'
import { useExecuteQuote } from './useExecuteQuote'

export default function useCrossSwap(platform: CrossSwapPlatform) {
  const { findRouter } = useCrossFindRouter(platform)
  // 选择链弹窗
  const [isOpenSelectChainModal, setIsOpenSelectChainModal] = useState(false)

  // 二次确认
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false)
  // 交易记录
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false)
  // 选择token弹窗
  const [isOpenSelectChainAndTokenModal, setIsOpenSelectChainAndTokenModal] = useState(false)
  // 是否选择源链
  const [isSelectFromToken, setIsSelectFromToken] = useState(false)

  const { crossSwapSlippage } = useGlobalStore()
  const { setCrossWalletModalData, setSettingToAddressModalData } = useCrossSwapWalletStore()

  const { executeQuote } = useExecuteQuote(platform)

  const { findRouterLoading, setFindRouterLoading, crossSwapOptions, setCrossSwapOptions, fromCoinAmount, setFromCoinAmount, setRouters, setQuote } =
    useCrossSwapStore()

  const { fromChain, toChain, fromToken, toToken } = useGetCrossSwapOptions(platform)

  const { handleConnectWallet: handleConnectFromWallet, handleDisconnectWallet: handleDisconnectFromWallet } = useCrossWallet(platform, fromChain)
  const { handleConnectWallet: handleConnectToWallet, handleDisconnectWallet: handleDisconnectToWallet } = useCrossWallet(platform, toChain)

  const fromChainAddress = useGetChainAddress(fromChain, true)
  const toChainAddress = useGetChainAddress(toChain, false)

  const { tokenBalance: fromTokenBalance, refetch: refetchFromTokenBalance } = useTokenBalance(
    platform,
    fromChain,
    fromToken,
    fromChainAddress.address
  )
  const { tokenBalance: toTokenBalance, refetch: refetchToTokenBalance } = useTokenBalance(platform, toChain, toToken, toChainAddress.address)

  const [uuid, setUuid] = useState<string>('')
  const uuidRef = useCurrentValue(uuid)
  const fromCoinAmountRef = useCurrentValue(fromCoinAmount)

  const { price: fromTokenPrice, refetch: refetchFromTokenPrice } = useCrossPrice(platform, fromToken, true, false)
  const { price: toTokenPrice, refetch: refetchToTokenPrice } = useCrossPrice(platform, toToken, true, false)

  useEffect(() => {
    if (fromToken && fromTokenPrice) {
      fromToken.price_usd = fromTokenPrice?.toString()
    }
  }, [fromToken, fromTokenPrice])

  useEffect(() => {
    if (toToken && toTokenPrice) {
      toToken.price_usd = toTokenPrice?.toString()
    }
  }, [toToken, toTokenPrice])

  // 使用新的 URL 同步 hook
  useCrossSwapUrlSync(platform)

  useEffect(() => {
    resetData()
    return () => {
      resetData()
    }
  }, [platform])

  /**
   * 滑点监听
   */
  useEffect(() => {
    refetchQuote()
  }, [crossSwapSlippage])

  /**
   * 获取报价
   * @param amount
   * @param uuid
   */
  const estimateQuote = async (amount: string, uuid: string) => {
    if (+amount && fromChain && fromToken && toChain && toToken) {
      if (!fromCoinAmountRef.current) {
        resetData()
        return
      }
      setFindRouterLoading(true)
      try {
        const result = await findRouter(
          toDecimalsAmount(amount, fromToken.decimals),
          fromChain,
          fromToken,
          toChain,
          toToken,
          fromChainAddress.address,
          toChainAddress.address
        )
        console.log('🚀🚀🚀 ~ index.tsx:109 ~ result:', {
          result,
          uuidRef: uuidRef.current,
          uuid
        })

        if (uuidRef.current === uuid) {
          setRouters(result)
          // 如果输入数量和当前输入数量一致，且没错误 则设置报价
          if (!result.error && amount === fromCoinAmountRef.current) {
            const quote = result.quotes[0]
            if (platform === 'mayan') {
              quote.from_token.price_usd = fromTokenPrice?.toString()
              quote.to_token.price_usd = toTokenPrice?.toString()
              quote.amount_in_usd = d(quote.amount_in_formatted)
                .mul(fromTokenPrice || 0)
                .toString()
            }
            setQuote(quote)
          } else {
            setQuote(undefined)
          }
        }
      } catch (error) {
        console.log('estimateQuote error', error)
      } finally {
        setFindRouterLoading(false)
      }
    } else {
      resetData(false)
    }
  }

  const debouncedEstimateQuote = useDebounceFunction(estimateQuote, 500)

  /**
   * 输入数量监听
   * @param amount
   */
  const handleInputAmountChange = (amount: string) => {
    console.log('🚀🚀🚀 ~ index.tsx:140 ~ handleInputAmountChange ~ amount:', amount)
    if (+amount) {
      setFromCoinAmount(amount)
      const uuid = v4()
      setUuid(uuid)
      debouncedEstimateQuote(amount, uuid)
    } else {
      resetData()
    }
  }

  const resetData = (resetFromAmount = true) => {
    if (resetFromAmount) {
      setFromCoinAmount('')
    }
    setQuote(undefined)
    setRouters(undefined)
    setFindRouterLoading(false)
  }

  /**
   * 处理钱包操作
   */
  const handleWalletAction = (isFrom: boolean, action: 'connect' | 'disconnect' | 'change') => {
    if (isFrom) {
      if (action === 'disconnect') {
        handleDisconnectFromWallet()
      } else {
        handleConnectFromWallet()
      }
    } else {
      if (action === 'disconnect') {
        handleDisconnectToWallet()
      } else {
        handleConnectToWallet()
      }
    }
  }

  /**
   * 执行交易
   * @param quote
   */
  const handleExecuteQuote = async (quote: CrossSwapQuote) => {
    if (quote && fromChainAddress.address && toChainAddress.address) {
      await executeQuote(
        {
          swap_wallet_address: fromChainAddress.address,
          destination_address: toChainAddress.address,
          quote
        },
        (status: 'success' | 'failed' | 'pending') => {
          console.log('🚀🚀🚀 ~ index.tsx:195 ~ handleExecuteQuote ~ status:', status)

          if (status === 'pending') {
            resetData()
            setTimeout(() => {
              refetchFromTokenBalance()
            }, 2000)
          }
          if (status === 'success') {
            setTimeout(() => {
              refetchFromTokenBalance()
              refetchToTokenBalance()
            }, 2000)
          }

          // 失败后重新获取报价
          if (status === 'failed') {
            refetchQuote()
          }
        }
      )
    }
  }

  /**
   * 重新获取报价
   */
  const refetchQuote = () => {
    handleInputAmountChange(fromCoinAmountRef.current)

    if (fromChainAddress) {
      refetchFromTokenBalance()
    }
    if (toChainAddress) {
      refetchToTokenBalance()
    }

    refetchFromTokenPrice()
    refetchToTokenPrice()
  }

  /**
   *  交换链和token方向
   */
  const handleChangeChainAndToken = () => {
    const tempFromChain = fromChain
    const tempToChain = toChain
    const tempFromToken = fromToken
    const tempToToken = toToken
    if (tempToChain) {
      setCrossSwapOptions(platform, {
        fromChain: tempToChain,
        fromToken: tempToToken
      })
    }
    if (tempFromChain) {
      setCrossSwapOptions(platform, {
        toChain: tempFromChain,
        toToken: tempFromToken
      })
    }
    resetData()
  }

  /**
   * 处理钱包连接点击
   * @param isFrom 是否是源链
   */
  const handleConnectWalletClick = (isFrom: boolean) => {
    console.log('🚀🚀🚀 ~ index.tsx:275 ~ handleConnectWalletClick ~ isFrom:', isFrom)
    if (isFrom) {
      if (fromChain) {
        if (fromChainAddress.address) {
          // 如果源链有地址，则打开钱包弹窗
          setCrossWalletModalData({
            address: fromChainAddress.address,
            isManualAddress: fromChainAddress.isManualAddress,
            chain: fromChain,
            isFrom: true
          })
        } else {
          // 如果源链没有地址，则连接钱包
          handleWalletAction(true, 'connect')
        }
      } else {
        // 如果源链没有链，则打开选择链和token弹窗
        setIsSelectFromToken(true)
        setIsOpenSelectChainAndTokenModal(true)
      }
    } else {
      if (toChain) {
        if (toChainAddress.address) {
          // 如果目标链有地址，则打开钱包弹窗
          setCrossWalletModalData({
            address: toChainAddress.address,
            isManualAddress: toChainAddress.isManualAddress,
            chain: toChain,
            isFrom: false
          })
        } else {
          // 如果目标链没有地址，则打开设置地址弹窗
          setSettingToAddressModalData({
            chain: toChain
          })
        }
      } else {
        // 如果目标链没有链，则打开选择链和token弹窗
        setIsSelectFromToken(false)
        setIsOpenSelectChainAndTokenModal(true)
      }
    }
  }

  return {
    isSelectFromToken,
    setIsSelectFromToken,
    fromChainAddress,
    toChainAddress,
    isOpenSelectChainModal,
    setIsOpenSelectChainModal,
    fromTokenBalance,
    toTokenBalance,
    handleInputAmountChange,
    findRouterLoading,
    isOpenConfirmModal,
    setIsOpenConfirmModal,
    isOpenHistoryModal,
    setIsOpenHistoryModal,
    isOpenSelectChainAndTokenModal,
    setIsOpenSelectChainAndTokenModal,
    handleWalletAction,
    handleExecuteQuote,
    resetData,
    handleChangeChainAndToken,
    refetchQuote,
    handleConnectWalletClick
  }
}
