import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Text } from 'recharts';

interface RiskChartProps {
  score: number;
  label: string;
}

const RiskChart: React.FC<RiskChartProps> = ({ score, label }) => {
  const data = [
    { name: 'Risk', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  const getColor = (s: number) => {
    if (s <= 30) return '#10b981'; // Green
    if (s <= 60) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  };

  const color = getColor(score);

  return (
    <div className="w-full h-48 relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            startAngle={180}
            endAngle={0}
            paddingAngle={0}
            dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill="#e5e7eb" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/4 text-center">
        <div className="text-3xl font-bold" style={{ color }}>{score}%</div>
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</div>
      </div>
    </div>
  );
};

export default RiskChart;
