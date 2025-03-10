/**
 * Trading Mode Toggle Script
 *
 * This script toggles between paper trading and live trading modes by updating
 * the .env.local file. It's a simple utility to help users switch between
 * testing with paper trading and executing real trades.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ENV_FILE_PATH = path.join(process.cwd(), '.env.local');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

/**
 * Reads the current .env.local file
 * @returns {Object} An object containing the current environment variables
 */
function readEnvFile() {
  try {
    if (!fs.existsSync(ENV_FILE_PATH)) {
      return {};
    }

    const fileContent = fs.readFileSync(ENV_FILE_PATH, 'utf8');
    const envVars = {};

    fileContent.split('\n').forEach((line) => {
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });

    return envVars;
  } catch (error) {
    console.error('Error reading .env.local file:', error.message);
    return {};
  }
}

/**
 * Writes environment variables to the .env.local file
 * @param {Object} envVars - The environment variables to write
 */
function writeEnvFile(envVars) {
  try {
    const fileContent = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    fs.writeFileSync(ENV_FILE_PATH, fileContent);
    console.log('.env.local file updated successfully.');
  } catch (error) {
    console.error('Error writing .env.local file:', error.message);
  }
}

/**
 * Gets the current trading mode from environment variables
 * @param {Object} envVars - The current environment variables
 * @returns {string} The current trading mode ('paper' or 'live')
 */
function getCurrentTradingMode(envVars) {
  return envVars.NEXT_PUBLIC_TRADING_MODE === 'live' ? 'live' : 'paper';
}

/**
 * Toggles the trading mode between paper and live
 */
function toggleTradingMode() {
  const envVars = readEnvFile();
  const currentMode = getCurrentTradingMode(envVars);
  const newMode = currentMode === 'live' ? 'paper' : 'live';

  console.log(`Current trading mode: ${currentMode}`);

  if (newMode === 'live') {
    // Check if Binance API keys are set
    if (
      !envVars.NEXT_PUBLIC_BINANCE_API_KEY ||
      !envVars.NEXT_PUBLIC_BINANCE_API_SECRET
    ) {
      console.log(
        '\n⚠️  WARNING: Binance API keys are not set in your .env.local file.'
      );
      console.log('Live trading requires valid Binance API keys.');

      rl.question(
        '\nDo you want to enter your Binance API keys now? (y/n): ',
        (answer) => {
          if (answer.toLowerCase() === 'y') {
            rl.question('Enter your Binance API key: ', (apiKey) => {
              rl.question('Enter your Binance API secret: ', (apiSecret) => {
                envVars.NEXT_PUBLIC_BINANCE_API_KEY = apiKey;
                envVars.NEXT_PUBLIC_BINANCE_API_SECRET = apiSecret;
                envVars.NEXT_PUBLIC_TRADING_MODE = 'live';

                writeEnvFile(envVars);
                console.log('\n✅ Trading mode switched to LIVE.');
                console.log(
                  '⚠️  CAUTION: The application will now execute real trades with real funds.'
                );
                rl.close();
              });
            });
          } else {
            console.log(
              '\n❌ Trading mode switch cancelled. Remaining in PAPER trading mode.'
            );
            rl.close();
          }
        }
      );
    } else {
      // Confirm live trading mode
      rl.question(
        '\n⚠️  WARNING: Switching to LIVE trading will execute real trades with real funds.\nAre you sure you want to continue? (y/n): ',
        (answer) => {
          if (answer.toLowerCase() === 'y') {
            envVars.NEXT_PUBLIC_TRADING_MODE = 'live';
            writeEnvFile(envVars);
            console.log('\n✅ Trading mode switched to LIVE.');
            console.log(
              '⚠️  CAUTION: The application will now execute real trades with real funds.'
            );
          } else {
            console.log(
              '\n❌ Trading mode switch cancelled. Remaining in PAPER trading mode.'
            );
          }
          rl.close();
        }
      );
    }
  } else {
    // Switch to paper trading mode
    envVars.NEXT_PUBLIC_TRADING_MODE = 'paper';
    writeEnvFile(envVars);
    console.log('\n✅ Trading mode switched to PAPER.');
    console.log('You can now practice trading with virtual funds.');
    rl.close();
  }
}

// Start the script
console.log('=== Trading Mode Toggle ===');
toggleTradingMode();
