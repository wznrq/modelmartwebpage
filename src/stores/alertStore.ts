import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AlertSubscription {
  modelId: string
  providerId: string
  createdAt: string
}

interface AlertState {
  subscriptions: AlertSubscription[]
  subscribeModel: (modelId: string, providerId: string) => void
  unsubscribeModel: (modelId: string) => void
  isSubscribed: (modelId: string) => boolean
}

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      subscriptions: [],

      subscribeModel: (modelId, providerId) => {
        set((state) => {
          if (state.subscriptions.some((item) => item.modelId === modelId)) {
            return state
          }

          return {
            subscriptions: [
              ...state.subscriptions,
              {
                modelId,
                providerId,
                createdAt: new Date().toISOString(),
              },
            ],
          }
        })
      },

      unsubscribeModel: (modelId) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((item) => item.modelId !== modelId),
        }))
      },

      isSubscribed: (modelId) => get().subscriptions.some((item) => item.modelId === modelId),
    }),
    {
      name: 'modelmart-alerts-storage',
    },
  ),
)
