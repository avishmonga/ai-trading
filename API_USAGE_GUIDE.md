# AI Provider Integration Guide

This guide explains how to use both OpenAI and Google Gemini APIs in the AI Crypto Trading application, including tips for optimizing costs.

## Setting Up API Keys

### OpenAI API Key

1. Create an account at [OpenAI](https://platform.openai.com/) if you don't have one already
2. Navigate to the [API Keys section](https://platform.openai.com/api-keys)
3. Create a new API key
4. Copy the API key and add it to your `.env.local` file:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

### Google Gemini API Key

1. Create a Google Cloud account if you don't have one already
2. Go to the [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Create a new API key
4. Copy the API key and add it to your `.env.local` file:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

## Cost Optimization for OpenAI API

OpenAI's API pricing is based on the model used and the number of tokens processed. Here are some tips to optimize costs:

### Model Selection

The application uses GPT-3.5 Turbo by default, which is significantly cheaper than GPT-4:

| Model         | Input Cost (per 1K tokens) | Output Cost (per 1K tokens) |
| ------------- | -------------------------- | --------------------------- |
| GPT-3.5 Turbo | $0.0005                    | $0.0015                     |
| GPT-4         | $0.03                      | $0.06                       |
| GPT-4 Turbo   | $0.01                      | $0.03                       |

### Token Usage Optimization

1. **Limit Historical Data**: The application already limits historical data to 24 hours to reduce token usage.

2. **Monitor Usage**: OpenAI provides a usage dashboard where you can monitor your API usage.

3. **Set Usage Limits**: Set hard limits on your OpenAI account to prevent unexpected charges.

4. **Caching**: Consider implementing caching for frequent requests with similar inputs.

5. **Batch Processing**: If analyzing multiple coins, consider batching requests.

## Comparing OpenAI and Gemini

### Cost Comparison

- **OpenAI GPT-3.5 Turbo**: Approximately $0.001-$0.002 per trading recommendation
- **Google Gemini 1.5 Pro**: Generally cheaper than OpenAI, with a more generous free tier

### Performance Comparison

- **OpenAI GPT-3.5 Turbo**: Good for general trading recommendations
- **Google Gemini 1.5 Pro**: Comparable performance to GPT-3.5 Turbo
- **OpenAI GPT-4**: Highest accuracy but significantly more expensive

### When to Use Each Provider

- **Use Gemini** for:

  - Regular, frequent analysis
  - When working within a tight budget
  - When you have a high volume of requests

- **Use OpenAI** for:
  - More complex market conditions
  - When you need the highest accuracy (GPT-4)
  - When you need more consistent formatting in responses

## Implementation Details

The application allows switching between providers through the UI. The selected provider is passed to the API, which then uses the appropriate service to generate recommendations.

### Code Structure

- `src/lib/aiService.ts`: Contains the implementation for both providers
- `src/components/AIProviderSelector.tsx`: UI component for selecting the provider
- `src/app/api/ai/route.ts`: API route that handles the provider selection

## Monitoring and Debugging

The application includes utility functions to estimate token usage and costs:

```typescript
// Estimate token count
const promptTokens = estimateTokenCount(prompt);
console.log(`Estimated prompt tokens: ${promptTokens}`);

// Estimate cost
const cost = estimateOpenAICost('gpt-3.5-turbo', promptTokens, 200);
console.log(`Estimated cost: $${cost.toFixed(6)}`);
```

## Best Practices

1. **Start with Gemini**: Use Gemini for development and testing due to its lower cost.

2. **Implement Fallback**: The application automatically falls back to default values if both APIs fail.

3. **Rate Limiting**: Implement rate limiting to prevent accidental overuse.

4. **Validate Responses**: Always validate AI responses before using them for trading decisions.

5. **Keep Models Updated**: Periodically check for new model versions and pricing changes.

Remember that AI recommendations should be used as one of many inputs for trading decisions, not as the sole basis for trades.

## Troubleshooting Common API Issues

### API Key Issues

1. **Invalid API Key**: Ensure your API keys are correctly copied from the respective platforms without any extra spaces or characters.

2. **API Key Not Set**: Make sure you've created a `.env.local` file (not just `.env.local.example`) with your actual API keys.

3. **Rate Limiting**: Both OpenAI and Gemini have rate limits. If you're making too many requests in a short period, you might hit these limits.

### Response Parsing Issues

1. **Invalid JSON**: Sometimes the AI might not return properly formatted JSON. The application has been updated to handle this better, but if you're still seeing issues, try:

   - Switching to a different provider
   - Simplifying your request
   - Checking the console logs for the actual response

2. **Missing Fields**: If the AI response is missing required fields, the application will now provide a more detailed error message.

### Network Issues

1. **CORS Errors**: If you're running the application locally and seeing CORS errors, make sure you're using the correct API endpoints and that your API keys have the necessary permissions.

2. **Timeouts**: For large requests or during high traffic periods, API calls might time out. The application includes fallback mechanisms to handle this.

### Debugging Tips

1. **Check Console Logs**: The application now logs detailed information about API responses and errors to the console.

2. **Use Sample Data**: If you're having persistent issues with the APIs, you can use the "Use Sample Data" button to test the application without making actual API calls.

3. **Verify API Status**: Check the status pages for [OpenAI](https://status.openai.com/) and [Google AI](https://status.cloud.google.com/) to ensure the services are operational.

4. **Test API Keys Separately**: You can test your API keys using simple curl commands or tools like Postman before using them in the application.

## Next Steps for Optimization

1. **Implement Caching**: To reduce API calls and costs, consider implementing a caching layer for frequent requests.

2. **Add Retry Logic**: For transient errors, implement retry logic with exponential backoff.

3. **Implement Request Batching**: If analyzing multiple coins, batch requests to reduce API calls.

4. **Monitor Usage**: Implement a usage tracking system to monitor API costs over time.

Remember that AI recommendations should be used as one of many inputs for trading decisions, not as the sole basis for trades.
