import useWindowWidth from '@cetus/hooks/src/useWindowWidth'
import H5ProfileTabs from './H5ProfileTabs'
import PCProfileTabs from './ProfileTab'
import { ProfileTabsProps } from './type'

function ProfileTabs(props: ProfileTabsProps) {
  const { isApp } = useWindowWidth()
  return isApp ? <H5ProfileTabs {...props} /> : <PCProfileTabs {...props} />
}

export default ProfileTabs
