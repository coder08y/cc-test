import { SelectTab } from '@cetus/design'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { HStack, StackProps, Text, TextProps } from '@chakra-ui/react'
import { ReactNode } from 'react'

type ProfileTab = {
  label: string
  value: string
  num: number
}

type PropsMap = {
  title: {
    title: string
  }
  tab: {
    tabs: Array<{
      label: string
      value: string
      num: number
    }>
    currentTab: string | ProfileTab
    onTabChange: (tab: ProfileTab) => void
    isActive?: (currentTab: string | ProfileTab, tab: ProfileTab) => boolean
  }
}

type ProfileMenusProps<T extends keyof PropsMap> = {
  type: T
} & PropsMap[T] & {
    children?: ReactNode
    wrapStyle?: StackProps
    textStyle?: TextProps
    menuHeight?: string
    haveActiveLine?: boolean
  }
function ProfileMenus<T extends keyof PropsMap>(props: ProfileMenusProps<T>) {
  const { type, children, wrapStyle, menuHeight = '60px', haveActiveLine = true, textStyle = { fontSize: '16px' } } = props
  const _isActive = (currentTab: string | ProfileTab, tab: ProfileTab) => {
    if ('title' in props) {
      return false
    }
    return props?.isActive ? props?.isActive(currentTab, tab) : currentTab === tab.value
  }
  const { isApp } = useWindowWidth()
  return (
    <HStack
      justify="space-between"
      w="100%"
      h={menuHeight}
      {...wrapStyle}
      sx={{
        '>div': {
          p: {
            '&:before': {
              bg: haveActiveLine ? 'primary' : 'none'
            }
          }
        }
      }}
    >
      {'title' in props ? (
        <Text color="text_caption" {...textStyle}>
          {props?.title}
        </Text>
      ) : (
        <SelectTab
          type="borderTab"
          tabList={props.tabs}
          currentTab={props.currentTab}
          handleChangeTab={props.onTabChange}
          isActive={(current, tab) => _isActive(current, tab)}
          wrapStyle={{
            h: menuHeight,
            border: 'none',
            gap: '38px',
            ...wrapStyle
          }}
          itemStyle={textStyle}
        />
      )}
      {children}
    </HStack>
  )
}

export default ProfileMenus
