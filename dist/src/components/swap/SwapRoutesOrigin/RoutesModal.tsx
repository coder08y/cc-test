import { SwapRouterFormat } from '@/types'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinType, Token } from '@cetus/types'
import { HStack, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, Text } from '@chakra-ui/react'
import { useDeepCompareEffect } from 'ahooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import H5Routes from './H5Routes'
import OverView from './OverView'
import PCRoutes from './PCRoutes'

interface RoutesModalProps {
  isOpen: boolean
  onClose: () => void
  data?: SwapRouterFormat
  fromCoin?: Token
  toCoin?: Token
  fromAmount: string
  toAmount: string
}

const RoutesModal = ({ isOpen, onClose, data, fromCoin, toCoin, fromAmount, toAmount }: RoutesModalProps) => {
  const { isApp } = useWindowWidth()
  const { getTokenListInfo } = useGetToken()
  const [tokenMap, setTokenMap] = useState<Map<string, any>>(new Map())

  const getTokenMap = async (coinTypeList: string[]) => {
    const res = await getTokenListInfo(coinTypeList as CoinType[])
    if (res && res?.size > 0) {
      setTokenMap(res)
    }
  }

  useDeepCompareEffect(() => {
    if (data?.routers && data?.routers?.length > 0) {
      const coinTypeList: string[] = []
      data?.routers?.forEach(router => {
        router.paths.forEach(path => {
          if (!coinTypeList.includes(path.from_type)) {
            coinTypeList.push(path.from_type)
          }
          if (!coinTypeList.includes(path.to_type)) {
            coinTypeList.push(path.to_type)
          }
        })
      })
      getTokenMap(coinTypeList)
    }
  }, [data?.routers])

  const routes = useMemo(() => {
    if (!data?.routers || data?.routers?.length === 0 || tokenMap?.size === 0) {
      return []
    }
    return data?.routers?.map(router => ({
      ...router,
      paths: router.paths.map(path => ({
        ...path,
        fromToken: tokenMap?.get(path.from_type),
        toToken: tokenMap?.get(path.to_type)
      }))
    }))
  }, [data?.routers, tokenMap])

  const props = {
    fromToken: fromCoin,
    toToken: toCoin,
    fromAmount,
    toAmount,
    routes
  }

  const [loading, setLoading] = useState(true)
  const timer = useRef<any>(null)
  useEffect(() => {
    if (timer.current) {
      clearTimeout(timer.current)
      timer.current = null
    }

    timer.current = setTimeout(() => {
      setLoading(false)
    }, 200)

    return () => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
    }
  }, [])

  return (
    <Modal autoFocus={false} returnFocusOnClose={false} isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent maxW="1200px" w={isApp ? 'calc(100vw - 32px)' : '880px'}>
        <ModalHeader mr="-10px">
          <HStack w="100%" gap="24px" justify="space-between" align="center">
            <Text fontSize="16px" fontWeight="500" color="text_caption">
              Route
            </Text>
            <HStack gap="0" align="center">
              <OverView data={data} />
              <ModalCloseButton mt="0" position="static" />
            </HStack>
          </HStack>
        </ModalHeader>

        <ModalBody p={{ base: '8px 16px', lg: '16px' }}>
          {isApp ? <H5Routes {...props} loading={loading} /> : <PCRoutes {...props} loading={loading} />}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default RoutesModal
