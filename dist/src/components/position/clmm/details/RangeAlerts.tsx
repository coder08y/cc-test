import useNotifiSubscription from '@/hooks/notifi/useNotifiSubscription'
import usePositionStore from '@/store/position'
import { useNotifiHelper } from '@cetus/design/src/hook/useNotifi/useNotifiHelper'
import { useAccountStore } from '@cetus/stores'
import useNotifiStore from '@cetus/stores/src/notifi'
import { Button, HStack, StackProps, Switch, Text, VStack } from '@chakra-ui/react'
import { useEffect } from 'react'
import bg_alert from '/images/bg_alerts@2x.png'

interface RangeAlertsProps {
  subscriptionSource: string
  title?: string
  description?: string
  wrapStyle?: StackProps
}

function RangeAlerts({
  subscriptionSource,
  title = 'Range Alerts',
  description = 'Receive alerts via Telegram, SMS, or email when this position goes out of range.',
  wrapStyle = {}
}: RangeAlertsProps) {
  const { getPositionNotifiStatus } = useNotifiHelper()
  const {
    isChecked,
    setIsChecked,
    notifiAuthenticated,
    notifiSourceGroups,
    setIsShowNotifi,
    notifiSubscriptionLoading,
    notifiStatus,
    notifiSources,
    setNotifiSubscriptionLoading
  } = useNotifiStore()
  const { currentAccount } = useAccountStore()
  const { notifiUnSubscription, notifiSubscription } = useNotifiSubscription()
  const { currentPosBaseInfo } = usePositionStore()
  useEffect(() => {
    console.log('🚀🚀🚀 ~ file: RangeAlerts.tsx:42 ~ notifiSubscriptionLoading:', notifiSubscriptionLoading)
    if (
      currentAccount?.address &&
      subscriptionSource == 'PositionDetail' &&
      currentPosBaseInfo &&
      notifiStatus == 'authenticated' &&
      !notifiSubscriptionLoading
    ) {
      const { isSubscription } = getPositionNotifiStatus(currentPosBaseInfo.posId, String(currentPosBaseInfo.index))
      setIsChecked(isSubscription)
    }
  }, [currentAccount, subscriptionSource, currentPosBaseInfo, notifiAuthenticated, notifiSourceGroups, notifiSubscriptionLoading, notifiSources])
  const { createNotifiSubscriptionVerify } = useNotifiHelper()

  const changeSwitch = async (checked: any) => {
    if (subscriptionSource == 'PositionDetail') {
      setNotifiSubscriptionLoading(true)
    }
    setIsChecked(checked)
    console.log('🚀🚀🚀 ~ RangeAlerts.tsx:46 ~ changeSwitch ~ checked:', checked)
    if (checked) {
      const canSubscription = await createNotifiSubscriptionVerify()
      console.log('🚀🚀🚀 ~ RangeAlerts.tsx:49 ~ changeSwitch ~ canSubscription:', canSubscription)
      if (!canSubscription) {
        setIsChecked(false)
        return false
      }
    }

    if (subscriptionSource == 'AddLiquidity') {
      setIsChecked(checked)
    } else if (subscriptionSource == 'PositionDetail') {
      console.log('🚀🚀🚀 ~ changeSwitch ~ checked:', checked)
      if (checked) {
        // const canSubscription = await createNotifiSubscriptionVerify()
        // if (!canSubscription) {
        //   setIsChecked(false)
        // } else {
        const params = {
          subscriptionSource: 'PositionDetail',
          position: currentPosBaseInfo?.posId,
          pool: currentPosBaseInfo?.clmmPool,
          posIndex: String(currentPosBaseInfo?.index)
        }
        notifiSubscription(params)
        // }
      } else {
        notifiUnSubscription(currentPosBaseInfo?.posId, currentPosBaseInfo?.clmmPool, currentPosBaseInfo?.index)
      }
    }
  }

  useEffect(() => {
    return () => {
      setIsChecked(false)
    }
  }, [])

  return (
    <HStack w="100%" bgImage={bg_alert} bgSize="100% 100%" p="16px" borderRadius="8px" {...wrapStyle}>
      <VStack w="100%" gap="8px">
        <HStack w="100%" justify="space-between">
          <Text color="primary">{title}</Text>
          {notifiStatus == 'authenticated' ? (
            <Switch isChecked={isChecked} isDisabled={notifiSubscriptionLoading} onChange={e => changeSwitch(e.target.checked)} />
          ) : (
            <Button
              variant="outline"
              bg="none"
              w="112px"
              h="28px"
              borderRadius="8px"
              fontWeight="500"
              fontSize="14px"
              onClick={() => setIsShowNotifi(true)}
            >
              Set up
            </Button>
          )}
        </HStack>
        <Text color="primary_gray" lineHeight="20px" textAlign="left">
          {description}
        </Text>
      </VStack>
    </HStack>
  )
}
export default RangeAlerts
