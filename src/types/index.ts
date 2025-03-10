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

export enum Currency {
  USD = 'USD',
  INR = 'INR',
}

export enum OrderType {
  Buy = 'buy',
  Sell = 'sell',
}

export enum OrderStatus {
  Pending = 'pending',
  Executed = 'executed',
  Failed = 'failed',
  Cancelled = 'cancelled',
  PartiallyFilled = 'partially_filled',
}

export interface TradeFee {
  amount: number;
  asset: string;
  rate: number;
}

export interface TradeOrder {
  symbol: string;
  type: OrderType;
  price: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  budget: number;
  currency: Currency;
  useBnbForFees?: boolean;
}

export interface TradeExecution {
  orderId: string;
  symbol: string;
  type: OrderType;
  price: number;
  quantity: number;
  status: OrderStatus;
  timestamp: number;
  stopLoss: number;
  takeProfit: number;
  budget: number;
  currency: Currency;
  message: string;
  fee?: TradeFee;
  currentPnL?: number;
  currentPnLPercentage?: number;
  pnl?: number;
  pnlPercentage?: number;
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

export interface UserSettings {
  defaultCurrency: Currency;
  defaultBudget: number;
  defaultAIProvider: AIProvider;
  useBnbForFees: boolean;
  apiKey?: string;
  apiSecret?: string;
}

export interface TradeHistory {
  trades: TradeExecution[];
  totalProfit: number;
  totalLoss: number;
  totalFees: number;
  winRate: number;
  currency: Currency;
}

export interface DepositWithdrawalHistory {
  deposits: DepositRecord[];
  withdrawals: WithdrawalRecord[];
  totalDeposited: number;
  totalWithdrawn: number;
  currency: Currency;
}

export interface DepositRecord {
  id: string;
  asset: string;
  amount: number;
  timestamp: number;
  currency: Currency;
}

export interface WithdrawalRecord {
  id: string;
  asset: string;
  amount: number;
  timestamp: number;
  currency: Currency;
}

export interface PaperTradingAccount {
  balances: Record<string, number>;
  prices: Record<string, number>;
  activeTrades: TradeExecution[];
  tradeHistory: TradeExecution[];
  deposits: DepositRecord[];
  withdrawals: WithdrawalRecord[];
  totalValueUSD: number;
  totalProfitLoss: number;
}
