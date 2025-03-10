import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { WatchlistProvider, useWatchlist } from '../WatchlistContext';
import { DEFAULT_WATCHLIST } from '@/lib/cryptoApi';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component that uses the watchlist context
function TestComponent() {
  const { watchlist, addToWatchlist, removeFromWatchlist, isInWatchlist } =
    useWatchlist();

  return (
    <div>
      <ul data-testid="watchlist">
        {watchlist.map((coin) => (
          <li key={coin} data-testid={`watchlist-item-${coin}`}>
            {coin}
            <button onClick={() => removeFromWatchlist(coin)}>Remove</button>
          </li>
        ))}
      </ul>
      <button onClick={() => addToWatchlist('DOGEUSDT')}>Add DOGE</button>
      <div data-testid="is-btc-in-watchlist">
        {isInWatchlist('BTCUSDT') ? 'Yes' : 'No'}
      </div>
    </div>
  );
}

describe('WatchlistContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize with default watchlist when localStorage is empty', () => {
    render(
      <WatchlistProvider>
        <TestComponent />
      </WatchlistProvider>
    );

    // Wait for useEffect to run
    act(() => {
      jest.runAllTimers();
    });

    const watchlistItems = screen.getAllByTestId(/watchlist-item/);
    expect(watchlistItems.length).toBe(DEFAULT_WATCHLIST.length);

    // Check if default coins are in the watchlist
    DEFAULT_WATCHLIST.forEach((coin) => {
      expect(screen.getByTestId(`watchlist-item-${coin}`)).toBeInTheDocument();
    });
  });

  it('should add a coin to the watchlist', () => {
    render(
      <WatchlistProvider>
        <TestComponent />
      </WatchlistProvider>
    );

    // Add DOGE to watchlist
    fireEvent.click(screen.getByText('Add DOGE'));

    // Check if DOGE is added
    expect(screen.getByTestId('watchlist-item-DOGEUSDT')).toBeInTheDocument();
  });

  it('should remove a coin from the watchlist', () => {
    render(
      <WatchlistProvider>
        <TestComponent />
      </WatchlistProvider>
    );

    // Remove BTC from watchlist
    const btcItem = screen.getByTestId('watchlist-item-BTCUSDT');
    const removeButton = within(btcItem).getByText('Remove');
    fireEvent.click(removeButton);

    // Check if BTC is removed
    expect(
      screen.queryByTestId('watchlist-item-BTCUSDT')
    ).not.toBeInTheDocument();
  });

  it('should check if a coin is in the watchlist', () => {
    render(
      <WatchlistProvider>
        <TestComponent />
      </WatchlistProvider>
    );

    // BTC should be in the watchlist by default
    expect(screen.getByTestId('is-btc-in-watchlist')).toHaveTextContent('Yes');

    // Remove BTC from watchlist
    const btcItem = screen.getByTestId('watchlist-item-BTCUSDT');
    const removeButton = within(btcItem).getByText('Remove');
    fireEvent.click(removeButton);

    // BTC should not be in the watchlist anymore
    expect(screen.getByTestId('is-btc-in-watchlist')).toHaveTextContent('No');
  });

  it('should load watchlist from localStorage', () => {
    // Set up localStorage with a custom watchlist
    const customWatchlist = ['XRPUSDT', 'ADAUSDT', 'DOGEUSDT'];
    window.localStorage.setItem('watchlist', JSON.stringify(customWatchlist));

    render(
      <WatchlistProvider>
        <TestComponent />
      </WatchlistProvider>
    );

    // Wait for useEffect to run
    act(() => {
      jest.runAllTimers();
    });

    // Check if custom watchlist is loaded
    customWatchlist.forEach((coin) => {
      expect(screen.getByTestId(`watchlist-item-${coin}`)).toBeInTheDocument();
    });

    // Default coins that are not in the custom watchlist should not be present
    DEFAULT_WATCHLIST.forEach((coin) => {
      if (!customWatchlist.includes(coin)) {
        expect(
          screen.queryByTestId(`watchlist-item-${coin}`)
        ).not.toBeInTheDocument();
      }
    });
  });
});
