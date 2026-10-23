import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favoriteModelIds: string[];
  addFavorite: (modelId: string) => void;
  removeFavorite: (modelId: string) => void;
  toggleFavorite: (modelId: string) => void;
  isFavorite: (modelId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteModelIds: [],

      addFavorite: (modelId) => {
        set((state) => {
          if (state.favoriteModelIds.includes(modelId)) {
            return state;
          }
          return { favoriteModelIds: [...state.favoriteModelIds, modelId] };
        });
      },

      removeFavorite: (modelId) => {
        set((state) => ({
          favoriteModelIds: state.favoriteModelIds.filter((id) => id !== modelId),
        }));
      },

      toggleFavorite: (modelId) => {
        const { isFavorite, addFavorite, removeFavorite } = get();
        if (isFavorite(modelId)) {
          removeFavorite(modelId);
        } else {
          addFavorite(modelId);
        }
      },

      isFavorite: (modelId) => {
        return get().favoriteModelIds.includes(modelId);
      },
    }),
    {
      name: 'favorites-storage',
    }
  )
);
