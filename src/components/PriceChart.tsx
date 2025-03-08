import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { HistoricalData } from '@/types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceChartProps {
  symbol: string;
  data: HistoricalData[];
  recommendation?: {
    entryPrice?: number;
    targetPrice?: number;
    stopLoss?: number;
  };
}

const PriceChart: React.FC<PriceChartProps> = ({
  symbol,
  data,
  recommendation,
}) => {
  // Format timestamps for x-axis labels
  const labels = data.map((item) => {
    const date = new Date(item.timestamp);
    return `${date.getHours()}:${date
      .getMinutes()
      .toString()
      .padStart(2, '0')}`;
  });

  // Extract price data
  const prices = data.map((item) => item.close);

  // Create datasets for the chart
  const datasets = [
    {
      label: `${symbol} Price`,
      data: prices,
      borderColor: 'rgb(53, 162, 235)',
      backgroundColor: 'rgba(53, 162, 235, 0.5)',
      tension: 0.1,
    },
  ];

  // Add horizontal lines for entry, target, and stop loss if available
  if (recommendation) {
    const { entryPrice, targetPrice, stopLoss } = recommendation;

    // Add entry price line
    if (entryPrice) {
      datasets.push({
        label: 'Entry Price',
        data: Array(labels.length).fill(entryPrice),
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
      });
    }

    // Add target price line
    if (targetPrice) {
      datasets.push({
        label: 'Target Price',
        data: Array(labels.length).fill(targetPrice),
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
      });
    }

    // Add stop loss line
    if (stopLoss) {
      datasets.push({
        label: 'Stop Loss',
        data: Array(labels.length).fill(stopLoss),
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        tension: 0,
      });
    }
  }

  // Chart options
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${symbol} Price Chart (Last 24 Hours)`,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: false,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  return (
    <div className="h-[400px] w-full">
      <Line
        data={{
          labels,
          datasets,
        }}
        options={options}
      />
    </div>
  );
};

export default PriceChart;
