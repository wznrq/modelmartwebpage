import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ComparisonState {
  selectedModelIds: string[];
  maxComparisons: number;
  addModel: (modelId: string) => void;
  removeModel: (modelId: string) => void;
  clearComparison: () => void;
  canAddMore: () => boolean;
}

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      selectedModelIds: ['qwen3-max-2026-01-23', 'deepseek-v4-flash', 'glm-5'],
      maxComparisons: 4,

      addModel: (modelId) => {
        const { selectedModelIds, maxComparisons } = get();
        if (selectedModelIds.length < maxComparisons && !selectedModelIds.includes(modelId)) {
          set({ selectedModelIds: [...selectedModelIds, modelId] });
        }
      },

      removeModel: (modelId) => {
        set((state) => ({
          selectedModelIds: state.selectedModelIds.filter((id) => id !== modelId),
        }));
      },

      clearComparison: () => set({ selectedModelIds: [] }),

      canAddMore: () => {
        const { selectedModelIds, maxComparisons } = get();
        return selectedModelIds.length < maxComparisons;
      },
    }),
    {
      name: 'comparison-storage',
    }
  )
);
