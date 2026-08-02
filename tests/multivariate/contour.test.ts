// Multi-variable function module tests
// 等高线提取测试：验证 marching squares 与自动高度值。

import { test } from "node:test";
import assert from "node:assert/strict";
import { autoLevels, extractContours } from "@/math-engine/middle-school/multivariate/contour";

function makeGrid(fn: (x: number, y: number) => number, n = 24): { xs: number[]; ys: number[]; zs: number[][] } {
  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i <= n; i++) {
    xs.push(-2 + (4 * i) / n);
    ys.push(-2 + (4 * i) / n);
  }
  const zs: number[][] = [];
  for (let i = 0; i <= n; i++) {
    const row: number[] = [];
    for (let j = 0; j <= n; j++) row.push(fn(xs[i], ys[j]));
    zs.push(row);
  }
  return { xs, ys, zs };
}

test("autoLevels 生成区间内均匀高度值", () => {
  const levels = autoLevels(0, 8, 12);
  assert.equal(levels.length, 12);
  assert.ok(levels.every((v) => v > 0 && v < 8));
});

test("平面 z=x 的等高线生成非空线段", () => {
  const { xs, ys, zs } = makeGrid((x) => x);
  const levels = autoLevels(-2, 2, 8);
  const result = extractContours(zs, xs, ys, levels);
  assert.ok(result.length > 0);
  const total = result.reduce((acc, lv) => acc + lv.segments.length, 0);
  assert.ok(total > 0, "平面应有等高线段");
});

test("抛物面 z=x²+y² 的等高线呈同心环状（非空）", () => {
  const { xs, ys, zs } = makeGrid((x, y) => x * x + y * y);
  const levels = autoLevels(0, 8, 10);
  const result = extractContours(zs, xs, ys, levels);
  const total = result.reduce((acc, lv) => acc + lv.segments.length, 0);
  assert.ok(total > 0, "抛物面应有等高线段");
});

test("常值函数无等高线", () => {
  const { xs, ys, zs } = makeGrid(() => 1);
  const result = extractContours(zs, xs, ys, [0.5, 2]);
  assert.equal(result.length, 2);
  assert.ok(result.every((lv) => lv.segments.length === 0));
});

test("超出函数值范围的等高线为空", () => {
  const { xs, ys, zs } = makeGrid((x, y) => x * x + y * y);
  const result = extractContours(zs, xs, ys, [100, 200]);
  assert.ok(result.every((lv) => lv.segments.length === 0));
});
