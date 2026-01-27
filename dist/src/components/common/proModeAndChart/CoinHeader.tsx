import useProData from '@/hooks/pro/useProData'
import useProStore from '@/store/pro'
import { CetusTooltip, useTokenSelect } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useTokenSelectStore from '@cetus/stores/src/useTokenSelectStore'
import { Icon, RefreshButton } from '@cetus/ui-kit'
import { textEllipses, toLongCoinType } from '@cetus/utils'
import { Center, HStack, Text, VStack } from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import TokenDropSelectBlock from './tokenDropSelect'

const CoinHeader = ({
  handleToggleDirect,
  h5ShowIcon = true,
  whiteTokenList,
  onCoinSelect
}: {
  handleToggleDirect: () => void
  h5ShowIcon?: boolean
  onCoinSelect: (item: any) => void
  whiteTokenList?: any
}) => {
  const { showTokenInfo, anotherTokenInfo, notChangeToken } = useProStore()
  const { userCollectObj, userCollectList } = useTokenSelectStore()
  const { delUserCollectToken, addUserCollectToken } = useTokenSelect()
  const { isApp } = useWindowWidth()
  const { getCoinRelatedData } = useProData()
  const navigate = useNavigate()
  return (
    <VStack w="100%" align="flex-start" gap="0">
      {!h5ShowIcon && isApp && (
        <Text fontSize="14px" fontWeight="500" color="text_caption" h="20px" lineHeight="20px" mb="20px">
          Coin Details
        </Text>
      )}
      {/* {(h5ShowIcon || !isApp) && (
        <BackButton
          w="unset"
          text="Back to Dashboard"
          border="none"
          bg="none"
          mb="12px"
          ml="-6px"
          onClick={() => {
            navigate(`/pro`)
          }}
          customTextStyle={{
            fontSize: '12px',
            whiteSpace: 'nowrap'
          }}
        />
      )} */}
      <HStack w="100%" justify="space-between" mb={h5ShowIcon ? '8px' : '0px'}>
        {h5ShowIcon || !isApp ? (
          <TokenDropSelectBlock
            children={
              <HStack className="singleTokenInfoBox">
                <SingleTokenInfo
                  haveVerified
                  haveAddress
                  haveTooltip={true}
                  imgBoxStyle={{ w: '32px', h: '32px' }}
                  symbolFontSize="16px"
                  nameEllipsesDecimals={20}
                  coinType={showTokenInfo?.coin_type}
                  warningIcon={{ iconW: '16px', iconH: '16px' }}
                />
                <Icon className="arrow_icon" svgW="16px" xlinkHref="#icon-icon_arrow" variant="gray" />
              </HStack>
            }
            onCoinSelect={onCoinSelect}
            whiteTokenList={whiteTokenList}
            selectCoin={null}
          />
        ) : (
          <SingleTokenInfo
            haveVerified
            haveAddress
            haveTooltip={true}
            imgBoxStyle={{ w: '32px', h: '32px' }}
            symbolFontSize="16px"
            nameEllipsesDecimals={20}
            coinType={showTokenInfo?.coin_type}
            warningIcon={{ iconW: '16px', iconH: '16px' }}
          />
        )}
        {(h5ShowIcon || !isApp) && (
          <HStack gap="12px">
            <CetusTooltip showTooltip={isApp ? false : true} placement="top" tooltip={<Text fontSize="12px">Refresh</Text>}>
              <Center>
                <RefreshButton
                  handleRefresh={() => {
                    getCoinRelatedData(showTokenInfo?.coin_type || '', true)
                  }}
                  borderRadius="8px"
                  w="28px"
                  h="28px"
                  innerStyle={{ bg: 'bg_secondary' }}
                />
              </Center>
            </CetusTooltip>
            {!notChangeToken && (
              <CetusTooltip
                showTooltip={isApp ? false : true}
                placement="top"
                tooltip={<Text fontSize="12px">Switch to {textEllipses(anotherTokenInfo?.symbol, 10) || ''} </Text>}
              >
                <HStack
                  w="28px"
                  h="28px"
                  borderRadius="8px"
                  bg="bg_secondary"
                  border="1px solid"
                  borderColor="border"
                  justify="center"
                  align="center"
                >
                  <Icon xlinkHref="#icon-icon_swap1" svgW="18px" svgH="18px" onClick={handleToggleDirect} />
                </HStack>
              </CetusTooltip>
            )}

            {showTokenInfo?.coin_type && userCollectObj[toLongCoinType(showTokenInfo?.coin_type)] ? (
              <CetusTooltip showTooltip={isApp ? false : true} placement="top" tooltip={<Text fontSize="12px">Remove from Watchlisit</Text>}>
                <HStack
                  w="28px"
                  h="28px"
                  borderRadius="8px"
                  bg="bg_secondary"
                  border="1px solid"
                  borderColor="border"
                  justify="center"
                  align="center"
                >
                  <Icon
                    xlinkHref="#icon-icon_star_sel"
                    svgFill="primary"
                    svgHover="primary"
                    onClick={e => {
                      e.stopPropagation()
                      if (showTokenInfo?.coin_type) {
                        delUserCollectToken(showTokenInfo)
                      }
                    }}
                  />
                </HStack>
              </CetusTooltip>
            ) : (
              <CetusTooltip showTooltip={isApp ? false : true} placement="top" tooltip={<Text fontSize="12px">Add to Watchlisit</Text>}>
                <HStack
                  w="28px"
                  h="28px"
                  borderRadius="8px"
                  bg="bg_secondary"
                  border="1px solid"
                  borderColor="border"
                  justify="center"
                  align="center"
                >
                  <Icon
                    cursor={userCollectList?.length >= 100 ? 'not-allowed' : 'pointer'}
                    xlinkHref="#icon-icon_star"
                    variant="primary"
                    onClick={e => {
                      e.stopPropagation()
                      if (showTokenInfo?.coin_type && userCollectList?.length < 100) {
                        addUserCollectToken(showTokenInfo)
                      }
                    }}
                  />
                </HStack>
              </CetusTooltip>
            )}
          </HStack>
        )}
      </HStack>
    </VStack>
  )
}

export default CoinHeader
