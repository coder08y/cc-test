import { timeFormat } from '@cetus/utils'
import { useState } from 'react'
export enum Month {
  Jan = 1,
  Feb = 2,
  Mar = 3,
  Apr = 4,
  May = 5,
  Jun = 6,
  Jul = 7,
  Aug = 8,
  Sep = 9,
  Oct = 10,
  Nov = 11,
  Dec = 12
}
export function useChartTime() {
  const [time, setTime] = useState('')

  const getCurrentTime = () => {
    const nowTime = timeFormat(Date.parse(new Date().toUTCString()), 'YMD') || ''
    const months = nowTime.slice(5, 7)
    const value = Month[Number(months)]
    const currentDay = nowTime.slice(8, 10)
    const currentMonth = value
    const currentYear = nowTime.slice(0, 4)
    const date = currentMonth + ' ' + currentDay + ',' + ' ' + currentYear + ' ' + '(UTC)'
    setTime(date)
  }

  const getHoverTime = (timeDate: any, type: 'D' | 'W' | 'M') => {
    const timestamp = Date.parse(timeDate)
    const weekDate = new Date(timestamp)
    weekDate.setDate(weekDate.getDate() + 7)
    const monthDate = new Date(timestamp)
    monthDate.setDate(monthDate.getDate() + 31)
    const gmtUTCWeekEnd = weekDate.toUTCString()
    const gmtUTCMonthEnd = monthDate.toUTCString()

    const monthTime = timeFormat(Date.parse(gmtUTCMonthEnd), 'YMD') || ''
    const nowTime = timeFormat(Date.parse(new Date().toUTCString()), 'YMD') || ''
    const weekTime =
      Date.parse(gmtUTCWeekEnd) > Date.parse(new Date().toUTCString())
        ? timeFormat(Date.parse(new Date().toUTCString()), 'YMD') || ''
        : timeFormat(Date.parse(gmtUTCWeekEnd), 'YMD') || ''

    const nowMonths = nowTime.slice(5, 7)
    const nowValue = Month[Number(nowMonths)]
    const nowDay = nowTime.slice(8, 10)
    const nowMonth = nowValue
    const nowYear = nowTime.slice(0, 4)

    const months = timeDate.slice(5, 7)
    const value = Month[Number(months)]
    const currentDay = timeDate.slice(8, 10)
    const currentMonth = value
    const currentYear = timeDate.slice(0, 4)

    const weekMonths = weekTime.slice(5, 7)
    const weekValue = Month[Number(weekMonths)]
    const weekDay = weekTime.slice(8, 10)
    const weekMonth = weekValue
    const weekYear = weekTime.slice(0, 4)

    const monthValue = Number(months) == 12 ? Month[1] : Month[Number(months) + 1]
    const monthMonth = monthValue
    const monthYear = monthTime.slice(0, 4)
    let date
    if (type == 'D') {
      date = currentMonth + ' ' + currentDay + ',' + ' ' + currentYear + ' ' + '(UTC)'
    } else if (type == 'W') {
      date = currentDay + ' ' + currentMonth + '-' + weekDay + ' ' + weekMonth + ' ' + ',' + ' ' + weekYear + ' ' + '(UTC)'
    } else {
      date =
        Date.parse(gmtUTCMonthEnd) >= Date.parse(new Date().toUTCString())
          ? currentMonth + ' ' + '01' + '-' + nowMonth + ' ' + nowDay + ',' + ' ' + nowYear + ' ' + '(UTC)'
          : currentMonth + ' ' + '01' + '-' + monthMonth + ' ' + '01' + ',' + ' ' + monthYear + ' ' + '(UTC)'
    }
    setTime(date)
  }

  return {
    time,
    getCurrentTime,
    getHoverTime
  }
}
