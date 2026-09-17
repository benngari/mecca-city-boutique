'use client';

import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

export default function SalesChart({ data }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const gridColor = dark ? '#334155' : '#E2E8F0';
  const textColor = dark ? '#B0BEDE' : '#4C63A0';

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="label" stroke={textColor} tick={{ fontSize: 12 }} />
          <YAxis stroke={textColor} tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: dark ? '#141B3E' : '#FFFFFF',
              border: `1px solid ${gridColor}`,
              borderRadius: '0.75rem',
              fontSize: '0.875rem',
            }}
            labelStyle={{ color: dark ? '#FBF9F5' : '#0F1B3D' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
          <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#2D8FE0" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="profit" name="Profit" stroke="#16A34A" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}