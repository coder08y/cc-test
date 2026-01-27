import { TooltipIcon } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import { Token } from '@cetus/types'
import { Icon, Table } from '@cetus/ui-kit'
import TextWrap from '@cetus/ui-kit/src/components/TextWarp'
import { formatCurrency, formatNumberWithDown } from '@cetus/utils'
import { fixCoinType } from '@cetusprotocol/common-sdk'
import { Box, HStack, Text, VStack } from '@chakra-ui/react'

const getColumns = (isShowMergeable: boolean, isShowCompound: boolean, allowList: any, toToken: Token | undefined) => {
  return [
    {
      title: (
        <Text textAlign="left" fontSize="12px">
          Token
        </Text>
      ),
      key: 'token',
      thConfig: {
        w: '33%'
      },
      showLabel: false,
      render: ({ token }: { token: any }) => {
        return (
          <HStack sx={{ p: { ml: '-4px' } }}>
            <SingleTokenInfo
              haveTooltip={true}
              token={token}
              haveName={false}
              symbolEllipsesDecimals={8}
              warningIcon={{ iconW: '10px', iconH: '10px' }}
              imgBoxStyle={{ w: '18px', h: '18px' }}
            />
          </HStack>
        )
      }
    },
    {
      title: (
        <Text textAlign="center" fontSize="12px">
          Unclaimed
        </Text>
      ),
      key: 'unclaimed',
      thConfig: {
        w: '34%'
      },
      showLabel: false,
      render: ({ amount, amountUSD }: { amount: string; amountUSD: string }) => {
        return (
          <HStack gap="4px" justify="center" flexDirection={{ base: 'column', lg: 'row' }}>
            {/* <Text color="text_caption">{formatNumberWithDown(amount)}</Text> */}
            <TextWrap
              color="text_caption"
              fontWeight="500"
              w={{ base: 'unset', lg: isShowMergeable || isShowCompound ? '80px' : '150px' }}
              boxStyle={{
                p: { textAlign: isShowMergeable || isShowCompound ? 'right' : 'center' }
              }}
            >
              {formatNumberWithDown(amount)}
            </TextWrap>
            {(isShowMergeable || isShowCompound) && <Text>({formatCurrency(amountUSD, 2)})</Text>}
          </HStack>
        )
      }
    },
    {
      title: (
        <HStack justify="flex-end" gap="2px" h="16px">
          <Text fontSize="12px"> {isShowCompound ? 'Compound' : isShowMergeable ? 'Mergeable' : 'Value'}</Text>
          {(isShowCompound || isShowMergeable) && (
            <Box userSelect="none" sx={{ svg: { width: '18px', height: '18px' } }}>
              <TooltipIcon
                tooltipCon={
                  isShowCompound
                    ? 'Whether the token can be compounded. Very small amounts may not qualify.'
                    : 'Whether the token can be merged during claim. Very small amounts may not qualify.'
                }
              />
            </Box>
          )}
        </HStack>
      ),
      key: 'value',
      thConfig: {
        w: '33%'
      },
      showLabel: false,
      render: (reward: any) => {
        const isYes =
          isShowMergeable && toToken
            ? (allowList?.length > 0 && fixCoinType(reward?.token?.coin_type) === fixCoinType(toToken?.coin_type)) ||
              (allowList?.length > 0 && allowList.some((item: any) => fixCoinType(item?.token?.coin_type) === fixCoinType(reward?.token?.coin_type)))
            : allowList?.length > 0 && allowList.some((item: any) => fixCoinType(item?.token?.coin_type) === fixCoinType(reward?.token?.coin_type))
        return (
          <HStack gap="4px" justify="flex-end" h="16px">
            {isShowMergeable || isShowCompound ? (
              isYes ? (
                <Icon xlinkHref="#icon-icon_check" svgHover="primary_green" svgFill="primary_green" />
              ) : (
                <Icon xlinkHref="#icon-icon_close" variant="error" />
              )
            ) : (
              <Text>{formatCurrency(reward?.amountUSD, 2)}</Text>
            )}
          </HStack>
        )
      }
    }
  ]
}

function ModalTable({
  list,
  allowList,
  isShowMergeable = false,
  isShowCompound = false,
  toToken = undefined
}: {
  list: any
  allowList: any
  toToken?: Token
  isShowMergeable?: boolean
  isShowCompound?: boolean
}) {
  return (
    <VStack w="100%" position="relative" mt="11px" gap="20px" sx={{ '>div': { table: { tbody: { td: { padding: '4px 8px 4px 0 !important' } } } } }}>
      <Table
        columns={getColumns(isShowMergeable, isShowCompound, allowList, toToken)}
        dataSource={list}
        trPadding="0"
        loading={false}
        rowStyle={{
          h: '24px',
          borderRadius: '0px',
          _hover: { bg: 'none !important' }
        }}
      />
    </VStack>
  )
}
export default ModalTable
