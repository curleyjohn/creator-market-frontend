import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface PriceHistoryGraphProps {
  creatorId: string;
}

interface PriceData {
  price: number;
  timestamp: Date;
}

const PriceHistoryGraph: React.FC<PriceHistoryGraphProps> = ({ creatorId }) => {
  const [priceHistory, setPriceHistory] = useState<PriceData[]>([]);

  useEffect(() => {
    const historyRef = collection(db, 'creators', creatorId, 'priceHistory');
    const q = query(historyRef, orderBy('timestamp', 'desc'), limit(30));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const history = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          price: data.price,
          timestamp: data.timestamp?.toDate() || new Date(),
        };
      }).reverse(); // Reverse to show oldest to newest

      setPriceHistory(history);
    });

    return () => unsubscribe();
  }, [creatorId]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate min and max price with padding for better visualization
  const minPrice = Math.min(...priceHistory.map(item => item.price));
  const maxPrice = Math.max(...priceHistory.map(item => item.price));
  const priceRange = maxPrice - minPrice;
  const padding = priceRange * 0.1; // 10% padding

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={priceHistory}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatTime}
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fontSize: 10 }}
          />
          <YAxis
            domain={[minPrice - padding, maxPrice + padding]}
            stroke="rgba(255, 255, 255, 0.7)"
            tick={{ fontSize: 10 }}
            tickFormatter={(value) => value.toFixed(2)}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--sidebar-bg)',
              border: '1px solid var(--accent)',
              color: 'var(--text)'
            }}
            labelFormatter={formatTime}
            formatter={(value: number) => [`${value.toFixed(4)} CC`, 'Price']}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PriceHistoryGraph; 