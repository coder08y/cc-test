import { AddressCopyLink, CetusTooltip } from '@cetus/design'
import { Icon, SingleCoinImage } from '@cetus/ui-kit'
import { d, textEllipses } from '@cetus/utils'
import { HStack, Text } from '@chakra-ui/react'

export default function TransTypeValue({ transInfo, getExplorerUrl }: { transInfo: any; getExplorerUrl: any }) {
  const labelMap: Record<string, string> = {
    swap: 'Swap',
    add: 'Add',
    remove: 'Remove'
  }
  return (
    <HStack gap="4px">
      <Text color="text_caption">{labelMap[transInfo?.txType as any]}</Text>
      {d(transInfo?.tokenAmountA).gt(0) && (
        <CetusTooltip
          placement="top"
          tooltip={
            <HStack>
              <SingleCoinImage
                imageUrl={transInfo?.tokenA?.icon_url}
                w="20px"
                h="20px"
                minH="20px"
                minW="20px"
                showTagWidth="12px"
                showTagHeight="12px"
                coinType={transInfo?.tokenA?.coin_type}
              />
              <Text color="text_caption"> {textEllipses(transInfo?.tokenA?.symbol || '--', 12)}</Text>
              <AddressCopyLink
                address={transInfo?.tokenA?.coin_type}
                onClickLink={() => window.open(getExplorerUrl(transInfo?.tokenA?.coin_type, 'coin'))}
              />
            </HStack>
          }
        >
          <HStack gap="4px">
            <SingleCoinImage
              imageUrl={transInfo?.tokenA?.icon_url}
              w="16px"
              h="16px"
              coinType={transInfo?.tokenA?.coin_type}
              showTagWidth="8px"
              showTagHeight="8px"
            />

            {d(transInfo?.tokenAmountA).gt(0) && <Text color="text_caption">{transInfo?.tokenA?.symbol || '--'}</Text>}

            <Icon xlinkHref="#icon-icon_link3" fontSize="16px" />
          </HStack>
        </CetusTooltip>
      )}
      {d(transInfo?.tokenAmountA).gt(0) && d(transInfo?.tokenAmountB).gt(0) && (
        <Text color="text_caption">{transInfo?.txType == 'swap' ? 'for' : 'and'}</Text>
      )}
      {d(transInfo?.tokenAmountB).gt(0) && (
        <CetusTooltip
          placement="top"
          tooltip={
            <HStack>
              <SingleCoinImage
                imageUrl={transInfo?.tokenB?.icon_url}
                w="20px"
                h="20px"
                minH="20px"
                minW="20px"
                showTagWidth="12px"
                showTagHeight="12px"
                coinType={transInfo?.tokenB?.coin_type}
              />
              <Text color="text_caption"> {textEllipses(transInfo?.tokenB?.symbol || '--', 12)}</Text>
              <AddressCopyLink
                address={transInfo?.tokenB?.coin_type}
                onClickLink={() => window.open(getExplorerUrl(transInfo?.tokenB?.coin_type, 'coin'))}
              />
            </HStack>
          }
        >
          <HStack gap="4px">
            <SingleCoinImage
              imageUrl={transInfo?.tokenB?.icon_url}
              w="16px"
              h="16px"
              coinType={transInfo?.tokenB?.coinType}
              showTagWidth="8px"
              showTagHeight="8px"
            />

            {d(transInfo?.tokenAmountB).gt(0) && <Text color="text_caption">{transInfo?.tokenB?.symbol || '--'}</Text>}
            <Icon xlinkHref="#icon-icon_link3" fontSize="16px" />
          </HStack>
        </CetusTooltip>
      )}
    </HStack>
  )
}
