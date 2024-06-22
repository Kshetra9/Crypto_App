import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';

const BACKEND_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://backend:8080';

const Metrics: React.FC = () => {
  const [mempoolSize, setMempoolSize] = useState<number[]>([]);
  const [blockHeight, setBlockHeight] = useState<number[]>([]);
  const [totalBitcoin, setTotalBitcoin] = useState<number[]>([]);
  const [marketPrice, setMarketPrice] = useState<number[]>([]);
  const [averageBlockSize, setAverageBlockSize] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mempoolSizeResponse = await axios.get(`${BACKEND_BASE_URL}/metrics/mempool_size`);
        const blockHeightResponse = await axios.get(`${BACKEND_BASE_URL}/metrics/block_height`);
        const totalBitcoinResponse = await axios.get(`${BACKEND_BASE_URL}/metrics/total_circulating_bitcoin`);
        const marketPriceResponse = await axios.get(`${BACKEND_BASE_URL}/metrics/market_price`);
        const averageBlockSizeResponse = await axios.get(`${BACKEND_BASE_URL}/metrics/average_block_size`);

        const timestamp = new Date().toLocaleTimeString();

        setMempoolSize((prev) => [...prev, parseFloat(mempoolSizeResponse.data)]);
        setBlockHeight((prev) => [...prev, parseFloat(blockHeightResponse.data)]);
        setTotalBitcoin((prev) => [...prev, parseFloat(totalBitcoinResponse.data)]);
        setMarketPrice((prev) => [...prev, parseFloat(marketPriceResponse.data)]);
        setAverageBlockSize((prev) => [...prev, parseFloat(averageBlockSizeResponse.data)]);
        setTimestamps((prev) => [...prev, timestamp]);
      } catch (error) {
        setError('Error fetching metrics');
      }
    };

    fetchData();

    // Set interval to fetch data every 30 seconds
    const interval = setInterval(fetchData, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const generateChartData = (label: string, data: number[]) => ({
    labels: timestamps,
    datasets: [
      {
        label,
        data,
        fill: false,
        borderColor: 'rgba(75,192,192,1)',
        tension: 0.1,
      },
    ],
  });

  return (
    <div>
      <h1>Bitcoin Metrics</h1>
      {error && <p>{error}</p>}
      <div>
        <h2>On-chain Metrics</h2>
        <Line data={generateChartData('Mempool Size', mempoolSize)} />
        <Line data={generateChartData('Block Height', blockHeight)} />
        <Line data={generateChartData('Total Circulating Bitcoin', totalBitcoin)} />
      </div>
      <div>
        <h2>Off-chain Metrics</h2>
        <Line data={generateChartData('Market Price', marketPrice)} />
        <Line data={generateChartData('Average Block Size', averageBlockSize)} />
      </div>
    </div>
  );
};

export default Metrics;
