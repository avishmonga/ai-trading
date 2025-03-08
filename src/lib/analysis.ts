import { HistoricalData, CoinAnalysis } from '../types';

/**
 * Calculate technical indicators from historical data
 */
function calculateIndicators(data: HistoricalData[]) {
  if (data.length < 24) {
    throw new Error('Insufficient data for analysis');
  }

  // Calculate Simple Moving Averages (SMA)
  const sma5 = calculateSMA(data, 5);
  const sma10 = calculateSMA(data, 10);
  const sma20 = calculateSMA(data, 20);

  // Calculate Relative Strength Index (RSI)
  const rsi = calculateRSI(data, 14);

  // Calculate MACD
  const macd = calculateMACD(data);

  // Calculate Bollinger Bands
  const bollingerBands = calculateBollingerBands(data, 20, 2);

  // Calculate Average True Range (ATR) for volatility
  const atr = calculateATR(data, 14);

  return {
    sma5,
    sma10,
    sma20,
    rsi,
    macd,
    bollingerBands,
    atr,
  };
}

/**
 * Calculate Simple Moving Average
 */
function calculateSMA(data: HistoricalData[], period: number): number {
  if (data.length < period) {
    return 0;
  }

  const prices = data.slice(-period).map((candle) => candle.close);
  return prices.reduce((sum, price) => sum + price, 0) / period;
}

/**
 * Calculate Relative Strength Index
 */
function calculateRSI(data: HistoricalData[], period: number): number {
  if (data.length <= period) {
    return 50; // Default neutral value
  }

  let gains = 0;
  let losses = 0;

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change =
      data[data.length - period - 1 + i].close -
      data[data.length - period - 1 + i - 1].close;
    if (change >= 0) {
      gains += change;
    } else {
      losses -= change;
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  // Calculate RSI using Wilder's smoothing method
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    let currentGain = 0;
    let currentLoss = 0;

    if (change >= 0) {
      currentGain = change;
    } else {
      currentLoss = -change;
    }

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
  }

  if (avgLoss === 0) {
    return 100;
  }

  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

/**
 * Calculate Moving Average Convergence Divergence
 */
function calculateMACD(data: HistoricalData[]): {
  macd: number;
  signal: number;
  histogram: number;
} {
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  const macd = ema12 - ema26;

  // Calculate signal line (9-day EMA of MACD)
  // For simplicity, we're using a simple approximation
  const signal = macd * 0.2 + macd * 0.8; // Simplified EMA calculation
  const histogram = macd - signal;

  return { macd, signal, histogram };
}

/**
 * Calculate Exponential Moving Average
 */
function calculateEMA(data: HistoricalData[], period: number): number {
  if (data.length < period) {
    return 0;
  }

  const prices = data.map((candle) => candle.close);
  const k = 2 / (period + 1);

  // Start with SMA
  let ema =
    prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;

  // Calculate EMA
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return ema;
}

/**
 * Calculate Bollinger Bands
 */
function calculateBollingerBands(
  data: HistoricalData[],
  period: number,
  multiplier: number
) {
  const sma = calculateSMA(data, period);

  // Calculate standard deviation
  const prices = data.slice(-period).map((candle) => candle.close);
  const squaredDifferences = prices.map((price) => Math.pow(price - sma, 2));
  const variance =
    squaredDifferences.reduce((sum, val) => sum + val, 0) / period;
  const stdDev = Math.sqrt(variance);

  const upperBand = sma + stdDev * multiplier;
  const lowerBand = sma - stdDev * multiplier;

  return { middle: sma, upper: upperBand, lower: lowerBand };
}

/**
 * Calculate Average True Range
 */
function calculateATR(data: HistoricalData[], period: number): number {
  if (data.length < period + 1) {
    return 0;
  }

  const trValues = [];

  for (let i = 1; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevClose = data[i - 1].close;

    const tr1 = high - low;
    const tr2 = Math.abs(high - prevClose);
    const tr3 = Math.abs(low - prevClose);

    const tr = Math.max(tr1, tr2, tr3);
    trValues.push(tr);
  }

  // Calculate simple average of TR values for the period
  const atr = trValues.slice(-period).reduce((sum, tr) => sum + tr, 0) / period;
  return atr;
}

/**
 * Analyze a coin based on its historical data
 */
export function analyzeCoin(
  symbol: string,
  data: HistoricalData[]
): CoinAnalysis {
  try {
    const indicators = calculateIndicators(data);
    const latestPrice = data[data.length - 1].close;

    // Trend analysis
    let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (indicators.sma5 > indicators.sma20 && indicators.macd.histogram > 0) {
      trend = 'bullish';
    } else if (
      indicators.sma5 < indicators.sma20 &&
      indicators.macd.histogram < 0
    ) {
      trend = 'bearish';
    }

    // Volatility analysis
    let volatility: 'high' | 'medium' | 'low' = 'medium';
    const volatilityRatio = indicators.atr / latestPrice;
    if (volatilityRatio > 0.03) {
      volatility = 'high';
    } else if (volatilityRatio < 0.01) {
      volatility = 'low';
    }

    // Trading recommendation
    let recommendation: 'buy' | 'sell' | 'hold' = 'hold';
    let score = 50; // Neutral score

    // RSI conditions
    if (indicators.rsi < 30) {
      score += 15; // Oversold
    } else if (indicators.rsi > 70) {
      score -= 15; // Overbought
    }

    // MACD conditions
    if (indicators.macd.histogram > 0 && indicators.macd.macd > 0) {
      score += 10; // Bullish momentum
    } else if (indicators.macd.histogram < 0 && indicators.macd.macd < 0) {
      score -= 10; // Bearish momentum
    }

    // Bollinger Bands conditions
    if (latestPrice < indicators.bollingerBands.lower) {
      score += 10; // Price below lower band (potential bounce)
    } else if (latestPrice > indicators.bollingerBands.upper) {
      score -= 10; // Price above upper band (potential reversal)
    }

    // Moving Average conditions
    if (
      indicators.sma5 > indicators.sma10 &&
      indicators.sma10 > indicators.sma20
    ) {
      score += 15; // Strong uptrend
    } else if (
      indicators.sma5 < indicators.sma10 &&
      indicators.sma10 < indicators.sma20
    ) {
      score -= 15; // Strong downtrend
    }

    // Determine final recommendation
    if (score >= 65) {
      recommendation = 'buy';
    } else if (score <= 35) {
      recommendation = 'sell';
    }

    return {
      symbol,
      score,
      trend,
      volatility,
      recommendation,
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error(`Error analyzing ${symbol}:`, error);
    return {
      symbol,
      score: 50,
      trend: 'neutral',
      volatility: 'medium',
      recommendation: 'hold',
      lastUpdated: Date.now(),
    };
  }
}

/**
 * Shortlist coins for trading based on their analysis
 */
export function shortlistCoins(analyses: CoinAnalysis[]): CoinAnalysis[] {
  return analyses
    .filter((analysis) => {
      // Filter coins with strong buy or sell signals
      return analysis.score >= 65 || analysis.score <= 35;
    })
    .sort((a, b) => {
      // Sort by absolute distance from neutral score (50)
      const distanceA = Math.abs(a.score - 50);
      const distanceB = Math.abs(b.score - 50);
      return distanceB - distanceA;
    });
}
