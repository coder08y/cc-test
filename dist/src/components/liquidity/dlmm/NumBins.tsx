import WithTooltipInfo from '@/components/common/WithTooltipInfo'
import { InputBox } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { NumericFormatInput } from '@cetus/ui-kit'
import { Skeleton, VStack } from '@chakra-ui/react'
import { useSize } from 'ahooks'

type NumBinsProps = {
  numBins: number | string
  positionCount: number
  onNumBinsChange: (event: string) => void
  onNumBinsBlur: () => void
  isLoading?: boolean
}

function NumBins({ numBins, positionCount, onNumBinsBlur, onNumBinsChange, isLoading }: NumBinsProps) {
  const { isApp } = useWindowWidth()
  const size = useSize(document?.querySelector('.controlPriceRange'))
  const minH = size?.height ? `${isApp ? 60 : size.height}px` : '100%'

  return (
    <InputBox flex={{ base: '1', lg: '0 0 160px' }} minH={minH} h={minH} borderRadius="12px" p="8px 12px 12px">
      <VStack w="100%" h="100%" justify="center">
        <WithTooltipInfo
          label="Num Bins"
          tooltip="The number of bins in your position. A wider price range usually requires more bins. A position with more bins may consume higher gas during liquidity-related txns."
          wrapStyle={{
            width: 'auto',
            flexDir: 'column',
            align: 'center',
            sx: {
              'div > p:first-of-type': {
                fontSize: '12px'
              }
            },
            gap: '4px'
          }}
          w="320px"
          p="8px"
        >
          {isLoading ? (
            <Skeleton w="100px" h="14px" />
          ) : (
            <NumericFormatInput
              value={numBins.toString()}
              onChange={onNumBinsChange}
              decimals={0}
              onBlur={onNumBinsBlur}
              style={{
                width: 'calc(100% - 8px)',
                background: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                opacity: 1,
                outline: 'none',
                color: 'var(--chakra-colors-text_caption)',
                fontSize: '14px',
                height: '14px',
                lineHeight: '14px',
                textAlign: 'center',
                fontWeight: '500'
              }}
            />
          )}
        </WithTooltipInfo>

        {/* <CetusTooltip
          tooltip={
            <Text fontSize="12px" lineHeight="20px">
              Each position covers up to {MAX_BIN_PER_POSITION - 1} bins.
            </Text>
          }
        >
          <Text fontSize="12px" color="primary_gray" cursor="pointer" textDecoration="underline dotted" textUnderlineOffset="2px">
            {`${positionCount} ${positionCount > 1 ? 'Positions' : 'Position'}`}
          </Text>
        </CetusTooltip> */}
      </VStack>
    </InputBox>
  )
}

export default NumBins
