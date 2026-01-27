import useProStore from '@/store/pro'
import { AddressCopyLink, CetusTooltip } from '@cetus/design'
import useExplorer from '@cetus/hooks/src/useExplorer'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HTextLabelBox } from '@cetus/ui-kit'
import { Text, VStack } from '@chakra-ui/react'
import React, { useState } from 'react'
import TokenDisclaimerModal from './TokenDisclaimerModal'

const CoinDetailData = () => {
  const { getExplorerUrl } = useExplorer()
  const { isApp } = useWindowWidth()
  const [isOpenTokenDisclaimer, setIsOpenTokenDisclaimer] = useState(false)
  const { proceedTokenDisclaimerObj, coinDetail, coinDetailLoading } = useProStore()
  const ref = React.useRef<HTMLDivElement>(null)
  const [isOverflowed, setIsOverflowed] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (el) {
      setIsOverflowed(el.scrollWidth > el.clientWidth)
    }
  }, [coinDetail?.website])
  return (
    <VStack gap="12px" w="100%" align="flex-start" sx={{ div: { lineHeight: '20px', h: '20px' } }}>
      <Text color="text_caption" fontSize="16px">
        Coin Info
      </Text>
      <HTextLabelBox
        label="Creator"
        isLoading={coinDetailLoading}
        labelStyle={{
          fontSize: '14px',
          justifyContent: 'space-between',
          whiteSpace: 'nowrap',
          color: 'primary_gray'
        }}
        value={
          <AddressCopyLink
            address={coinDetail?.creator || ''}
            fontSize="14px"
            showLink={false}
            color="text_caption"
            onClickLink={() => window.open(getExplorerUrl(coinDetail?.creator || '--', 'account'))}
          />
        }
        valueStyle={{
          fontSize: '14px'
        }}
        skeletonStyle={{
          valueH: '16px !important'
        }}
      />
      <HTextLabelBox
        label="Creation Time"
        isLoading={coinDetailLoading}
        labelStyle={{
          whiteSpace: 'nowrap',
          fontSize: '14px',
          color: 'primary_gray'
        }}
        value={coinDetail?.cratedTime || '--'}
        valueStyle={{
          fontSize: '14px'
        }}
        skeletonStyle={{
          valueH: '16px !important'
        }}
      />
      <HTextLabelBox
        label="Package ID"
        isLoading={coinDetailLoading}
        labelStyle={{
          whiteSpace: 'nowrap',
          fontSize: '14px',
          color: 'primary_gray'
        }}
        value={
          <AddressCopyLink
            address={coinDetail?.packageId || ''}
            fontSize="14px"
            showLink={false}
            color="text_caption"
            onClickLink={() => window.open(getExplorerUrl(coinDetail?.packageId || '', 'package'))}
          />
        }
        valueStyle={{
          fontSize: '14px'
        }}
        skeletonStyle={{
          valueH: '16px !important'
        }}
      />
      {/* <HTextLabelBox
        label='Coin Type'
        isLoading={coinDetailLoading}
        labelStyle={{
          whiteSpace: 'nowrap',
          fontSize: '14px',
          color: 'primary_gray' 
        }}
        value={
          <AddressCopyLink
            address={coinDetail?.coinType || '--'}
            fontSize='14px'
            showLink={false}
            color='text_caption'
            onClickLink={() => window.open(getExplorerUrl(coinDetail?.coinType || '--', 'coin'))}
          />
        }
        valueStyle={{
          fontSize: '14px'
        }}
        skeletonStyle={{
          valueH: '16px !important'
        }}
      /> */}
      <HTextLabelBox
        label="Decimals"
        isLoading={coinDetailLoading}
        labelStyle={{
          whiteSpace: 'nowrap',
          fontSize: '14px',
          color: 'primary_gray'
        }}
        value={coinDetail?.decimals === undefined ? '--' : coinDetail?.decimals.toString()}
        valueStyle={{
          fontSize: '14px'
        }}
        skeletonStyle={{
          valueH: '16px !important'
        }}
      />
      {coinDetail?.website && (
        <HTextLabelBox
          label="Website"
          isLoading={coinDetailLoading}
          labelStyle={{
            whiteSpace: 'nowrap',
            fontSize: '14px',
            color: 'primary_gray'
          }}
          value={
            <CetusTooltip
              placement="top"
              showTooltip={isOverflowed}
              tooltip={
                <Text fontSize="12px" lineHeight="20px" color="text_caption">
                  {coinDetail?.website}
                </Text>
              }
            >
              <Text
                ref={ref}
                height="18px"
                cursor="pointer"
                maxWidth={{ base: '220px', lg: '220px' }}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                sx={{ _hover: { borderBottom: '1px solid' } }}
                color="text_caption"
                // onClick={() => window.open(coinDetail?.website)}
                // TODO proceedTokenDisclaimerObj需要放到indexDB
                onClick={() => {
                  console.log('🚀 ~ CoinDetailData ~ proceedTokenDisclaimerObj:', proceedTokenDisclaimerObj)
                  // && proceedTokenDisclaimerObj?.[coinDetail?.website] 不区分地址 只弹一次
                  if (coinDetail?.website && proceedTokenDisclaimerObj && Object.keys(proceedTokenDisclaimerObj).length >= 1) {
                    window.open(coinDetail?.website)
                  } else {
                    setIsOpenTokenDisclaimer(true)
                  }
                }}
              >
                {coinDetail?.website || '--'}
              </Text>
            </CetusTooltip>
          }
          valueStyle={{
            fontSize: '14px'
          }}
          skeletonStyle={{
            valueH: '16px !important'
          }}
        />
      )}
      {isOpenTokenDisclaimer && (
        <TokenDisclaimerModal website={coinDetail?.website || ''} isOpen={isOpenTokenDisclaimer} onClose={() => setIsOpenTokenDisclaimer(false)} />
      )}
    </VStack>
  )
}

export default CoinDetailData
