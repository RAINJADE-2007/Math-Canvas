export interface StatisticsResult {
  count: number;
  sum: number;
  mean: number;
  median: number;
  mode: number[];
  max: number;
  min: number;
  range: number;
  sorted: number[];
  frequency: { value: number; count: number }[];
}

export function parseDataInput(input: string): { values: number[]; error?: string } {
  const tokens = input
    .split(/[,，\s;；]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 0);
  if (tokens.length === 0) {
    return { values: [], error: "请输入数据，例如 12,15,15,18,20" };
  }
  const values: number[] = [];
  for (const token of tokens) {
    const value = Number(token);
    if (!Number.isFinite(value)) {
      return { values: [], error: `无法解析数据项：${token}` };
    }
    values.push(value);
  }
  if (values.length < 2) {
    return { values, error: "建议输入至少 2 个数据项" };
  }
  return { values };
}

export function computeStatistics(values: number[]): StatisticsResult {
  const sorted = [...values].sort((a, b) => a - b);
  const count = sorted.length;
  const sum = sorted.reduce((s, v) => s + v, 0);
  const mean = sum / count;

  let median: number;
  if (count % 2 === 1) {
    median = sorted[Math.floor(count / 2)];
  } else {
    median = (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
  }

  const frequencyMap = new Map<number, number>();
  for (const v of sorted) {
    frequencyMap.set(v, (frequencyMap.get(v) ?? 0) + 1);
  }
  const frequency = Array.from(frequencyMap.entries())
    .map(([value, freq]) => ({ value, count: freq }))
    .sort((a, b) => a.value - b.value);
  const maxFrequency = Math.max(...frequency.map((f) => f.count), 1);
  const mode = frequency.filter((f) => f.count === maxFrequency).map((f) => f.value);

  return {
    count,
    sum,
    mean,
    median,
    mode,
    max: sorted[count - 1],
    min: sorted[0],
    range: sorted[count - 1] - sorted[0],
    sorted,
    frequency,
  };
}
