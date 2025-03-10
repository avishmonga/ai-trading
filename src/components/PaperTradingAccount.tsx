'use client';

import React, { useState, useEffect } from 'react';
import { Currency } from '@/types';
import {
  getPaperTradingAccount,
  depositToPaperTrading,
  withdrawFromPaperTrading,
} from '@/lib/paperTradingService';
import { convertCurrency } from '@/lib/tradeExecutionService';

interface PaperTradingAccountProps {
  selectedCurrency: Currency;
}

export default function PaperTradingAccount({
  selectedCurrency,
}: PaperTradingAccountProps) {
  const [account, setAccount] = useState(getPaperTradingAccount());
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositAsset, setDepositAsset] = useState<string>('USDT');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawAsset, setWithdrawAsset] = useState<string>('USDT');
  const [isDepositing, setIsDepositing] = useState<boolean>(false);
  const [isWithdrawing, setIsWithdrawing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Refresh account data every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAccount(getPaperTradingAccount());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Format currency based on selected currency
  const formatCurrency = (value: number) => {
    const currencySymbol = selectedCurrency === Currency.USD ? '$' : '₹';
    const convertedValue =
      selectedCurrency === Currency.INR
        ? convertCurrency(value, 'USD', 'INR')
        : value;

    return `${currencySymbol}${convertedValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Handle deposit
  const handleDeposit = () => {
    setIsDepositing(true);
    setError(null);
    setSuccess(null);

    try {
      if (depositAmount <= 0) {
        throw new Error('Deposit amount must be greater than zero');
      }

      depositToPaperTrading(depositAsset, depositAmount, selectedCurrency);
      setAccount(getPaperTradingAccount());
      setSuccess(`Successfully deposited ${depositAmount} ${depositAsset}`);
      setDepositAmount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deposit funds');
    } finally {
      setIsDepositing(false);
    }
  };

  // Handle withdrawal
  const handleWithdraw = () => {
    setIsWithdrawing(true);
    setError(null);
    setSuccess(null);

    try {
      if (withdrawAmount <= 0) {
        throw new Error('Withdrawal amount must be greater than zero');
      }

      withdrawFromPaperTrading(withdrawAsset, withdrawAmount, selectedCurrency);
      setAccount(getPaperTradingAccount());
      setSuccess(`Successfully withdrew ${withdrawAmount} ${withdrawAsset}`);
      setWithdrawAmount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw funds');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Paper Trading Account
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Account Summary */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">
            Account Summary
          </h4>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total Value:</span>
              <span className="font-semibold">
                {formatCurrency(account.totalValueUSD)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Total P/L:</span>
              <span
                className={`font-semibold ${
                  account.totalProfitLoss >= 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {account.totalProfitLoss >= 0 ? '+' : ''}
                {formatCurrency(account.totalProfitLoss)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Trades:</span>
              <span className="font-semibold">
                {account.activeTrades.length}
              </span>
            </div>
          </div>

          <h4 className="text-md font-medium text-gray-700 mt-4 mb-3">
            Balances
          </h4>
          <div className="space-y-2">
            {Object.entries(account.balances).map(([asset, amount]) => {
              if (amount === 0) return null;

              // Calculate USD value for crypto assets
              let usdValue = amount;
              if (asset !== 'USD' && asset !== 'USDT') {
                usdValue = amount * (account.prices[asset] || 0);
              }

              return (
                <div
                  key={asset}
                  className="flex justify-between items-center p-2 bg-gray-50 rounded"
                >
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800">{asset}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {amount.toLocaleString(undefined, {
                        minimumFractionDigits:
                          asset === 'USD' || asset === 'USDT' ? 2 : 8,
                        maximumFractionDigits:
                          asset === 'USD' || asset === 'USDT' ? 2 : 8,
                      })}
                    </div>
                    {asset !== 'USD' && asset !== 'USDT' && (
                      <div className="text-xs text-gray-500">
                        ≈ {formatCurrency(usdValue)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deposit/Withdraw */}
        <div>
          <h4 className="text-md font-medium text-gray-700 mb-3">
            Deposit Funds
          </h4>
          <div className="bg-gray-50 p-4 rounded-md mb-4">
            <div className="mb-3">
              <label
                htmlFor="depositAsset"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Asset
              </label>
              <select
                id="depositAsset"
                value={depositAsset}
                onChange={(e) => setDepositAsset(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="USD">USD</option>
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="BNB">BNB</option>
              </select>
            </div>
            <div className="mb-3">
              <label
                htmlFor="depositAmount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount
              </label>
              <input
                id="depositAmount"
                type="number"
                min="0"
                step={
                  depositAsset === 'BTC' ||
                  depositAsset === 'ETH' ||
                  depositAsset === 'BNB'
                    ? '0.00000001'
                    : '0.01'
                }
                value={depositAmount}
                onChange={(e) => setDepositAmount(parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
            <button
              onClick={handleDeposit}
              disabled={isDepositing || depositAmount <= 0}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {isDepositing ? 'Processing...' : 'Deposit'}
            </button>
          </div>

          <h4 className="text-md font-medium text-gray-700 mb-3">
            Withdraw Funds
          </h4>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="mb-3">
              <label
                htmlFor="withdrawAsset"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Asset
              </label>
              <select
                id="withdrawAsset"
                value={withdrawAsset}
                onChange={(e) => setWithdrawAsset(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="USD">USD</option>
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
                <option value="BNB">BNB</option>
              </select>
            </div>
            <div className="mb-3">
              <label
                htmlFor="withdrawAmount"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount
              </label>
              <input
                id="withdrawAmount"
                type="number"
                min="0"
                max={account.balances[withdrawAsset] || 0}
                step={
                  withdrawAsset === 'BTC' ||
                  withdrawAsset === 'ETH' ||
                  withdrawAsset === 'BNB'
                    ? '0.00000001'
                    : '0.01'
                }
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <div className="text-xs text-gray-500 mt-1">
                Available:{' '}
                {account.balances[withdrawAsset]?.toLocaleString(undefined, {
                  minimumFractionDigits:
                    withdrawAsset === 'USD' || withdrawAsset === 'USDT' ? 2 : 8,
                  maximumFractionDigits:
                    withdrawAsset === 'USD' || withdrawAsset === 'USDT' ? 2 : 8,
                }) || 0}{' '}
                {withdrawAsset}
              </div>
            </div>
            <button
              onClick={handleWithdraw}
              disabled={
                isWithdrawing ||
                withdrawAmount <= 0 ||
                withdrawAmount > (account.balances[withdrawAsset] || 0)
              }
              className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              {isWithdrawing ? 'Processing...' : 'Withdraw'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
