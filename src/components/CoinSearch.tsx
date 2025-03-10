'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { fetchAllCoins, COIN_NAMES } from '@/lib/cryptoApi';
import { useWatchlist } from '@/contexts/WatchlistContext';

export default function CoinSearch() {
  const [allCoins, setAllCoins] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCoins, setFilteredCoins] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { addToWatchlist, isInWatchlist, watchlist } = useWatchlist();

  // Fetch all available coins on mount
  useEffect(() => {
    const loadCoins = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const coins = await fetchAllCoins();
        setAllCoins(coins);
      } catch (error) {
        console.error('Error loading coins:', error);
        setError('Failed to load coins. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadCoins();
  }, []);

  // Memoize the filtering function to prevent unnecessary re-renders
  const filterCoins = useCallback(() => {
    if (searchTerm.trim() === '') {
      setFilteredCoins([]);
      return;
    }

    const term = searchTerm.toUpperCase();
    const filtered = allCoins
      .filter((coin) => {
        // Don't show coins already in watchlist
        if (isInWatchlist(coin)) return false;

        // Match by symbol or name
        const symbol = coin.replace('USDT', '');
        const name = COIN_NAMES[symbol] || '';
        return (
          coin.includes(term) ||
          symbol.includes(term) ||
          name.toUpperCase().includes(term)
        );
      })
      .slice(0, 20); // Limit to 20 results for performance

    setFilteredCoins(filtered);
  }, [searchTerm, allCoins, isInWatchlist]);

  // Filter coins based on search term
  useEffect(() => {
    filterCoins();
  }, [filterCoins, watchlist]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  // Handle adding a coin to watchlist
  const handleAddCoin = (coin: string) => {
    addToWatchlist(coin);
    setSearchTerm('');
    setIsDropdownOpen(false);
  };

  // Get coin name from symbol
  const getCoinName = (symbol: string) => {
    const baseSymbol = symbol.replace('USDT', '');
    return COIN_NAMES[baseSymbol] || baseSymbol;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search for coins..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => setIsDropdownOpen(true)}
        />
      </div>

      {isDropdownOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto max-h-60">
          {isLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Loading coins...
            </div>
          ) : error ? (
            <div className="px-4 py-2 text-sm text-red-500">{error}</div>
          ) : filteredCoins.length > 0 ? (
            filteredCoins.map((coin) => (
              <div
                key={coin}
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleAddCoin(coin)}
                data-testid={`add-coin-${coin}`}
              >
                <div className="flex items-center">
                  <span className="font-medium">
                    {coin.replace('USDT', '')}
                  </span>
                  <span className="ml-2 text-sm text-gray-500">
                    {getCoinName(coin)}
                  </span>
                </div>
                <button
                  className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:text-gray-500"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddCoin(coin);
                  }}
                  aria-label={`Add ${coin} to watchlist`}
                >
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))
          ) : searchTerm.trim() !== '' ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No coins found
            </div>
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              Type to search for coins
            </div>
          )}
        </div>
      )}
    </div>
  );
}
