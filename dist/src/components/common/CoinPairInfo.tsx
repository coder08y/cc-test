import useGlobalStore from '@/store/common/global'
import { AddressCopyLink, Block, CetusTooltip } from '@cetus/design'
import { baseFeeStepConfig } from '@cetus/design/src/components/common/feeSelect/config'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { CoinPairImage, Icon, SingleCoinImage } from '@cetus/ui-kit'
import { cancelBubble, textEllipses } from '@cetus/utils'
import { extractStructTagFromType } from '@cetusprotocol/common-sdk'
import { Box, Center, HStack, PopoverProps, Stack, StackProps, Text, VStack } from '@chakra-ui/react'
import { ReactNode, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PoolType } from '../pools/createPool/SelectPoolType'
import PoweredByHaedal from '../vaults-v2/common/PoweredByHaedal'
import VaultsFarmIcon from '../vaults-v2/common/VaultsFarmIcon'
import { VaultsSunsetTips } from '../vaults-v2/common/VaultsSunsetTips'
import PoolTag from './PoolTag'
import VersionBlock from './VersionBlock'

interface CoinPairInfoProps extends Omit<PoolShowInfoProps, 'setIsOpen'> {
  placement?: PopoverProps['placement']
  haveFarming?: boolean
  versionBlockPosition?: string
  type?: 'column' | 'row'
  padding?: string
  isShowVaultsFarmIcon?: boolean
  coinPairInfoWrapStyle?: StackProps
  needPortal?: boolean
  showPoolTypeTag?: boolean
  moreDetails?: boolean
  status?: string
  currentStatus?: string
  dividerTooltip?: boolean
  tooltipComponent?: React.ReactNode
  isShowInfoIcon?: boolean
  symbolFontSize?: string
}

const CoinPairInfo = ({
  status,
  poolInfo,
  haveName = false,
  placement = 'top-start',
  symbolEllipsesDecimals = 0,
  nameEllipsesDecimals = 0,
  symbolFontWeight = '500',
  haveFarming = false,
  versionBlockPosition = 'bottom',
  clickFun,
  padding = '12px 0',
  isShowVaultsFarmIcon = false,
  coinPairInfoWrapStyle = {},
  needPortal = true,
  showFee = true,
  imgStyle,
  showPoolTypeTag = false,
  moreDetails = false,
  currentStatus,
  dividerTooltip = true,
  showSymbol = true,
  tooltipComponent,
  isShowInfoIcon = false,
  symbolFontSize = '14px',
  ...rest
}: CoinPairInfoProps) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <HStack
      p={padding}
      onClick={e => {
        cancelBubble(e)
        clickFun && clickFun()
      }}
      // position="relative"
      // bg="red"
      alignItems={isShowVaultsFarmIcon ? 'flex-start' : 'center'}
      {...coinPairInfoWrapStyle}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      // zIndex="1000"
    >
      <CetusTooltip
        showTooltip={isOpen}
        placement={placement}
        tooltip={tooltipComponent || <TooltipInfo poolInfo={poolInfo} moreDetails={moreDetails} />}
        needPortal={needPortal}
      >
        <Center>
          <PoolShowInfo
            status={status}
            showSymbol={showSymbol}
            symbolFontSize={symbolFontSize}
            currentStatus={currentStatus}
            showPoolTypeTag={showPoolTypeTag}
            poolType={poolInfo?.poolType}
            symbolFontWeight={symbolFontWeight}
            versionBlockPosition={versionBlockPosition}
            poolInfo={poolInfo}
            symbolEllipsesDecimals={symbolEllipsesDecimals}
            haveName={haveName}
            nameEllipsesDecimals={nameEllipsesDecimals}
            haveFarming={haveFarming}
            isShowVaultsFarmIcon={isShowVaultsFarmIcon}
            isShowInfoIcon={isShowInfoIcon}
            {...rest}
            showFee={showFee}
            setIsOpen={dividerTooltip ? setIsOpen : () => {}}
            imgStyle={imgStyle}
          />
        </Center>
      </CetusTooltip>
    </HStack>
  )
}
export default CoinPairInfo

interface PoolShowInfoProps {
  type?: 'column' | 'row'
  poolInfo: any
  haveName?: boolean
  fontSize?: string
  symbolFontSize?: string
  symbolFontWeight?: string
  symbolEllipsesDecimals?: number
  nameEllipsesDecimals?: number
  isShowPowered?: boolean
  poolType?: PoolType
  versionBlockPosition?: string
  setIsOpen?: (isOpen: boolean) => void
  haveFarming?: boolean
  clickFun?: () => void
  isShowVaultsFarmIcon?: boolean
  zIndex?: string
  showFee?: boolean
  imgStyle?: any
  showPoolTypeTag?: boolean
  status?: string
  currentStatus?: string
  showDisabledTag?: boolean
  showSymbol?: boolean
  showBottomPoolAddress?: boolean
  isShowInfoIcon?: boolean
  moreDetails?: boolean
  boxStyle?: any
  children?: ReactNode
}

export const PoolShowInfo = ({
  type,
  poolInfo,
  haveName = false,
  fontSize = '12px',
  symbolFontSize = '14px',
  symbolFontWeight = '500',
  // name和symbol超出多少位数后展示...
  symbolEllipsesDecimals = 0,
  nameEllipsesDecimals = 0,
  isShowPowered = false,
  poolType = 'clmm',
  versionBlockPosition = 'bottom',
  setIsOpen = () => {},
  haveFarming = false,
  isShowVaultsFarmIcon = false,
  showFee = true,
  imgStyle,
  zIndex,
  showPoolTypeTag = false,
  showDisabledTag = false,
  status,
  currentStatus,
  showSymbol = true,
  showBottomPoolAddress = false,
  isShowInfoIcon = false,
  moreDetails = false,
  boxStyle,
  children
}: PoolShowInfoProps) => {
  const navigate = useNavigate()
  const { isApp } = useWindowWidth()
  const { getExplorerUrl } = useExplorer()
  const poolCount = poolInfo?.poolCount || 1
  return (
    <HStack cursor="pointer" zIndex={zIndex} gap={{ base: '4px', lg: '8px' }} {...boxStyle}>
      <CoinPairImage
        coinACoinType={poolInfo?.displayTokenA?.coin_type || poolInfo?.displayTokenA?.address}
        coinBCoinType={poolInfo?.displayTokenB?.coin_type || poolInfo?.displayTokenB?.address}
        coinAIconUrl={poolInfo?.displayTokenA?.logo_url}
        coinBIconUrl={poolInfo?.displayTokenB?.logo_url}
        zIndex={zIndex}
        {...imgStyle}
        status={status}
      />
      <VStack align="flex-start" gap="4px" height={isShowPowered ? '20px' : 'unset'} justify="center">
        <Stack flexDir={type} gap={type === 'column' ? '4px' : { base: '4px', lg: '8px' }}>
          {showSymbol && (
            <HStack>
              <Text color="text_caption" fontSize={symbolFontSize} fontWeight={symbolFontWeight} whiteSpace="nowrap">
                {textEllipses(poolInfo?.displayTokenA?.symbol, symbolEllipsesDecimals)}&nbsp;-&nbsp;
                {textEllipses(poolInfo?.displayTokenB?.symbol, symbolEllipsesDecimals)}
              </Text>
              {children}
              {(status === 'sunset' || status === 'sunsetSoon') && currentStatus !== 'sunset' && !isApp && (
                <VaultsSunsetTips status={status} onMouseEnter={() => setIsOpen(false)} />
              )}
              {isShowVaultsFarmIcon && status !== 'sunset' && (
                <VaultsFarmIcon onMouseEnter={() => setIsOpen(false)} onMouseLeave={() => setIsOpen(true)} />
              )}
            </HStack>
          )}

          {type && poolCount === 1 && (
            <HStack gap={type === 'column' ? '4px' : '6px'}>
              {!showPoolTypeTag && poolInfo?.poolType === 'clmm' && (
                <HStack gap="4px">
                  <Block
                    w="unset"
                    p={{ base: '3px 6px', lg: '2px 8px' }}
                    borderRadius={{ base: '10px', lg: '12px' }}
                    bg={{ base: 'primary_opacity.10', lg: 'card_bg' }}
                    borderColor={{ base: 'transparent', lg: 'card_bg' }}
                    className="clmm_fee"
                  >
                    <Text fontSize="10px !important" color={{ base: 'primary', lg: 'text_highlight' }} lineHeight="1" h="10px">
                      {poolInfo?.feeDisplay || '--'}
                    </Text>
                  </Block>
                  {isShowInfoIcon && <InfoTooltip poolInfo={poolInfo} moreDetails={moreDetails} />}
                </HStack>
              )}

              {showDisabledTag && (
                <Block w="unset" p="3px 6px" bg="bg_secondary" borderRadius="10px" border="1px solid" borderColor="border">
                  <Text fontSize="10px" color="primary_gray" lineHeight="10px !important">
                    {poolInfo?.feeDisplay || '--'}
                  </Text>
                </Block>
              )}

              {versionBlockPosition == 'right' && poolInfo?.isFrozen ? <VersionBlock /> : null}
              {showPoolTypeTag && (!isApp || isShowPowered || (!isShowPowered && isApp)) && (
                <HStack gap="4px">
                  <PoolTag
                    poolType={poolType}
                    type={type}
                    showFee={showFee}
                    displayFee={poolInfo?.feeDisplay || '--'}
                    binStep={poolInfo?.binStep || baseFeeStepConfig[poolInfo?.fee]}
                    // onMouseEnter={() => setIsOpen(true)}
                    // onMouseLeave={() => setIsOpen(false)}
                  />
                  {isShowInfoIcon && <InfoTooltip poolInfo={poolInfo} moreDetails={moreDetails} />}
                </HStack>
              )}
              {haveFarming && (
                <HStack
                  bg="primary_yellow_opacity.10"
                  h="16px"
                  w={{ base: '56px', lg: '56px' }}
                  justify="center"
                  align="center"
                  borderRadius="8px"
                  onClick={(e: any) => {
                    cancelBubble(e)
                    navigate('/farms')
                  }}
                  border="1px solid"
                  borderColor="transparent"
                  cursor="pointer"
                  sx={{
                    _hover: {
                      border: '1px solid',
                      borderColor: 'primary_yellow'
                    }
                  }}
                  gap="0"
                  onMouseEnter={e => {
                    setIsOpen(false)
                  }}
                  onMouseLeave={e => {
                    setIsOpen(true)
                  }}
                >
                  <Text fontSize="12px" color="primary_yellow">
                    Farm
                  </Text>
                  <Icon
                    xlinkHref="#icon-icon_ascending"
                    transform="rotate(90deg)"
                    w="16px"
                    h="16px"
                    mr="-4px"
                    svgFill="primary_yellow"
                    svgHover="primary_yellow"
                  />
                </HStack>
              )}
            </HStack>
          )}

          {versionBlockPosition == 'bottom' && poolInfo?.isFrozen ? <VersionBlock /> : null}
        </Stack>

        {showBottomPoolAddress && (
          <AddressCopyLink
            address={poolInfo?.poolAddress}
            color="#909CA4"
            showLink={isApp ? true : false}
            onClickLink={() => {
              window.open(getExplorerUrl(poolInfo?.poolAddress, 'poolAddress'), '_blank')
            }}
          />
        )}

        {(status === 'sunset' || status === 'sunsetSoon') && currentStatus !== 'sunset' && isApp && (
          <VaultsSunsetTips status={status} onMouseEnter={() => setIsOpen(false)} />
        )}
        {poolInfo?.category && isShowPowered && <PoweredByHaedal category={poolInfo?.category} hideProvider={true} />}

        {haveName && (
          <Text fontSize="12px" color="primary_gray" whiteSpace="nowrap">
            {textEllipses(poolInfo?.displayTokenA?.name, nameEllipsesDecimals)}&nbsp;-&nbsp;
            {textEllipses(poolInfo?.displayTokenB?.name, nameEllipsesDecimals)}
          </Text>
        )}
      </VStack>
    </HStack>
  )
}

export const TooltipInfo = ({ poolInfo, moreDetails = false }: { poolInfo: any; moreDetails?: boolean }) => {
  const { getExplorerUrl } = useExplorer()
  const navigate = useNavigate()
  const { isApp } = useWindowWidth()
  const { setBackUrl } = useGlobalStore()
  return (
    <VStack align="flex-start">
      <HStack w="100%" justify="space-between">
        <HStack>
          {/* <Image src={pool_img} w="20px" h="20px" /> */}
          <Text fontSize="12px" color="text_caption">
            Pool
          </Text>
        </HStack>
        <AddressCopyLink
          address={poolInfo?.poolAddress}
          color="text_caption"
          showLink={isApp ? true : false}
          onClickLink={() => {
            window.open(getExplorerUrl(poolInfo?.poolAddress, 'poolAddress'), '_blank')
          }}
        />
      </HStack>
      <Box h="1px" w=" 100%" bg="border" />
      <HStack w="100%" justify="space-between">
        <HStack>
          <SingleCoinImage
            imageUrl={poolInfo?.displayTokenA?.logo_url}
            w="20px"
            h="20px"
            coinType={poolInfo?.displayTokenA?.coin_type || poolInfo?.displayTokenA?.address}
            showTagWidth="10px"
            showTagHeight="10px"
          />

          <Text fontSize="12px" color="text_caption">
            {textEllipses(poolInfo?.displayTokenA.symbol, 8)}
          </Text>
        </HStack>
        <AddressCopyLink
          address={extractStructTagFromType(poolInfo?.displayTokenA?.coin_type || poolInfo?.displayTokenA?.address).full_address}
          showLink={isApp ? true : false}
          onClickLink={() => {
            window.open(getExplorerUrl(poolInfo?.displayTokenA?.coin_type || poolInfo?.displayTokenA?.address, 'coin'))
          }}
        />
      </HStack>
      <HStack w="100%" justify="space-between">
        <HStack>
          <SingleCoinImage
            imageUrl={poolInfo?.displayTokenB?.logo_url}
            w="20px"
            h="20px"
            coinType={poolInfo?.displayTokenB?.coin_type || poolInfo?.displayTokenB?.address}
            showTagWidth="10px"
            showTagHeight="10px"
          />
          <Text fontSize="12px" color="text_caption">
            {textEllipses(poolInfo?.displayTokenB.symbol, 8)}
          </Text>
        </HStack>
        <AddressCopyLink
          address={extractStructTagFromType(poolInfo?.displayTokenB?.coin_type || poolInfo?.displayTokenB?.address).full_address}
          showLink={isApp ? true : false}
          onClickLink={() => {
            window.open(getExplorerUrl(poolInfo?.displayTokenB?.coin_type || poolInfo?.displayTokenB?.address, 'coin'))
          }}
        />
      </HStack>
      {moreDetails && (
        <>
          <Box h="1px" w=" 100%" bg="border" />
          <HStack
            justify="center"
            w="100%"
            cursor="pointer"
            gap="0px"
            _hover={{ p: { color: 'text_caption' }, svg: { fill: 'text_caption' } }}
            onClick={e => {
              cancelBubble(e)
              if (poolInfo?.binStep !== undefined) {
                setBackUrl(`${window.location.href.replace(window.location.origin, '')}`)
                navigate(`/dlmm?tab=analytics&poolId=${poolInfo?.poolAddress}`)
              } else {
                setBackUrl(`${window.location.href.replace(window.location.origin, '')}`)
                navigate(`/clmm?tab=analytics&poolAddress=${poolInfo?.poolAddress}`)
              }
            }}
          >
            <Text fontSize="12px">Pool Details</Text>
            <Icon xlinkHref="#icon-icon_descending_nor" transform="rotate(270deg)" fontSize="20px" />
          </HStack>
        </>
      )}
    </VStack>
  )
}

const InfoTooltip = ({ poolInfo, moreDetails = false }: { poolInfo: any; moreDetails: boolean }) => {
  return (
    <CetusTooltip placement="top" maxW="400px" tooltip={<TooltipInfo poolInfo={poolInfo} moreDetails={moreDetails} />}>
      <Center border="1px solid" borderColor="border" borderRadius="50%">
        <Icon xlinkHref="#icon-icon_info" width="16px" height="16px" />
      </Center>
    </CetusTooltip>
  )
}
