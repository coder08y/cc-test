import { AddressCopyLink, Block, CetusTooltip } from '@cetus/design'
import { baseFeeStepConfig } from '@cetus/design/src/components/common/feeSelect/config'
import useExplorer from '@cetus/hooks/src/useExplorer'
import { useGetToken } from '@cetus/hooks/src/useToken'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinType } from '@cetus/types'
import { CoinPairImage, SingleCoinImage } from '@cetus/ui-kit'
import { cancelBubble, textEllipses } from '@cetus/utils'
import { extractStructTagFromType } from '@cetusprotocol/common-sdk'
import { Box, Center, CenterProps, ColorProps, Divider, HStack, PopoverProps, Stack, Text, TypographyProps, VStack } from '@chakra-ui/react'
import FarmingIcon from '../common/FarmingIcon'
import MiningIcon from '../common/MiningIcon'
import WarningIcon from '../common/WarningIcon'
import { PoolType } from '../pools/createPool/SelectPoolType'

interface DLMMCoinPairInfoProps extends DLMMPoolShowInfoProps {
  placement?: PopoverProps['placement']
  isParent?: boolean
  showPool?: boolean
  haveFarming?: boolean
  haveMining?: boolean
}

const DLMMCoinPairInfo = ({
  poolInfo,
  haveName = false,
  placement = 'top-start',
  symbolEllipsesDecimals = 0,
  nameEllipsesDecimals = 0,
  symbolFontWeight = '500',
  showPool,
  ...rest
}: DLMMCoinPairInfoProps) => {
  const { isApp } = useWindowWidth()

  const isTokenPair = 'list' in poolInfo
  const _showPool = (isTokenPair ? false : true) || showPool
  return (
    <HStack
      p={{ base: '0', lg: '12px 0' }}
      onClick={e => {
        isApp ? cancelBubble(e) : ''
      }}
    >
      {/* <CetusTooltip placement={placement} tooltip={<TooltipInfo poolInfo={poolInfo} showPool={(isTokenPair ? false : true) || showPool} />}> */}
      <Center>
        <DLMMPoolShowInfo
          symbolFontWeight={symbolFontWeight}
          poolInfo={poolInfo}
          symbolEllipsesDecimals={symbolEllipsesDecimals}
          haveName={haveName}
          nameEllipsesDecimals={nameEllipsesDecimals}
          showPool={_showPool}
          {...rest}
        />
      </Center>
      {/* </CetusTooltip> */}
    </HStack>
  )
}
export default DLMMCoinPairInfo

interface DLMMPoolShowInfoProps {
  poolInfo: any
  haveName?: boolean
  fontSize?: TypographyProps['fontSize']
  symbolFontSize?: TypographyProps['fontSize']
  symbolFontWeight?: TypographyProps['fontWeight']
  symbolEllipsesDecimals?: number
  nameEllipsesDecimals?: number
  isShowPowered?: boolean
  poolType?: PoolType
  hasFee?: boolean
  imgBoxStyle?: CenterProps
  isParent?: boolean
  haveFarming?: boolean
  haveMining?: boolean
  isOnlyOneData?: boolean
  showPool?: boolean
}

export const DLMMPoolShowInfo = ({
  poolInfo,
  haveName = false,
  fontSize = '11px',
  symbolFontSize = '14px',
  symbolFontWeight = 500,
  // name和symbol超出多少位数后展示...
  symbolEllipsesDecimals = 0,
  nameEllipsesDecimals = 0,
  isShowPowered = false,
  poolType = 'clmm',
  hasFee = true,
  imgBoxStyle,
  isParent = true,
  haveFarming,
  haveMining,
  isOnlyOneData,
  showPool
}: DLMMPoolShowInfoProps) => {
  const { isApp } = useWindowWidth()
  const { tokenInfo: tokenAInfo } = useGetToken<CoinType>(poolInfo?.displayTokenA?.coinType)
  const { tokenInfo: tokenBInfo } = useGetToken<CoinType>(poolInfo?.displayTokenB?.coinType)
  const displayFee = poolInfo?.feeDisplay ? poolInfo?.feeDisplay : '--'

  return (
    <HStack cursor="pointer" gap={isApp ? '4px' : '8px'}>
      <CetusTooltip gutter={6} placement="top-start" tooltip={<TooltipInfo poolInfo={poolInfo} showPool={showPool} />}>
        <CoinPairImage
          coinACoinType={poolInfo?.displayTokenA?.coinType}
          coinBCoinType={poolInfo?.displayTokenB?.coinType}
          coinAIconUrl={poolInfo?.displayTokenA?.logoURL || tokenAInfo?.logo_url}
          coinBIconUrl={poolInfo?.displayTokenB?.logoURL || tokenBInfo?.logo_url}
          imgBoxStyle={imgBoxStyle}
          {...(isApp && {
            showTagWidth: '12px',
            showTagHeight: '12px'
          })}
        />
      </CetusTooltip>

      {isParent ? (
        <Stack flexDir={isApp ? 'row' : 'column'} gap="4px">
          <HStack gap="4px">
            <CetusTooltip gutter={hasFee ? 6 : 14} placement="top-start" tooltip={<TooltipInfo poolInfo={poolInfo} showPool={showPool} />}>
              <Text color="text_caption" fontSize={symbolFontSize} fontWeight={symbolFontWeight}>
                {textEllipses(poolInfo?.displayTokenA?.symbol || tokenAInfo?.symbol, symbolEllipsesDecimals)}&nbsp;-&nbsp;
                {textEllipses(poolInfo?.displayTokenB?.symbol || tokenBInfo?.symbol, symbolEllipsesDecimals)}
              </Text>
            </CetusTooltip>

            {!isApp && (
              <WarningIcon
                coinTypeA={poolInfo?.coinTypeA || poolInfo?.displayTokenA?.coinType}
                coinTypeB={poolInfo?.coinTypeB || poolInfo?.displayTokenB?.coinType}
                {...(isApp
                  ? {
                      w: '12px',
                      h: '12px'
                    }
                  : {})}
              />
            )}
          </HStack>
          {hasFee && (
            <CetusTooltip gutter={24} placement="top-start" tooltip={<TooltipInfo poolInfo={poolInfo} showPool={showPool} />}>
              <DLMMFeeAndBinStep displayFee={displayFee} fontSize={fontSize} symbolFontWeight={symbolFontWeight} poolInfo={poolInfo} />
            </CetusTooltip>
          )}
          {isApp && (
            <HStack>
              {haveFarming && <FarmingIcon />}
              {haveMining && <MiningIcon />}
              <WarningIcon
                coinTypeA={poolInfo?.coinTypeA || poolInfo?.displayTokenA?.coinType}
                coinTypeB={poolInfo?.coinTypeB || poolInfo?.displayTokenB?.coinType}
                {...(isApp
                  ? {
                      w: '12px',
                      h: '12px'
                    }
                  : {})}
              />
            </HStack>
          )}
        </Stack>
      ) : (
        <Stack
          flexDir={poolInfo?.showTokenName ? (isApp ? 'row' : 'column') : 'row'}
          gap={poolInfo?.showTokenName ? '4px' : '8px'}
          align={poolInfo?.showTokenName ? (isApp ? 'center' : 'start') : 'center'}
        >
          {poolInfo?.showTokenName && (
            <HStack>
              <CetusTooltip gutter={6} placement="top-start" tooltip={<TooltipInfo poolInfo={poolInfo} showPool={showPool} />}>
                <HStack gap="0" h="14px">
                  <Text color="text_caption" fontSize={symbolFontSize} fontWeight={symbolFontWeight}>
                    {textEllipses(poolInfo?.displayTokenA?.symbol || tokenAInfo?.symbol, symbolEllipsesDecimals)}
                  </Text>
                  <Text color="text_caption" fontSize={symbolFontSize}>
                    &nbsp;-
                  </Text>
                  <Text color="text_caption" fontSize={symbolFontSize} fontWeight={symbolFontWeight}>
                    &nbsp;{textEllipses(poolInfo?.displayTokenB?.symbol || tokenBInfo?.symbol, symbolEllipsesDecimals)}
                  </Text>
                </HStack>
              </CetusTooltip>

              {isOnlyOneData && (
                <WarningIcon
                  coinTypeA={poolInfo?.coinTypeA || poolInfo?.displayTokenA?.coinType}
                  coinTypeB={poolInfo?.coinTypeB || poolInfo?.displayTokenB?.coinType}
                />
              )}
            </HStack>
          )}
          <CetusTooltip gutter={24} placement="top-start" tooltip={<TooltipInfo poolInfo={poolInfo} showPool={showPool} />}>
            <DLMMFeeAndBinStep displayFee={displayFee} fontSize={fontSize} symbolFontWeight={symbolFontWeight} poolInfo={poolInfo} />
          </CetusTooltip>

          {!poolInfo?.showTokenName && (
            <>
              {isApp && haveFarming && <FarmingIcon />}
              {isApp && haveMining && <MiningIcon />}
            </>
          )}
        </Stack>
      )}
    </HStack>
  )
}

const DLMMFeeAndBinStep = ({
  fontSize,
  symbolFontWeight,
  poolInfo,
  displayFee,
  color = 'primary'
}: Pick<DLMMPoolShowInfoProps, 'fontSize' | 'symbolFontWeight' | 'poolInfo'> & { displayFee: string; color?: ColorProps['color'] }) => {
  const { isApp } = useWindowWidth()
  return (
    <Block
      w="fit-content"
      p={{ base: '3px 6px', lg: '2px 8px' }}
      borderRadius={{ base: '10px', lg: '12px' }}
      borderColor={{ base: 'transparent', lg: 'card_bg' }}
      bg={{ base: 'primary_opacity.10', lg: 'card_bg' }}
      className="dlmm_fee_and_bin_step"
    >
      <HStack h="12px" gap={{ base: '2px', lg: '8px' }}>
        <Text fontSize={isApp ? '10px !important' : fontSize} color={color} lineHeight="1" fontWeight={symbolFontWeight}>
          {displayFee}
        </Text>
        <Divider orientation="vertical" h="6px" bg="primary" opacity={0.3} />
        <Text fontSize={isApp ? '10px !important' : fontSize} color={color} fontWeight={symbolFontWeight}>
          {poolInfo?.binStep || baseFeeStepConfig?.[poolInfo?.fee]} bps
        </Text>
      </HStack>
    </Block>
  )
}

const TooltipInfo = ({ poolInfo, showPool = true }: { poolInfo: any; showPool?: boolean }) => {
  const { getExplorerUrl } = useExplorer()
  const { isApp } = useWindowWidth()
  const coinTypeA = poolInfo?.displayTokenA?.coinType
  const coinTypeB = poolInfo?.displayTokenB?.coinType
  const { tokenInfo: tokenAInfo } = useGetToken(coinTypeA)
  const { tokenInfo: tokenBInfo } = useGetToken(coinTypeB)

  return (
    <VStack align="flex-start">
      {showPool && (
        <>
          <HStack w="100%" justify="space-between">
            <HStack>
              {/* <Image src={pool_img} w="20px" h="20px" /> */}
              <Text fontSize="12px" color="text_caption">
                Pool
              </Text>
            </HStack>
            <AddressCopyLink
              address={poolInfo?.poolId}
              color="text_caption"
              showLink={isApp ? true : false}
              onClickLink={() => {
                window.open(getExplorerUrl(poolInfo?.poolId, 'poolAddress'), '_blank')
              }}
            />
          </HStack>
          <Box h="1px" w=" 100%" bg="border" />
        </>
      )}

      <HStack w="100%" justify="space-between">
        <HStack>
          <SingleCoinImage
            imageUrl={poolInfo?.displayTokenA?.logoURL || tokenAInfo?.logo_url}
            w="20px"
            h="20px"
            coinType={coinTypeA}
            showTagWidth="10px"
            showTagHeight="10px"
          />

          <Text fontSize="12px" color="text_caption">
            {textEllipses(poolInfo?.displayTokenA?.symbol || tokenAInfo?.symbol, 8)}
          </Text>
        </HStack>
        <AddressCopyLink
          address={extractStructTagFromType(coinTypeA).full_address}
          showLink={isApp ? true : false}
          onClickLink={() => {
            window.open(getExplorerUrl(coinTypeA, 'coin'))
          }}
        />
      </HStack>
      <HStack w="100%" justify="space-between">
        <HStack>
          <SingleCoinImage
            imageUrl={poolInfo?.displayTokenB?.logoURL || tokenBInfo?.logo_url}
            w="20px"
            h="20px"
            coinType={coinTypeB}
            showTagWidth="10px"
            showTagHeight="10px"
          />
          <Text fontSize="12px" color="text_caption">
            {textEllipses(poolInfo?.displayTokenB?.symbol || tokenBInfo?.symbol, 8)}
          </Text>
        </HStack>
        <AddressCopyLink
          address={extractStructTagFromType(coinTypeB).full_address}
          showLink={isApp ? true : false}
          onClickLink={() => {
            window.open(getExplorerUrl(coinTypeB, 'coin'))
          }}
        />
      </HStack>
    </VStack>
  )
}
