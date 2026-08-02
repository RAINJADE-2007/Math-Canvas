// Multi-variable function module
// Support z=f(x,y)
// 等高线提取：采用 marching squares（移动方块）算法，
// 在采样网格上求出给定高度值的等值线段。

export interface ContourSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface ContourLevel {
  level: number;
  segments: ContourSegment[];
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * 从采样网格中提取各高度的等值线段。
 * @param zs  二维数组，zs[i][j] 为 (xs[i], ys[j]) 处的函数值
 * @param xs  采样点 x 坐标（网格列，长度为 zs 的行数）
 * @param ys  采样点 y 坐标（网格行，长度为 zs 的列数）
 * @param levels 需要绘制的等高线高度值列表
 */
export function extractContours(
  zs: number[][],
  xs: number[],
  ys: number[],
  levels: number[],
): ContourLevel[] {
  const rows = zs.length;
  const cols = zs[0]?.length ?? 0;
  const result: ContourLevel[] = [];

  for (const level of levels) {
    const segments: ContourSegment[] = [];
    for (let i = 0; i < rows - 1; i++) {
      for (let j = 0; j < cols - 1; j++) {
        const z00 = zs[i][j];
        const z10 = zs[i + 1][j];
        const z11 = zs[i + 1][j + 1];
        const z01 = zs[i][j + 1];
        if (![z00, z10, z11, z01].every((v) => Number.isFinite(v))) continue;
        const x0 = xs[i];
        const x1 = xs[i + 1];
        const y0 = ys[j];
        const y1 = ys[j + 1];

        // 按四个角点是否高于该高度编码为 0..15
        const above = (v: number) => v >= level;
        const caseIndex =
          (above(z00) ? 1 : 0) |
          (above(z10) ? 2 : 0) |
          (above(z11) ? 4 : 0) |
          (above(z01) ? 8 : 0);
        if (caseIndex === 0 || caseIndex === 15) continue;

        // 收集被跨越的边上的交点（顺序：下、右、上、左）
        const pts: { x: number; y: number }[] = [];
        const addCross = (
          a: number,
          b: number,
          ax: number,
          ay: number,
          bx: number,
          by: number,
        ) => {
          const aAbove = above(a);
          const bAbove = above(b);
          if (aAbove === bAbove) return;
          const t = (level - a) / (b - a);
          pts.push({ x: lerp(ax, bx, t), y: lerp(ay, by, t) });
        };
        addCross(z00, z10, x0, y0, x1, y0);
        addCross(z10, z11, x1, y0, x1, y1);
        addCross(z11, z01, x1, y1, x0, y1);
        addCross(z01, z00, x0, y1, x0, y0);

        if (pts.length === 2) {
          segments.push({ x1: pts[0].x, y1: pts[0].y, x2: pts[1].x, y2: pts[1].y });
        } else if (pts.length === 4) {
          // 鞍点歧义：用网格中心值判定两对连线的走向
          const zc = (z00 + z10 + z11 + z01) / 4;
          if (zc >= level) {
            segments.push({ x1: pts[0].x, y1: pts[0].y, x2: pts[1].x, y2: pts[1].y });
            segments.push({ x1: pts[2].x, y1: pts[2].y, x2: pts[3].x, y2: pts[3].y });
          } else {
            segments.push({ x1: pts[1].x, y1: pts[1].y, x2: pts[2].x, y2: pts[2].y });
            segments.push({ x1: pts[3].x, y1: pts[3].y, x2: pts[0].x, y2: pts[0].y });
          }
        }
      }
    }
    result.push({ level, segments });
  }
  return result;
}

/** 生成位于 [min, max] 之间的均匀等高线高度值 */
export function autoLevels(min: number, max: number, count = 12): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max - min < 1e-9) return [0];
  const step = (max - min) / (count + 1);
  const levels: number[] = [];
  for (let i = 1; i <= count; i++) {
    const v = min + step * i;
    if (Math.abs(v) < 1e-9) levels.push(0);
    else levels.push(v);
  }
  return levels;
}
