import Pagination from '@/components/common/Pagination'
import useRewardDistribution, { RewardDistributionType, RewardTabEnum, RewardType } from '@/hooks/dlmm/useRewardDistribution'
import { CetusTooltip, SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { H5MapTable, NoData, SingleCoinImage, Table } from '@cetus/ui-kit'
import { ColumnsType } from '@cetus/ui-kit/src/components/Table'
import { d, formatNumber, getTimeDifference, textEllipses, utcTimeFormattedWithSeconds } from '@cetus/utils'
import { Center, HStack, Spinner, Stack, Text, VStack } from '@chakra-ui/react'

const getColumns = (type: RewardType): ColumnsType<RewardDistributionType>[] => [
  {
    title: <Text>Rewards (per day)</Text>,
    key: 'rewardPerDay',
    render: (record: RewardDistributionType) => {
      const { coin, amount, start_timestamp, end_timestamp } = record
      const rewardPerDay = d(amount).div(d(end_timestamp).sub(start_timestamp).div(86400)).toString()
      return (
        <HStack gap="4px">
          <SingleCoinImage
            imageUrl={coin?.iconUrl}
            imgBoxStyle={{
              w: '20px',
              h: '20px'
            }}
            imageStyle={{ w: '20px', h: '20px' }}
          />
          <Text color="text_caption">{formatNumber(rewardPerDay, coin?.decimals)}</Text>
          <Text>{textEllipses(coin?.symbol, 10)}</Text>
        </HStack>
      )
    },
    thConfig: { w: '30%', h: '38px', p: '0 !important' },
    tdConfig: { h: '38px !important', p: '0 !important' }
  },
  {
    title: <Text textAlign="right">{type === 'upcoming' ? 'Starts in' : 'Started'}</Text>,
    key: 'starTimestamp',
    render: (record: RewardDistributionType) => {
      const startTimeStamp = record.start_timestamp * 1000
      return (
        <CetusTooltip tooltip={<Text fontSize="12px">{utcTimeFormattedWithSeconds(startTimeStamp)} UTC</Text>}>
          <HStack justify="flex-end">
            <Text color="text_caption" whiteSpace="nowrap" borderBottom="1px dotted" borderColor="text_caption" w="min-content">
              {getTimeDifference(startTimeStamp)}
            </Text>
          </HStack>
        </CetusTooltip>
      )
    },
    thConfig: { w: '30%', h: '38px', p: '0 8px !important' },
    tdConfig: { h: '38px !important', p: '0 !important' }
  },
  {
    title: <Text textAlign="right">{type === 'expired' ? 'Ended' : 'Ends in'}</Text>,
    key: 'endTimestamp',
    render: (record: RewardDistributionType) => {
      const endTimeStamp = record.end_timestamp * 1000
      return (
        <CetusTooltip tooltip={<Text fontSize="12px">{utcTimeFormattedWithSeconds(endTimeStamp)} UTC</Text>}>
          <HStack justify="flex-end">
            <Text color="text_caption" whiteSpace="nowrap" borderBottom="1px dotted" borderColor="text_caption" w="min-content">
              {getTimeDifference(endTimeStamp)}
            </Text>
          </HStack>
        </CetusTooltip>
      )
    },
    thConfig: { w: '40%', h: '38px', p: '0 !important' },
    tdConfig: { h: '38px !important', p: '0 !important' }
  }
]

function RewardDistribution() {
  const { onJumpAddIncentive, currentType, typeList, handleTypeChange, isLoading, rewardList, handleChangePage, total, pageSize, currentPage } =
    useRewardDistribution()

  return (
    <VStack
      w="100%"
      gap={{ base: '12px', lg: '8px' }}
      borderRadius="16px"
      border="1px solid"
      p={{ base: '32px 12px 12px', lg: '20px 12px' }}
      borderColor={{ base: 'transparent', lg: 'border' }}
      bg={{ base: 'transparent', lg: 'bg_secondary' }}
    >
      <Stack
        flexDir={{ base: 'column', lg: 'row' }}
        w="100%"
        justify="space-between"
        p={{ base: '0px', lg: '0 8px' }}
        gap={{ base: '12px', lg: '16px' }}
      >
        <VStack align="flex-start" gap={{ base: '12px', lg: '8px' }}>
          <Text color="text_caption" fontSize={{ base: '14px', lg: '16px' }} fontWeight={{ base: '500', lg: '400' }} h="20px" lineHeight="20px">
            Reward Distributions
          </Text>
          <Text color="primary_gray" lineHeight="20px" fontSize={{ base: '12px', lg: '14px' }}>
            Anyone can allocate extra incentives to a DLMM pool.&nbsp;&nbsp;&nbsp;
            <Text as="span" lineHeight="20px" cursor="pointer" color="primary" onClick={onJumpAddIncentive}>
              Add Incentive
            </Text>
          </Text>
        </VStack>
        <SelectTab<any, RewardType>
          type="outlineTab"
          tabList={typeList}
          currentTab={currentType}
          isActive={(current, tab) => current === tab.key}
          handleChangeTab={handleTypeChange}
          wrapStyle={{
            h: '32px',
            p: { base: '2px', lg: '4px' },
            borderRadius: '8px',
            flex: { base: '0 0 32px', lg: '0 0 308px' }
          }}
          itemStyle={{
            fontSize: '12px',
            flex: 1,
            borderRadius: '6px'
          }}
        />
      </Stack>
      {isLoading && (
        <Center h="198px">
          <Spinner />
        </Center>
      )}
      {!isLoading && rewardList && rewardList?.length === 0 && (
        <NoData type="nodata" text={`No ${RewardTabEnum[currentType]} Rewards`} border="none" p="20px" />
      )}
      {!isLoading && rewardList && rewardList?.length > 0 && (
        <VStack w="100%" gap="12px">
          <RewardDistributionTable
            currentType={currentType}
            list={rewardList}
            isLoading={isLoading}
            currentPage={currentPage}
            total={total}
            pageSize={pageSize}
            onPageChange={handleChangePage}
          />
        </VStack>
      )}
    </VStack>
  )
}

type RewardDistributionTableProps = {
  list: any[]
  isLoading: boolean
  currentPage: number
  total: number
  pageSize: number
  onPageChange: (page: number) => void
  currentType: RewardType
}

const RewardDistributionTable = ({ list, isLoading, currentPage, onPageChange, total, pageSize, currentType }: RewardDistributionTableProps) => {
  const { isApp } = useWindowWidth()
  const data = list?.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <>
      {isApp ? (
        <H5MapTable<any>
          columns={getColumns(currentType)}
          dataSource={data}
          loading={isLoading && currentPage === 1}
          itemSkeletonLength={5}
          itemHeight="20px"
          wrapStyle={{ gap: 0 }}
          isShowBorder={false}
          rowStyle={(_, index) => ({
            w: '100%',
            p: '0px',
            mt: '8px',
            pb: index !== data?.length - 1 ? '12px' : '0px',
            mb: index !== data?.length - 1 ? '4px' : '0px',
            borderBottom: index !== data?.length - 1 ? '1px solid' : 'none',
            borderColor: 'border'
          })}
        />
      ) : (
        <Table<any>
          columns={getColumns(currentType)}
          dataSource={data}
          skeletonLength={5}
          loading={isLoading && currentPage === 1}
          rowStyle={{ h: '38px', cursor: 'pointer' }}
          trPadding="8px"
        />
      )}
      {total > pageSize && (
        <Center w="100%">
          <Pagination currentPage={currentPage} total={total || 0} pageSize={pageSize} onChange={onPageChange} />
        </Center>
      )}
    </>
  )
}

export default RewardDistribution
