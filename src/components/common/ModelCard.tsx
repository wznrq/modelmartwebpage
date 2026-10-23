import { memo } from 'react';
import { Heart, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFavoritesStore } from '@/stores/favoritesStore';
import type { ModelWithProvider } from '@/types/domain/model';
import { useLanguage } from '@/i18n/LanguageContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatPrice } from '@/utils/formatPrice';
import { getModelDataTrust, getTrustScore } from '@/utils/modelDataTrust';
import {
  getProviderDescription,
  getProviderDisplayName,
  translateModelFeature,
  translateModelType,
} from '@/utils/modelTranslations';

interface ModelCardProps {
  model: ModelWithProvider;
  onSelect?: (modelId: string) => void;
  isSelected?: boolean;
  showActions?: boolean;
}

export const ModelCard = memo(function ModelCard({
  model,
  onSelect,
  isSelected,
  showActions = true,
}: ModelCardProps) {
  const { isFavorite, toggleFavorite } = useFavoritesStore();
  const { t, language } = useLanguage();
  const { exchangeRate } = useExchangeRate();
  const favorite = isFavorite(model.id);
  const currency = language === 'en' ? '$' : '¥';
  const dataTrust = getModelDataTrust(model);
  const trustScore = getTrustScore(dataTrust.level);

  return (
    <Card
      className={`group transition-all duration-300 hover:-translate-y-1 ${
        isSelected ? 'ring-2 ring-primary shadow-lg' : 'hover:shadow-xl'
      }`}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-3">
            <img
              src={model.provider.logo}
              alt=""
              className="h-9 w-9 object-contain"
              onError={(event) => {
                event.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h3 className="text-lg font-semibold">{model.name}</h3>
              <p className="text-sm text-muted-foreground">
                {getProviderDisplayName(model.provider.id, model.provider.name, language)}
              </p>
              <p className="mt-0.5 max-w-[16rem] text-xs text-muted-foreground/80">
                {getProviderDescription(model.provider.id, model.provider.description, t)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(model.id);
              }}
              className="p-1.5 rounded-full hover:bg-accent transition-colors"
            >
              <Heart
                className={`h-5 w-5 ${
                  favorite ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                }`}
              />
            </button>
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
              {translateModelType(model.type, t)}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Pricing */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-secondary/50 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('models.inputPrice')}</p>
            <p className="text-lg font-semibold">{formatPrice(model.pricing.input, currency, exchangeRate)}</p>
            <p className="text-xs text-muted-foreground">{t('models.perToken')}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">{t('models.outputPrice')}</p>
            <p className="text-lg font-semibold">{formatPrice(model.pricing.output, currency, exchangeRate)}</p>
            <p className="text-xs text-muted-foreground">{t('models.perToken')}</p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('models.contextWindow')}</span>
            <span className="font-medium">
              {(model.performance.contextWindow / 1000).toFixed(0)}K
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('models.accuracy')}</span>
            <span className="font-medium">{model.performance.accuracy}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t('models.latency')}</span>
            <span className="font-medium">{model.performance.latency}ms</span>
          </div>
        </div>

        {/* Features */}
        <div className="flex flex-wrap gap-2 pt-2">
          {model.features.slice(0, 3).map((feature, idx) => (
            <span
              key={idx}
              className="px-2 py-1 text-xs rounded-md bg-accent text-accent-foreground"
            >
              {translateModelFeature(feature, t)}
            </span>
          ))}
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-green-500/10 text-green-400 border border-green-500/20">
            <ShieldCheck className="h-3 w-3" />
            {t(`models.trust.${dataTrust.level}`)} {trustScore}
          </span>
        </div>

        {showActions && (
          <Button
            variant="outline"
            className="w-full mt-4 group-hover:bg-primary group-hover:text-white transition-colors"
            onClick={() => onSelect?.(model.id)}
          >
            {t('models.viewDetails')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
});
