import { create } from 'zustand'

interface ProfileState {
  isAutoRefresh: boolean
  setIsAutoRefresh: (status: boolean) => void
}

const useProfileStore = create<ProfileState>(set => ({
  isAutoRefresh: false,
  setIsAutoRefresh: (status: boolean) => {
    set(() => ({
      isAutoRefresh: status
    }))
  }
}))

export default useProfileStore
