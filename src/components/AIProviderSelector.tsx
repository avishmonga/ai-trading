import React from 'react';
import { AIProvider } from '../types';

interface AIProviderSelectorProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  className?: string;
}

export default function AIProviderSelector({
  selectedProvider,
  onProviderChange,
  className = '',
}: AIProviderSelectorProps) {
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <label className="text-sm font-medium text-gray-700">AI Provider</label>
      <div className="flex space-x-4">
        <div className="flex items-center">
          <input
            id="openai-radio"
            type="radio"
            name="ai-provider"
            value={AIProvider.OpenAI}
            checked={selectedProvider === AIProvider.OpenAI}
            onChange={() => onProviderChange(AIProvider.OpenAI)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <label
            htmlFor="openai-radio"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            OpenAI
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="gemini-radio"
            type="radio"
            name="ai-provider"
            value={AIProvider.Gemini}
            checked={selectedProvider === AIProvider.Gemini}
            onChange={() => onProviderChange(AIProvider.Gemini)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <label
            htmlFor="gemini-radio"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Gemini
          </label>
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-1">
        {selectedProvider === AIProvider.OpenAI ? (
          <span>Using OpenAI (GPT-3.5 Turbo) for analysis</span>
        ) : (
          <span>Using Google Gemini 1.5 Pro for analysis</span>
        )}
      </div>
    </div>
  );
}
