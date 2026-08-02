// Multi-variable function module tests
// 示例函数库测试：内置案例可解析、可数值求值。

import { test } from "node:test";
import assert from "node:assert/strict";
import { MULTIVARIATE_EXAMPLES } from "@/math-engine/middle-school/multivariate/examples";
import { parseMultivariateInput } from "@/math-engine/middle-school/multivariate/parse";
import { createBivariateFunction } from "@/math-engine/middle-school/multivariate/evaluate";

test("内置案例包含平面/抛物面/马鞍面/波浪曲面", () => {
  const names = MULTIVARIATE_EXAMPLES.map((e) => e.name);
  assert.ok(names.includes("平面"));
  assert.ok(names.includes("抛物面"));
  assert.ok(names.includes("马鞍面"));
  assert.ok(names.includes("波浪曲面"));
});

test("每个内置案例都能被解析", () => {
  for (const ex of MULTIVARIATE_EXAMPLES) {
    const r = parseMultivariateInput(`z=${ex.expression}`);
    assert.equal(r.ok, true, `案例 ${ex.id} 解析失败: ${r.error}`);
  }
});

test("每个内置案例都能在 (0.5,-0.5) 处数值求值", () => {
  for (const ex of MULTIVARIATE_EXAMPLES) {
    const fn = createBivariateFunction(ex.expression);
    const z = fn.evaluate(0.5, -0.5);
    assert.ok(Number.isFinite(z), `案例 ${ex.id} 在 (0.5,-0.5) 处无有限值`);
  }
});

test("半球面案例在圆域外返回无定义", () => {
  const dome = MULTIVARIATE_EXAMPLES.find((e) => e.id === "dome");
  assert.ok(dome);
  const fn = createBivariateFunction(dome.expression);
  assert.ok(!Number.isFinite(fn.evaluate(2, 2)), "x²+y²>1 时应无定义");
  assert.ok(Number.isFinite(fn.evaluate(0, 0)), "原点处应有定义");
});
