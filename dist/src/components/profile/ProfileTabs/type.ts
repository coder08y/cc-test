export type ProfileTabsProps = {
  tabList: any[]
  activeTab: string
  tabData: Record<string, { totalValue: string; isLoading: boolean }>
  onClickTab: (value: string) => void
}

export type ProfileTabProps = {
  imgUrl: string
  value: string
  title: string
  url: string
  isLoading: boolean
  onClick: () => void
  tooltip?: React.ReactNode
}
