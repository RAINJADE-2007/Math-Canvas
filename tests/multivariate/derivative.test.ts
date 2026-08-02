// Multi-variable function module tests
// 简单偏导数测试：仅覆盖幂函数、四则运算与 sin/cos。

import { test } from "node:test";
import assert from "node:assert/strict";
import { partialDerivative } from "@/math-engine/middle-school/multivariate/derivative";

test("f(x,y)=x^2*y 对 x 求偏导得 2xy", () => {
  const r = partialDerivative("x^2*y", "x");
  assert.equal(r.ok, true);
  assert.ok(r.expression.includes("2"));
  assert.ok(r.expression.includes("x"));
  assert.ok(r.expression.includes("y"));
});

test("f(x,y)=x^2*y 对 y 求偏导得 x^2", () => {
  const r = partialDerivative("x^2*y", "y");
  assert.equal(r.ok, true);
  assert.match(r.expression, /x\s*\^\s*2/);
});

test("f(x,y)=sin(x)+cos(y) 对 x 求偏导得 cos(x)", () => {
  const r = partialDerivative("sin(x)+cos(y)", "x");
  assert.equal(r.ok, true);
  assert.match(r.expression, /cos\s*\(\s*x\s*\)/);
});

test("f(x,y)=x*y 对 x 求偏导得 y", () => {
  const r = partialDerivative("x*y", "x");
  assert.equal(r.ok, true);
  assert.match(r.expression, /^y$/);
});

test("偏导结果接口包含 latex", () => {
  const r = partialDerivative("x^2+y^2", "x");
  assert.equal(r.ok, true);
  assert.ok(r.latex.length > 0);
});
