import { BatchAuthOptions } from '@cetus/types'
import { StateCreator, create } from 'zustand'

const testData: BatchAuthOptions = {
  title: 'Claim Yield',
  status: 'pending',
  steps: [
    {
      index: 1,
      status: 'success',
      isActiveStep: false,
      tx: '0x1234567890'
    },
    {
      index: 2,
      status: 'rejected',
      isActiveStep: false,
      error: 'user rejected'
    },
    {
      index: 3,
      status: 'success',
      isActiveStep: false,
      tx: '0x1234567890'
    }
  ]
}

interface BatchAuthState {
  batchAuthOptions?: BatchAuthOptions
  setBatchAuthOptions: (value?: BatchAuthOptions) => void

  showBatchAuthModal: boolean
  setShowBatchAuthModal: (value: boolean) => void
}

const store: StateCreator<BatchAuthState> = (set, get) => ({
  batchAuthOptions: undefined,
  setBatchAuthOptions: (value?: BatchAuthOptions) => {
    set(() => ({
      batchAuthOptions: value
    }))
  },
  showBatchAuthModal: false,
  setShowBatchAuthModal: (value: boolean) => {
    set(() => ({
      showBatchAuthModal: value
    }))
  }
})

const useBatchAuthStore = create(store)
export default useBatchAuthStore
