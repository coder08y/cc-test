import icon_accounts from '@/assets/images/icon_accounts@2x.png'
import icon_cumulativetransactions from '@/assets/images/icon_cumulativetransactions@2x.png'
import icon_cumulativevolume from '@/assets/images/icon_cumulativevolume@2x.png'
import icon_totalvaluelocked from '@/assets/images/icon_totalvaluelocked@2x.png'
import { StatisticsSummary } from '@/types/clmm'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HStack, Skeleton, Text, VStack } from '@chakra-ui/react'

export default function Statistics({ statisticsData, isRefresh }: { statisticsData?: StatisticsSummary; isRefresh: boolean }) {
  const { isApp } = useWindowWidth()
  return (
    <HStack
      w="100%"
      justifyContent="space-between"
      flexWrap={{
        base: 'wrap',
        lg: 'nowrap'
      }}
      sx={{
        '>div': {
          w: isApp ? 'calc(50% - 16px)' : '25%'
        }
      }}
    >
      <InfoData label="Cumulative Volume" value={statisticsData?.summary?.cumulativeVol || '0'} imgSrc={icon_accounts} isLoading={isRefresh} />
      <InfoData
        label="Total Value Locked"
        value={statisticsData?.summary?.totalTvl || '0'}
        imgSrc={icon_cumulativetransactions}
        isLoading={isRefresh}
      />
      <InfoData
        label="Cumulative Transactions"
        value={statisticsData?.summary?.cumulativeTx || '0'}
        imgSrc={icon_cumulativevolume}
        isLoading={isRefresh}
      />
      <InfoData
        label="Total Accounts"
        value={statisticsData?.summary?.cumulativeUserAccount || '0'}
        imgSrc={icon_totalvaluelocked}
        isLoading={isRefresh}
      />
    </HStack>
  )
}

const InfoData = ({ label, value, imgSrc, isLoading }: { label: string; value: string; imgSrc: string; isLoading: boolean }) => {
  return (
    <VStack
      mt="40px"
      // align={{
      //   base: 'flex-start',
      //   lg: 'center'
      // }}
    >
      <VStack
        flexDirection={{
          base: 'row',
          lg: 'column'
        }}
      >
        {/* <Image src={imgSrc} w="34px" h="34px" /> */}
        <Text
          whiteSpace="nowrap"
          fontSize={{
            base: '12px',
            lg: '14px'
          }}
        >
          {label}
        </Text>
      </VStack>
      <Skeleton h="18px" isLoaded={!!value && !isLoading}>
        <Text
          fontSize={{
            base: '16px',
            lg: '18px'
          }}
          fontWeight="500"
          color="text_caption"
        >
          {value}
        </Text>
      </Skeleton>
    </VStack>
  )
}
