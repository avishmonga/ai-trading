import OpenAI from 'openai';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from '@google/generative-ai';
import {
  AIAnalysisRequest,
  HistoricalData,
  TradeRecommendation,
  AIProvider,
} from '../types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate a trading recommendation using AI
 */
export async function generateTradeRecommendation(
  request: AIAnalysisRequest
): Promise<TradeRecommendation> {
  try {
    // Format historical data for the prompt
    const formattedData = formatHistoricalData(request.historicalData);

    // Create a prompt for the AI
    const prompt = createAnalysisPrompt(
      request.symbol,
      formattedData,
      request.currentPrice
    );

    // Use the specified AI provider or default to OpenAI
    const provider = request.provider || AIProvider.OpenAI;

    let parsedResponse;

    if (provider === AIProvider.Gemini) {
      parsedResponse = await getGeminiAnalysis(prompt);
    } else {
      parsedResponse = await getOpenAIAnalysis(prompt);
    }

    return {
      symbol: request.symbol,
      entryPrice: parsedResponse.entryPrice,
      targetPrice: parsedResponse.targetPrice,
      stopLoss: parsedResponse.stopLoss,
      riskRewardRatio: parsedResponse.riskRewardRatio,
      confidence: parsedResponse.confidence,
      reasoning: parsedResponse.reasoning,
      timestamp: Date.now(),
      provider: provider, // Include which provider was used
    };
  } catch (error) {
    console.error('Error generating AI recommendation:', error);

    // Return a fallback recommendation
    return {
      symbol: request.symbol,
      entryPrice: request.currentPrice,
      targetPrice: request.currentPrice * 1.05, // Default 5% target
      stopLoss: request.currentPrice * 0.95, // Default 5% stop loss
      riskRewardRatio: 1,
      confidence: 0.5,
      reasoning: 'Failed to generate AI recommendation. Using default values.',
      timestamp: Date.now(),
      provider: request.provider || AIProvider.OpenAI,
    };
  }
}

/**
 * Use OpenAI for analysis
 */
async function getOpenAIAnalysis(prompt: string) {
  try {
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Using gpt-3.5-turbo for cost efficiency, can be configured to use gpt-4 for higher accuracy
      messages: [
        {
          role: 'system',
          content:
            'You are an expert crypto trading analyst. Analyze the provided data and give precise trading recommendations including entry price, target price, stop loss, and risk-reward ratio. Provide a brief reasoning for your recommendation.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    });

    // Parse the response
    const content = response.choices[0]?.message?.content || '';
    console.log('OpenAI response:', content);

    if (!content) {
      throw new Error('Empty response from OpenAI');
    }

    try {
      const parsedJson = JSON.parse(content);

      // Validate the required fields
      const requiredFields = [
        'recommendation',
        'entryPrice',
        'targetPrice',
        'stopLoss',
        'riskRewardRatio',
        'confidence',
        'reasoning',
      ];
      for (const field of requiredFields) {
        if (parsedJson[field] === undefined) {
          throw new Error(
            `Missing required field in OpenAI response: ${field}`
          );
        }
      }

      return parsedJson as {
        recommendation: string;
        entryPrice: number;
        targetPrice: number;
        stopLoss: number;
        riskRewardRatio: number;
        confidence: number;
        reasoning: string;
      };
    } catch (parseError) {
      console.error('Error parsing OpenAI JSON response:', parseError);
      throw new Error(
        `Failed to parse OpenAI JSON response: ${
          parseError instanceof Error ? parseError.message : 'Unknown error'
        }`
      );
    }
  } catch (error) {
    console.error('Error in OpenAI analysis:', error);
    throw new Error(
      `OpenAI API error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Use Gemini for analysis
 */
async function getGeminiAnalysis(prompt: string) {
  try {
    // Configure the model
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    // Create the system prompt and user prompt
    const systemPrompt =
      'You are an expert crypto trading analyst. Analyze the provided data and give precise trading recommendations including entry price, target price, stop loss, and risk-reward ratio. Provide a brief reasoning for your recommendation. Return your response as a valid JSON object with the following structure exactly: {"recommendation": "buy/sell/hold", "entryPrice": number, "targetPrice": number, "stopLoss": number, "riskRewardRatio": number, "confidence": number, "reasoning": "string"}';
    const fullPrompt = `${systemPrompt}\n\n${prompt}`;

    // Generate content
    const result = await model.generateContent(fullPrompt);
    const response = result.response;
    const text = response.text();

    console.log('Gemini response:', text);

    // Extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error(
        'Failed to extract JSON from Gemini response: ' +
          text.substring(0, 100) +
          '...'
      );
    }

    try {
      const parsedJson = JSON.parse(jsonMatch[0]);

      // Validate the required fields
      const requiredFields = [
        'recommendation',
        'entryPrice',
        'targetPrice',
        'stopLoss',
        'riskRewardRatio',
        'confidence',
        'reasoning',
      ];
      for (const field of requiredFields) {
        if (parsedJson[field] === undefined) {
          throw new Error(
            `Missing required field in Gemini response: ${field}`
          );
        }
      }

      return parsedJson as {
        recommendation: string;
        entryPrice: number;
        targetPrice: number;
        stopLoss: number;
        riskRewardRatio: number;
        confidence: number;
        reasoning: string;
      };
    } catch (parseError) {
      console.error('Error parsing Gemini JSON response:', parseError);
      throw new Error(
        `Failed to parse Gemini JSON response: ${
          parseError instanceof Error ? parseError.message : 'Unknown error'
        }`
      );
    }
  } catch (error) {
    console.error('Error in Gemini analysis:', error);
    throw new Error(
      `Gemini API error: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}

/**
 * Format historical data for the AI prompt
 */
function formatHistoricalData(data: HistoricalData[]): string {
  // Limit the amount of data to avoid token limits
  const limitedData = data.slice(-24); // Last 24 hours

  return limitedData
    .map(
      (candle, index) =>
        `Hour ${index + 1}: Open: $${candle.open.toFixed(
          2
        )}, High: $${candle.high.toFixed(2)}, Low: $${candle.low.toFixed(
          2
        )}, Close: $${candle.close.toFixed(2)}, Volume: ${candle.volume.toFixed(
          2
        )}`
    )
    .join('\n');
}

/**
 * Create a prompt for the AI analysis
 */
function createAnalysisPrompt(
  symbol: string,
  formattedData: string,
  currentPrice: number
): string {
  return `
Analyze the following 24-hour historical data for ${symbol} and provide a trading recommendation for intraday trading.
Current price: $${currentPrice.toFixed(2)}

Historical Data:
${formattedData}

Based on this data, provide a JSON response with the following structure:
{
  "recommendation": "buy" or "sell" or "hold",
  "entryPrice": number,
  "targetPrice": number,
  "stopLoss": number,
  "riskRewardRatio": number,
  "confidence": number between 0 and 1,
  "reasoning": "brief explanation"
}

Focus on intraday trading opportunities only. The recommendation should be actionable within the same trading day.
`;
}

/**
 * Get the estimated cost for an OpenAI API call based on the model and token count
 * This is useful for monitoring and optimizing API usage costs
 */
export function estimateOpenAICost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const pricing = {
    'gpt-3.5-turbo': {
      input: 0.0005, // $0.0005 per 1K input tokens
      output: 0.0015, // $0.0015 per 1K output tokens
    },
    'gpt-4': {
      input: 0.03, // $0.03 per 1K input tokens
      output: 0.06, // $0.06 per 1K output tokens
    },
    'gpt-4-turbo': {
      input: 0.01, // $0.01 per 1K input tokens
      output: 0.03, // $0.03 per 1K output tokens
    },
  };

  const modelPricing =
    pricing[model as keyof typeof pricing] || pricing['gpt-3.5-turbo'];

  const inputCost = (promptTokens / 1000) * modelPricing.input;
  const outputCost = (completionTokens / 1000) * modelPricing.output;

  return inputCost + outputCost;
}

/**
 * Get the estimated token count for a text string
 * This is a rough estimate - actual token count may vary
 */
export function estimateTokenCount(text: string): number {
  // A rough estimate: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}
