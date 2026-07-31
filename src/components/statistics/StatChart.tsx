"use client";

interface StatChartProps {
  type: "bar" | "line";
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}

export function StatChart({ type, data, color = "#2563eb", height = 220 }: StatChartProps) {
  const width = 480;
  const padding = { top: 16, right: 12, bottom: 28, left: 36 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  if (data.length === 0) {
    return <p className="text-sm text-slate-400">暂无数据</p>;
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (type === "bar") {
    const barWidth = Math.min(56, (innerWidth / data.length) * 0.6);
    const gap = data.length > 1 ? (innerWidth - barWidth * data.length) / (data.length - 1) : 0;
    const bars = data.map((d, index) => {
      const barHeight = (d.value / maxValue) * innerHeight;
      const x = padding.left + index * (barWidth + gap);
      const y = padding.top + innerHeight - barHeight;
      return (
        <g key={index}>
          <rect
            x={x}
            y={y}
            width={barWidth}
            height={Math.max(barHeight, 1)}
            fill={color}
            opacity={0.85}
            rx={2}
          />
          <text
            x={x + barWidth / 2}
            y={y - 4}
            textAnchor="middle"
            fontSize="10"
            fill="#475569"
          >
            {d.value}
          </text>
          <text
            x={x + barWidth / 2}
            y={height - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#64748b"
          >
            {d.label}
          </text>
        </g>
      );
    });

    const yTicks = [0, maxValue / 2, maxValue].map((v, i) => (
      <g key={i}>
        <line
          x1={padding.left}
          y1={padding.top + innerHeight - (v / maxValue) * innerHeight}
          x2={width - padding.right}
          y2={padding.top + innerHeight - (v / maxValue) * innerHeight}
          stroke="#e2e8f0"
          strokeWidth="0.5"
        />
        <text
          x={padding.left - 4}
          y={padding.top + innerHeight - (v / maxValue) * innerHeight + 3}
          textAnchor="end"
          fontSize="9"
          fill="#94a3b8"
        >
          {Math.round(v)}
        </text>
      </g>
    ));

    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="max-w-full">
        {yTicks}
        {bars}
      </svg>
    );
  }

  const points = data
    .map((d, index) => {
      const x = padding.left + (index / Math.max(data.length - 1, 1)) * innerWidth;
      const y = padding.top + innerHeight - (d.value / maxValue) * innerHeight;
      return { x, y, label: d.label, value: d.value };
    })
    .map((p) => p);
  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="max-w-full">
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3.5} fill={color} />
          <text x={p.x} y={p.y - 6} textAnchor="middle" fontSize="9" fill="#475569">
            {p.value}
          </text>
          <text x={p.x} y={height - 8} textAnchor="middle" fontSize="9" fill="#64748b">
            {p.label}
          </text>
        </g>
      ))}
      <polyline points={polyline} fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}
