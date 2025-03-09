import React from 'react';
import { Currency } from '../types';

interface CurrencySelectorProps {
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  className?: string;
}

export default function CurrencySelector({
  selectedCurrency,
  onCurrencyChange,
  className = '',
}: CurrencySelectorProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <label className="sr-only">Currency</label>
      <div className="relative rounded-md shadow-sm">
        <select
          value={selectedCurrency}
          onChange={(e) => onCurrencyChange(e.target.value as Currency)}
          className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
        >
          <option value={Currency.USD}>USD ($)</option>
          <option value={Currency.INR}>INR (₹)</option>
        </select>
      </div>
    </div>
  );
}
