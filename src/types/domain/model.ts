export interface ModelProvider {
  id: string;
  name: string;
  logo: string;
  country: 'domestic' | 'international';
  description: string;
}

export interface ModelPricing {
  input: number; // CNY per 1M tokens, or provider-specific CNY unit for non-token models
  output: number; // CNY per 1M tokens, or provider-specific CNY unit for non-token models
}

export interface ModelPerformance {
  contextWindow: number; // in tokens
  maxOutput: number; // in tokens
  latency: number; // average ms
  accuracy: number; // percentage
}

export type ModelType = 'chat' | 'code' | 'image' | 'multimodal' | 'audio' | 'embedding' | 'moderation';

export interface AIModel {
  id: string;
  providerId: string;
  name: string;
  version: string;
  type: ModelType;
  pricing: ModelPricing;
  performance: ModelPerformance;
  features: string[];
  releaseDate: string;
  websiteUrl?: string;
}

export interface ModelWithProvider extends AIModel {
  provider: ModelProvider;
}
