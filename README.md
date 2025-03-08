# AI Crypto Trading Platform

An automated cryptocurrency analysis platform that pulls hourly data for various cryptocurrencies, analyzes them using technical indicators, shortlists the best trading opportunities, and provides AI-powered trade recommendations.

## Features

- **Automated Data Collection**: Fetches hourly price data for top cryptocurrencies
- **Technical Analysis**: Analyzes coins using various technical indicators (RSI, MACD, Bollinger Bands, etc.)
- **Trading Opportunity Shortlist**: Identifies and ranks the best trading opportunities
- **AI Trade Recommendations**: Provides target buy/sell prices and stop loss levels using AI
- **Interactive Charts**: Visualizes price data and trade recommendations
- **Auto-refresh**: Automatically updates data at regular intervals

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

### API Keys

#### OpenAI API Key

1. Visit [OpenAI](https://platform.openai.com/) and sign up for an account
2. Navigate to the API section and create a new API key

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

3. Create a `.env.local` file in the root directory and add your OpenAI API key:

   ```
   OPENAI_API_KEY=your_openai_api_key_here
   ```

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

## Important Notes

- This platform is for educational and informational purposes only.
- Always do your own research before making any trading decisions.
- Cryptocurrency trading involves significant risk and may not be suitable for all investors.
- The AI recommendations are based on historical data and technical analysis, and are not guaranteed to be profitable.
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

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Binance API](https://binance-docs.github.io/apidocs/) for cryptocurrency data
- [OpenAI](https://openai.com/) for AI-powered trade recommendations
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
