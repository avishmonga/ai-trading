'use client';

import React, { useState } from 'react';
import TradeHistory from '@/components/TradeHistory';
import CurrencySelector from '@/components/CurrencySelector';
import { Currency } from '@/types';

export default function TradeHistoryPage() {
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(
    Currency.USD
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trade History</h1>
        <CurrencySelector
          selectedCurrency={selectedCurrency}
          onCurrencyChange={setSelectedCurrency}
        />
      </div>

      <TradeHistory selectedCurrency={selectedCurrency} />
    </main>
  );
}
