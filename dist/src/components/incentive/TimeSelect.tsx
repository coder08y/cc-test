import useGetIncentiveTimeOptions from '@/hooks/incentive/useGetIncentiveTimeOptions'
import { IncentiveRewardInfo } from '@/types/incentive'
import { CetusTooltip, TooltipIcon } from '@cetus/design'
import { Icon } from '@cetus/ui-kit'
import { d, utcTimeFormattedWithSeconds } from '@cetus/utils'
import { Button, HStack, Menu, MenuButton, MenuItem, MenuList, Text, VStack } from '@chakra-ui/react'
import { useCallback, useEffect, useState } from 'react'

interface TimeSelectProps {
  title: string
  rewardInfo: IncentiveRewardInfo
  fieldKey: 'startTime' | 'endTime'
  onSelect: (val: string | number, startIsNow?: boolean) => void
}

export default function TimeSelect({ title, rewardInfo, fieldKey, onSelect }: TimeSelectProps) {
  const isEndTime = title === 'End Time'
  const selectedTime = rewardInfo?.[fieldKey]
  const { getIncentiveTimeOptions } = useGetIncentiveTimeOptions()
  const [timeOptions, setTimeOptions] = useState<number[]>([])
  // 异步加载时间选项
  useEffect(() => {
    async function fetchTimeOptions() {
      if (isEndTime && d(rewardInfo?.startTime ?? 0).lte(0)) return
      // 展示最近半年 所以是26周
      const length = isEndTime ? 26 : 2
      try {
        const futureDates: any = await getIncentiveTimeOptions({
          maxIntervals: length,
          baseTime: isEndTime ? rewardInfo?.startTime : new Date().getTime()
        })
        const fullOptions = isEndTime ? futureDates.slice(1) : [Date.now()].concat(futureDates)
        setTimeOptions(fullOptions)
      } catch (error) {
        console.log('🚀 ~ fetchTimeOptions ~ error:', error)
      }
    }

    fetchTimeOptions()
  }, [isEndTime, rewardInfo?.startTime])

  // 判断时间是否可选
  const isAllowSelect = useCallback(
    (date: number): boolean => {
      if (!isEndTime) {
        if (!rewardInfo?.endTime) {
          return true
        } else {
          return d(date).lte(d(rewardInfo?.endTime).minus(7 * 24 * 60 * 60 * 1000))
        }
      } else {
        if (!rewardInfo?.startTime) {
          return true
        }
        return d(date)
          .minus(rewardInfo.startTime)
          .gte(60 * 60 * 1000)
      }
    },
    [isEndTime, rewardInfo?.startTime, rewardInfo?.endTime]
  )

  return (
    <CetusTooltip
      showTooltip={isEndTime && d(rewardInfo?.startTime ?? 0).lte(0)}
      tooltip={<Text fontSize="12px">Select a start time to proceed.</Text>}
      triggerStyle={{ flex: 1, w: '100%' }}
    >
      <Menu isLazy placement="bottom-start">
        {({ onClose }) => (
          <>
            <MenuButton
              as={Button}
              variant="outline"
              h="66px"
              lineHeight="66px"
              w={{ base: '100%', lg: '100%' }}
              isDisabled={isEndTime && d(rewardInfo?.startTime ?? 0).lte(0)}
              _disabled={{
                bg: 'bg_secondary',
                cursor: 'not-allowed'
              }}
              _hover={{ bg: 'bg_secondary' }}
              _active={{
                bg: 'bg_secondary',
                borderColor: 'token_active_border !important',
                boxShadow: '0px 0px 6px 0px #0067AD'
              }}
            >
              <VStack w="100%" align="flex-start" justify="center">
                {selectedTime && (
                  <Text fontSize="12px" lineHeight="12px" h="12px" fontWeight="500">
                    {isEndTime ? 'To (UTC)' : 'From (UTC)'}
                  </Text>
                )}

                <HStack w="100%" justify="space-between">
                  <Text color={selectedTime ? 'text_caption' : 'text_paragraph'} lineHeight="1">
                    {selectedTime ? (rewardInfo?.startIsNow && !isEndTime ? 'Now' : utcTimeFormattedWithSeconds(selectedTime)) : `${title} (UTC)`}
                  </Text>
                  <Icon xlinkHref="#icon-canlender" />
                </HStack>
              </VStack>
            </MenuButton>

            <MenuList zIndex={9999} p="8px 0" w={{ base: 'calc(100vw - 48px)', lg: '234px' }}>
              <VStack maxH="200px" overflow="auto" p="0px 4px 0 4px" gap="4px">
                {timeOptions?.map((date, index) => {
                  const allowSelect = isAllowSelect(date)
                  const isNowOption = index === 0 && !isEndTime
                  return (
                    <MenuItem
                      key={date}
                      h="32px"
                      borderRadius="8px"
                      _hover={{ bg: allowSelect ? 'primary_opacity.10' : undefined }}
                      cursor={allowSelect ? 'pointer' : 'not-allowed'}
                      onClick={() => {
                        if (allowSelect) {
                          // startIsNow: index === 0 && !isEndTime
                          onSelect(isNowOption ? new Date().getTime() : date, isNowOption)
                          onClose()
                        }
                      }}
                    >
                      <Text mr="4px" color={allowSelect ? 'text_caption' : 'text_paragraph'}>
                        {isNowOption ? 'Now' : utcTimeFormattedWithSeconds(date)}
                      </Text>
                      {isNowOption && <TooltipIcon tooltipCon="The reward will activate when the transaction is executed." />}
                    </MenuItem>
                  )
                })}
              </VStack>
              <HStack p="8px 16px 2px" gap="4px">
                <Text fontSize="12px" w="100%" textAlign="left">
                  Times are in UTC
                </Text>
              </HStack>
            </MenuList>
          </>
        )}
      </Menu>
    </CetusTooltip>
  )
}
