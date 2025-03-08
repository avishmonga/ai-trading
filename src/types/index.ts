export interface CryptoData {
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  high: number;
  low: number;
  timestamp: number;
}

export interface HistoricalData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface CoinAnalysis {
  symbol: string;
  score: number;
  trend: 'bullish' | 'bearish' | 'neutral';
  volatility: 'high' | 'medium' | 'low';
  recommendation: 'buy' | 'sell' | 'hold';
  lastUpdated: number;
}

export enum AIProvider {
  OpenAI = 'openai',
  Gemini = 'gemini',
}

export interface TradeRecommendation {
  symbol: string;
  entryPrice: number;
  targetPrice: number;
  stopLoss: number;
  riskRewardRatio: number;
  confidence: number;
  reasoning: string;
  timestamp: number;
  provider?: AIProvider;
}

export interface AIAnalysisRequest {
  symbol: string;
  historicalData: HistoricalData[];
  currentPrice: number;
  provider?: AIProvider;
}

export interface AIAnalysisResponse {
  recommendation: TradeRecommendation;
}

export interface AIUsageMetrics {
  provider: AIProvider;
  model: string;
  promptTokens: number;
  completionTokens: number;
  estimatedCost: number;
  timestamp: number;
}
