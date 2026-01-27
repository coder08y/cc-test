import useNotifiAlert from '@cetus/design/src/hook/useNotifi/useNotifiAlerts'
import { useNotifiHelper } from '@cetus/design/src/hook/useNotifi/useNotifiHelper'
import { useAccountStore } from '@cetus/stores'
import useNotifiStore from '@cetus/stores/src/notifi'
import useCurrentPos from '../position/useCurrentPos'

type NotifiSubscriptionParams = {
  subscriptionSource: string
  position?: string
  pool?: string
  posIndex?: string
  events?: any
}
export default function useNotifiSubscription() {
  const { getCurrentPosByPosId } = useCurrentPos()
  const { currentAccount } = useAccountStore()
  const { createNotifiAlert, getNotifiAlerts, deleteNotifiAlerts } = useNotifiAlert()
  const { setIsChecked, setNotifiSubscriptionLoading, notifiClient } = useNotifiStore()
  const { createNotifiSubscriptionVerify, getPositionNotifiStatus } = useNotifiHelper()

  const notifiSubscription = async (notifiSubscriptionParams: NotifiSubscriptionParams) => {
    setNotifiSubscriptionLoading(true)
    const canSubscription = await createNotifiSubscriptionVerify()
    if (!canSubscription) {
      setIsChecked(false)
      return false
    }

    const { subscriptionSource, position, posIndex, events } = notifiSubscriptionParams
    console.log('🚀🚀🚀 ~ useNotifiSubscription.ts:30 ~ notifiSubscription ~ notifiSubscriptionParams:', notifiSubscriptionParams)
    try {
      if (subscriptionSource == 'PositionDetail') {
        sendNotifiSubscription(String(position), String(posIndex))
      } else {
        const currentEvent = events.filter(event => event.type.indexOf('OpenPositionEvent') > -1)[0]
        const stakeFarmingEvent = events.filter(event => event.type.indexOf('DepositEvent') > -1)[0]
        const { position, pool } = currentEvent.parsedJson
        const posId = stakeFarmingEvent ? stakeFarmingEvent.parsedJson.wrapped_position_id : currentEvent.parsedJson.position
        const currentPosInfo = await getCurrentPosByPosId(currentAccount?.address, posId)
        if (currentPosInfo) {
          console.log('🚀🚀🚀 ~ file: useNotifiSubscription.ts:36 ~ notifiSubscription ~ currentPosInfo.index:', currentPosInfo.index)
          sendNotifiSubscription(position, String(currentPosInfo.index))
        }
      }
    } catch (error) {
      setNotifiSubscriptionLoading(false)
      console.log('🚀🚀🚀 ~ file: useNotifiSubscription.ts:45 ~ notifiSubscription ~ error:', error)
    }
  }

  const sendNotifiSubscription = async (position: string, posIndex: string) => {
    createNotifiAlert(position, posIndex)
  }

  const notifiUnSubscription = async (posId: string, clmmPool: string, posIndex: string) => {
    console.log('🚀🚀🚀 ~ useNotifiSubscription.ts:57 ~ notifiUnSubscription ~ posId:', posId)
    console.log('🚀🚀🚀 ~ useNotifiSubscription.ts:58 ~ notifiUnSubscription ~ posIndex:', posIndex)
    const { alertID } = getPositionNotifiStatus(posId, String(posIndex))
    console.log('🚀🚀🚀 ~ useNotifiSubscription.ts:59 ~ notifiUnSubscription ~ alertID:', alertID)
    if (alertID) {
      deleteNotifiAlerts(alertID)
    }
  }

  const getNotifiPositionTransfer = (posBaseList, notifiClient, notifiSources) => {
    if (notifiClient && notifiClient.userState && notifiClient.userState.status == 'authenticated') {
      console.log('🚀🚀🚀 ~ useNotifiSubscription.ts:62 ~ getNotifiPositionTransfer ~ notifiSources:', notifiSources)
      for (let j = 0; j < notifiSources.length; j++) {
        const { pool_address, position_index } = notifiSources[j]
        let flag = false
        let pos
        for (let k = 0; k < posBaseList.length; k++) {
          const { posId, index } = posBaseList[k]
          if (pool_address == posId && Number(index) == Number(position_index)) {
            flag = true
          }
          pos = {
            pool_address,
            position_index,
            clmmPool: posBaseList[k].clmmPool
          }
        }

        if (!flag) {
          notifiUnSubscription(pos?.pool_address, pos?.clmmPool, pos?.position_index)
        }
      }
    }
    console.log('🚀🚀🚀 ~ useNotifiSubscription.ts:60 ~ getNotifiPositionTransfer ~ notifiSources:', notifiSources)
    console.log('🚀🚀🚀 ~ useNotifiSubscription.ts:60 ~ getNotifiPositionTransfer ~ posBaseList:', posBaseList)
    console.log('🚀🚀🚀 ~ useNotifiSubscription.ts:60 ~ getNotifiPositionTransfer ~ notifiClient:', notifiClient.us)
  }

  return { notifiSubscription, notifiUnSubscription, getNotifiPositionTransfer }
}
