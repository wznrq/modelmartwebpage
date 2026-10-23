import { useMemo } from 'react';
import type { ModelWithProvider } from '@/types/domain/model';

interface UseModelSearchParams {
  models: ModelWithProvider[];
  searchTerm: string;
  selectedProvider: string;
  sortBy: 'name' | 'price' | 'accuracy';
}

export function useModelSearch({
  models,
  searchTerm,
  selectedProvider,
  sortBy,
}: UseModelSearchParams) {
  const filteredModels = useMemo(() => {
    if (!models.length) return [];

    return models.filter((model) => {
      const matchesSearch =
        !searchTerm ||
        model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.provider.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesProvider =
        selectedProvider === 'all' || model.provider.id === selectedProvider;

      return matchesSearch && matchesProvider;
    });
  }, [models, searchTerm, selectedProvider]);

  const sortedModels = useMemo(() => {
    return [...filteredModels].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.pricing.input - b.pricing.input;
        case 'accuracy':
          return b.performance.accuracy - a.performance.accuracy;
        default:
          return 0;
      }
    });
  }, [filteredModels, sortBy]);

  return {
    filteredModels,
    sortedModels,
    filteredAndSortedModels: sortedModels,
  };
}
