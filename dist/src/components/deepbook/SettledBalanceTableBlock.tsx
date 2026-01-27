import useDeepBookOrderActions from '@/hooks/deepbook/useDeepBookOrderActions'
import useGetDeepBookSettleList from '@/hooks/deepbook/useGetDeepBookSettleList'
import useDeepBookStore from '@/store/deepbook'
import { useAccountStore } from '@cetus/stores'
import { NoData, Table } from '@cetus/ui-kit'
import { formatNumber } from '@cetus/utils'
import { Button, HStack, Text } from '@chakra-ui/react'
import { useEffect } from 'react'
import CoinPairInfo from '../common/CoinPairInfo'

export default function SettledBalanceTableBlock() {
  const { getSettleList } = useGetDeepBookSettleList()
  const { deepBookPools, deepBookSettleList, deepBookSettleListLoading, currentDeepBookPool } = useDeepBookStore()
  const { currentAccount, onWalletModal } = useAccountStore()

  useEffect(() => {
    if (deepBookPools?.length > 0 && currentAccount?.address) {
      getSettleList()
    }
  }, [deepBookPools?.length, currentAccount?.address, currentDeepBookPool?.address])

  const { claimSettled } = useDeepBookOrderActions()

  return (
    <Table
      dataSource={deepBookSettleList}
      columns={getColumns(claimSettled)}
      loading={deepBookSettleListLoading}
      // isFlexStart
      fixedHeader
      headBg="none"
      noData={
        !currentAccount?.address ? (
          <NoData type="nowallet" noBorder bg="none" onboard={() => onWalletModal(true)} />
        ) : deepBookSettleList?.length == 0 ? (
          <NoData type="nodata" text="No settled balance" noBorder bg="none" />
        ) : undefined
      }
    />
  )
}

const getColumns = (claimSettled: (item: any) => void) => {
  return [
    {
      title: (
        <Text fontSize="12px" pt="8px" fontWeight="500">
          Market
        </Text>
      ),
      key: '#',
      thConfig: {
        w: '60%'
      },
      render: (item: any, index: number) => (
        <HStack h="32px">
          <CoinPairInfo
            poolInfo={{
              displayTokenA: item?.baseAssets,
              displayTokenB: item?.quoteAssets,
              poolAddress: item?.address
            }}
            imgStyle={{
              w: '24px',
              h: '24px'
            }}
            showFee={false}
            coinPairInfoWrapStyle={{
              p: '0px'
            }}
          />
        </HStack>
      )
    },

    {
      title: (
        <Text fontSize="12px" pt="8px" fontWeight="500" textAlign="right">
          Tokens
        </Text>
      ),
      key: 'tokens',
      thConfig: {
        w: '10%'
      },
      render: (item: any) => (
        <HStack w="100%" justify="flex-end">
          <Text color="text_caption">
            {formatNumber(item?.baseSettle)} {item?.baseAssets?.symbol}
          </Text>
          <Text color="text_caption" fontSize="12px">
            |
          </Text>
          <Text color="text_caption">
            {formatNumber(item?.quoteSettle)} {item?.quoteAssets?.symbol}
          </Text>
        </HStack>
      )
    },
    {
      title: (
        <Text fontSize="12px" pt="8px" fontWeight="500">
          Action
        </Text>
      ),
      key: 'action',
      thConfig: {
        w: '10%'
      },
      render: (item: any) => (
        <HStack w="100%" justify="flex-end">
          <Button
            w="80px"
            h="24px"
            borderRadius="8px"
            fontSize="12px"
            variant="ghost"
            borderColor="transparent !important"
            isDisabled={!item.canClaim}
            onClick={() => claimSettled(item)}
          >
            Claim
          </Button>
        </HStack>
      )
    }
  ]
}
