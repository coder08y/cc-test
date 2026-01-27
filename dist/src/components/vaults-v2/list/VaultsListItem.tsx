import useVaultsListV2Store from '@/store/vaults-v2/useVaultsList'
import { VaultsV2ListItemProps } from '@/types/vaults-v2'
import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import { useAccountStore } from '@cetus/stores'
import { APP_ENV } from '@cetus/types'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import VaultsListItemH5 from './H5/VaultsListItemH5'
import { VaultsListItemPC } from './PC/VaultsListItemPC'

function VaultsListItem(props: VaultsV2ListItemProps) {
  const navigate = useNavigate()
  const { apiInfo, isShowPowered, currentStatus } = props
  const { lpTokenInfoObj } = useVaultsListV2Store()
  const { currentAccount } = useAccountStore()
  const lpTokenInfo = useMemo(() => {
    return lpTokenInfoObj[apiInfo?.lpTokenType]
  }, [apiInfo?.lpTokenType, JSON.stringify(lpTokenInfoObj)])

  const [openExpend, setOpenExpend] = useState<boolean>(false)

  const jumpVaultsDetail = (vaultId: string) => {
    navigate(`/vaults/${vaultId}`)
  }

  const onExpand = () => {
    setOpenExpend(!openExpend)
  }

  const { isApp } = useWindowWidth()

  const isShowAumLimit = useMemo(() => {
    return APP_ENV !== 'mainnet'
  }, [APP_ENV])

  return isApp ? (
    <VaultsListItemH5
      openExpend={openExpend}
      onExpand={onExpand}
      apiInfo={apiInfo}
      logo_url={lpTokenInfo?.logo_url}
      jumpVaultsDetail={jumpVaultsDetail}
      isShowPowered={isShowPowered}
      isShowAumLimit={isShowAumLimit}
      currentStatus={currentStatus}
    />
  ) : (
    <VaultsListItemPC
      openExpend={openExpend}
      onExpand={onExpand}
      apiInfo={apiInfo}
      logo_url={lpTokenInfo?.logo_url}
      jumpVaultsDetail={jumpVaultsDetail}
      isShowPowered={isShowPowered}
      isShowAumLimit={isShowAumLimit}
      currentStatus={currentStatus}
    />
  )
}

export default VaultsListItem
