import { LimitOrderInfo } from '@/types/limit'
import { Icon } from '@cetus/ui-kit'
import { HStack, Text } from '@chakra-ui/react'

export const StatusBlock = ({
  historyInfo,
  openExpendItemObj,
  isProfile = false
}: {
  historyInfo: LimitOrderInfo
  openExpendItemObj: any | undefined
  isProfile?: boolean
}) => {
  return (
    <HStack justifyContent="end" gap="4px">
      {!isProfile &&
        (historyInfo?.status == 'Cancelled' ? (
          <Icon svgW="20px" xlinkHref="#icon-icon_cancelled" svgFill="primary_yellow" svgHover="primary_yellow" />
        ) : (
          <Icon svgW="18px" xlinkHref="#icon-icon_check" svgFill="primary_green" svgHover="primary_green" />
        ))}

      <Text color={historyInfo?.status == 'Cancelled' ? 'primary_yellow' : 'primary_green'}>{historyInfo?.status}</Text>
      {!isProfile && (
        <Icon
          svgW="12px"
          xlinkHref="#icon-icon_arrow"
          variant="gray"
          transition="transform 0.5s"
          transform={openExpendItemObj[historyInfo?.order_id] ? 'rotate(180deg)' : 'rotate(0deg)'}
        />
      )}
    </HStack>
  )
}
