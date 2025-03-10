# AI Crypto Trading Platform

An automated cryptocurrency analysis platform that pulls hourly data for various cryptocurrencies, analyzes them using technical indicators, shortlists the best trading opportunities, and provides AI-powered trade recommendations with paper trading capabilities.

## Features

- **Automated Data Collection**: Fetches hourly price data for top cryptocurrencies
- **Technical Analysis**: Analyzes coins using various technical indicators (RSI, MACD, Bollinger Bands, etc.)
- **Trading Opportunity Shortlist**: Identifies and ranks the best trading opportunities
- **AI Trade Recommendations**: Provides target buy/sell prices and stop loss levels using AI
- **Interactive Charts**: Visualizes price data and trade recommendations
- **Auto-refresh**: Automatically updates data at regular intervals
- **Paper Trading**: Practice trading with virtual funds in a risk-free environment
- **Multi-Currency Support**: View prices and account balances in USD or INR

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Charts**: Chart.js with react-chartjs-2
- **UI Components**: Headless UI, Heroicons
- **API Integration**: Axios for data fetching
- **AI Integration**: OpenAI API
- **Crypto Data**: Binance API (free, no API key required)

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- OpenAI API key (for AI recommendations)
- Binance API key and secret (optional, for live trading)

### API Keys

#### OpenAI API Key

1. Visit [OpenAI](https://platform.openai.com/) and sign up for an account
2. Navigate to the API section and create a new API key

#### Binance API Key (Optional)

1. Create an account on [Binance](https://www.binance.com/)
2. Navigate to API Management and create a new API key
3. Ensure the API key has trading permissions if you plan to use live trading

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/ai-crypto-trading.git
   cd ai-crypto-trading
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env.local` file in the root directory and add your API keys:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_BINANCE_API_KEY=your_binance_api_key_here (optional)
   NEXT_PUBLIC_BINANCE_API_SECRET=your_binance_api_secret_here (optional)
   NEXT_PUBLIC_TRADING_MODE=paper
   ```

   You can also copy the provided template:

   ```bash
   cp .env.local.example .env.local
   ```

   Then edit the `.env.local` file with your API keys.

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage

1. **View Shortlisted Coins**: The homepage displays a list of cryptocurrencies that have been shortlisted for trading based on technical analysis.

2. **Detailed Analysis**: Click on any coin card to open a detailed view with price charts and AI-generated trade recommendations.

3. **Refresh Data**: Click the "Refresh Data" button to manually update the analysis, or enable auto-refresh to update every 5 minutes.

4. **Trade Recommendations**: For each selected coin, the AI will provide entry price, target price, stop loss, and risk/reward ratio.

5. **Paper Trading**: Use the paper trading account to practice trading strategies without risking real money. The paper trading account comes pre-loaded with virtual funds.

6. **Currency Selection**: Toggle between USD and INR to view prices and account balances in your preferred currency.

7. **Trade Execution**: Execute trades directly from the platform using either paper trading or live trading (if Binance API is configured).

## Paper Trading

The platform includes a paper trading feature that allows you to:

- Practice trading with $10,000 virtual USD and 10,000 USDT
- Execute trades based on AI recommendations
- Set stop loss and take profit levels
- Track your paper trading performance
- Experience realistic trading with simulated fees

For detailed instructions on using the paper trading feature, see the [Paper Trading Guide](PAPER_TRADING_GUIDE.md).

## Utility Scripts

The platform includes several utility scripts to help with testing and configuration:

### Paper Trading Test

Test the paper trading functionality with simulated trading scenarios:

```bash
npm run test:paper-trading
```

### Trading Mode Toggle

Switch between paper trading and live trading modes:

```bash
npm run toggle-trading-mode
```

For more information about available scripts, see the [Scripts README](scripts/README.md).

## Important Notes

- This platform is for educational and informational purposes only.
- Always do your own research before making any trading decisions.
- Cryptocurrency trading involves significant risk and may not be suitable for all investors.
- The AI recommendations are based on historical data and technical analysis, and are not guaranteed to be profitable.
- Paper trading results may differ from real trading due to market conditions, liquidity, and other factors.
- Binance API has rate limits. If you encounter issues, the application will use sample data.

## Customization

### Adding More Coins

To add more cryptocurrencies to the analysis, edit the `TOP_COINS` array in `src/lib/cryptoApi.ts`. Make sure to use valid Binance trading pairs (e.g., 'BTCUSDT').

### Adjusting Analysis Parameters

You can modify the technical analysis parameters in `src/lib/analysis.ts` to change how coins are evaluated and shortlisted.

### Changing the Auto-refresh Interval

The auto-refresh interval can be adjusted in the `useEffect` hook in `src/app/page.tsx`.

## Troubleshooting

### API Errors

- **Invalid symbol**: Make sure the trading pair exists on Binance.
- **429 Too Many Requests**: You've exceeded the rate limits for the Binance API. The application will use sample data in this case.
- **Network Error**: Check your internet connection.
- **Console is not a constructor**: This error may occur in certain Node.js environments when using the Binance API. The application is designed to handle this error automatically by:
  1. Only initializing the Binance client when in live trading mode
  2. Using dynamic imports to avoid constructor issues
  3. Falling back to a mock client if initialization fails
  4. If you still encounter this error, ensure you're in paper trading mode by setting `NEXT_PUBLIC_TRADING_MODE=paper` in your `.env.local` file

### Paper Trading Issues

- **Balance Discrepancies**: If you notice any issues with your paper trading balance, refresh the page to reset the account.
- **Trades Not Executing**: Ensure you have sufficient balance in your paper trading account.
- **Stop Loss/Take Profit Not Triggering**: The system checks prices periodically, so there might be a slight delay in execution.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Binance API](https://binance-docs.github.io/apidocs/) for cryptocurrency data
- [OpenAI](https://openai.com/) for AI-powered trade recommendations
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
