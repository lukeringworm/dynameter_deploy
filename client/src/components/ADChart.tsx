import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  day: string;
  score: number;
  date: string;
}

interface ADChartProps {
  data: ChartDataPoint[];
}

export function ADChart({ data }: ADChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 w-full flex items-center justify-center">
        <div className="text-center text-neutral dark:text-slate-300">
          <p>No trend data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-slate-300 dark:text-slate-600" />
          <XAxis 
            dataKey="day" 
            stroke="currentColor"
            className="text-slate-600 dark:text-slate-400"
            fontSize={12}
          />
          <YAxis 
            stroke="currentColor"
            className="text-slate-600 dark:text-slate-400"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              color: 'var(--foreground)'
            }}
            labelStyle={{ color: 'var(--foreground)' }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="hsl(207, 90%, 54%)" 
            strokeWidth={3}
            dot={{ fill: 'hsl(207, 90%, 54%)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: 'hsl(207, 90%, 54%)', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
