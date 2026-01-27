import { CetusTooltip, useTokenSelect } from '@cetus/design'
import SingleTokenInfo from '@cetus/design/src/components/common/SingleTokenInfo'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import useTokenSelectStore from '@cetus/stores/src/useTokenSelectStore'
import { Icon } from '@cetus/ui-kit'
import { toLongCoinType } from '@cetus/utils'
import { Center, HStack, Text } from '@chakra-ui/react'

export default function ProCoinBlock({ info }: { info: any }) {
  const { isApp } = useWindowWidth()
  const { userCollectObj, userCollectList } = useTokenSelectStore()
  const { delUserCollectToken, addUserCollectToken } = useTokenSelect()
  return (
    <HStack gap={{ base: '4px', lg: '8px' }}>
      {info?.coinType && userCollectObj[toLongCoinType(info?.coinType)] ? (
        <CetusTooltip showTooltip={isApp ? false : true} placement="top" tooltip={<Text fontSize="12px">Remove from Watchlisit</Text>}>
          <Center>
            <Icon
              xlinkHref="#icon-icon_star_sel"
              svgFill="primary"
              svgHover="primary"
              onClick={e => {
                e.stopPropagation()
                if (info?.coinType) {
                  delUserCollectToken(info)
                }
              }}
            />
          </Center>
        </CetusTooltip>
      ) : (
        <CetusTooltip showTooltip={isApp ? false : true} placement="top" tooltip={<Text fontSize="12px">Add to Watchlisit</Text>}>
          <Center>
            <Icon
              xlinkHref="#icon-icon_star"
              cursor={userCollectList?.length >= 100 ? 'not-allowed' : 'pointer'}
              variant="primary"
              onClick={e => {
                e.stopPropagation()
                if (info?.coinType && userCollectList?.length < 100) {
                  addUserCollectToken(info)
                }
              }}
            />
          </Center>
        </CetusTooltip>
      )}
      <SingleTokenInfo
        haveVerified
        symbolEllipsesDecimals={isApp ? 8 : 10}
        nameEllipsesDecimals={10}
        isCancelBubble={true}
        haveTooltip={true}
        token={info}
        warningIcon={{ isNeedShow: false }}
      />
    </HStack>
  )
}
