import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Metrics: React.FC = () => {
  const [mempoolSize, setMempoolSize] = useState<string | null>(null);
  const [blockHeight, setBlockHeight] = useState<string | null>(null);
  const [totalBitcoin, setTotalBitcoin] = useState<string | null>(null);
  const [marketPrice, setMarketPrice] = useState<string | null>(null);
  const [averageBlockSize, setAverageBlockSize] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const mempoolSizeResponse = await axios.get('http://0.0.0.0:8080/metrics/mempool_size');
        setMempoolSize(mempoolSizeResponse.data);

        const blockHeightResponse = await axios.get('http://0.0.0.0:8080/metrics/block_height');
        setBlockHeight(blockHeightResponse.data);

        const totalBitcoinResponse = await axios.get('http://0.0.0.0:8080/metrics/total_circulating_bitcoin');
        setTotalBitcoin(totalBitcoinResponse.data);

        const marketPriceResponse = await axios.get('http://0.0.0.0:8080/metrics/market_price');
        setMarketPrice(marketPriceResponse.data);

        const averageBlockSizeResponse = await axios.get('http://0.0.0.0:8080/metrics/average_block_size');
        setAverageBlockSize(averageBlockSizeResponse.data);
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

  return (
    <div>
      <h1>Bitcoin Metrics</h1>
      {error && <p>{error}</p>}
      <div>
        <h2>On-chain Metrics</h2>
        <p><strong>Mempool Size:</strong> {mempoolSize || 'Loading...'}</p>
        <p><strong>Block Height:</strong> {blockHeight || 'Loading...'}</p>
        <p><strong>Total Circulating Bitcoin:</strong> {totalBitcoin || 'Loading...'}</p>
      </div>
      <div>
        <h2>Off-chain Metrics</h2>
        <p><strong>Market Price:</strong> {marketPrice || 'Loading...'}</p>
        <p><strong>Average Block Size:</strong> {averageBlockSize || 'Loading...'}</p>
      </div>
    </div>
  );
};

export default Metrics;
