import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CSSProperties } from "react";

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const tooltipContentStyle: CSSProperties = {
  background: "var(--bg-elevated)",
  border: "1px solid var(--border)",
  borderRadius: 8,
  color: "var(--text-primary)",
};

const tooltipLabelStyle: CSSProperties = { color: "var(--text-primary)" };
const tooltipItemStyle: CSSProperties = { color: "var(--text-primary)" };

export type ChartSeriesPoint = Record<string, string | number>;

export type DailyLineChartProps = {
  data: ChartSeriesPoint[];
  xKey: string;
  yKey: string;
  yLabel?: string;
  onPointClick?: (point: ChartSeriesPoint) => void;
};

export type NamedBarChartProps = {
  data: ChartSeriesPoint[];
  nameKey?: string;
  valueKey: string;
  valueLabel?: string;
  onItemClick?: (name: string) => void;
};

export type NamedPieChartProps = {
  data: ChartSeriesPoint[];
  nameKey?: string;
  valueKey: string;
  onItemClick?: (name: string) => void;
};

/** Theme-token Recharts line chart for daily series. */
export function DailyLineChart({
  data,
  xKey,
  yKey,
  yLabel,
  onPointClick,
}: DailyLineChartProps) {
  return (
    <ResponsiveContainer>
      <LineChart
        data={data}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        onClick={(state) => {
          const payload = state?.activePayload?.[0]?.payload as ChartSeriesPoint | undefined;
          if (payload && onPointClick) onPointClick(payload);
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={xKey} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} width={48} />
        <Tooltip
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          name={yLabel ?? yKey}
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={!!onPointClick}
          activeDot={onPointClick ? { r: 5 } : undefined}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/** Theme-token Recharts bar chart for named categories. */
export function NamedBarChart({
  data,
  nameKey = "name",
  valueKey,
  valueLabel,
  onItemClick,
}: NamedBarChartProps) {
  return (
    <ResponsiveContainer>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={nameKey} tick={{ fill: "var(--text-muted)", fontSize: 12 }} />
        <YAxis tick={{ fill: "var(--text-muted)", fontSize: 12 }} width={48} />
        <Tooltip
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
        />
        <Bar
          dataKey={valueKey}
          name={valueLabel ?? valueKey}
          fill="var(--chart-2)"
          radius={[4, 4, 0, 0]}
          cursor={onItemClick ? "pointer" : undefined}
          onClick={(entry) => {
            const name = String((entry as ChartSeriesPoint)?.[nameKey] ?? "");
            if (name && onItemClick) onItemClick(name);
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Theme-token Recharts pie chart for named shares. */
export function NamedPieChart({
  data,
  nameKey = "name",
  valueKey,
  onItemClick,
}: NamedPieChartProps) {
  return (
    <ResponsiveContainer>
      <PieChart>
        <Pie
          data={data}
          dataKey={valueKey}
          nameKey={nameKey}
          innerRadius={48}
          outerRadius={80}
          paddingAngle={2}
          cursor={onItemClick ? "pointer" : undefined}
          onClick={(_, index) => {
            const name = String(data[index]?.[nameKey] ?? "");
            if (name && onItemClick) onItemClick(name);
          }}
        >
          {data.map((_, index) => (
            <Cell key={String(index)} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipContentStyle}
          labelStyle={tooltipLabelStyle}
          itemStyle={tooltipItemStyle}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
