import { create } from 'zustand'

/**
 * Portfolio Store - Global state for portfolio data
 */
interface PortfolioState {
  // UI state
  isSidebarOpen: boolean
  selectedAssetId: string | null
  selectedCashAccountId: string | null

  // Modal state
  isAssetModalOpen: boolean
  isCashModalOpen: boolean
  modalMode: 'create' | 'edit'

  // Actions
  setSidebarOpen: (open: boolean) => void
  setSelectedAssetId: (id: string | null) => void
  setSelectedCashAccountId: (id: string | null) => void
  openAssetModal: (mode: 'create' | 'edit', assetId?: string) => void
  closeAssetModal: () => void
  openCashModal: (mode: 'create' | 'edit', accountId?: string) => void
  closeCashModal: () => void
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  // Initial state
  isSidebarOpen: true,
  selectedAssetId: null,
  selectedCashAccountId: null,
  isAssetModalOpen: false,
  isCashModalOpen: false,
  modalMode: 'create',

  // Actions
  setSidebarOpen: (open) => set({ isSidebarOpen: open }),
  setSelectedAssetId: (id) => set({ selectedAssetId: id }),
  setSelectedCashAccountId: (id) => set({ selectedCashAccountId: id }),
  openAssetModal: (mode, assetId) =>
    set({
      isAssetModalOpen: true,
      modalMode: mode,
      selectedAssetId: assetId || null,
    }),
  closeAssetModal: () =>
    set({
      isAssetModalOpen: false,
      modalMode: 'create',
      selectedAssetId: null,
    }),
  openCashModal: (mode, accountId) =>
    set({
      isCashModalOpen: true,
      modalMode: mode,
      selectedCashAccountId: accountId || null,
    }),
  closeCashModal: () =>
    set({
      isCashModalOpen: false,
      modalMode: 'create',
      selectedCashAccountId: null,
    }),
}))
