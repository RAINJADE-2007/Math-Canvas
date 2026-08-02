// Multi-variable function module tests
// 函数解析测试：验证需求中的输入示例与错误提示。

import { test } from "node:test";
import assert from "node:assert/strict";
import { parseMultivariateInput } from "@/math-engine/middle-school/multivariate/parse";

test("解析 z=x+y 生成平面函数", () => {
  const r = parseMultivariateInput("z=x+y");
  assert.equal(r.ok, true);
  assert.equal(r.normalizedExpression, "x+y");
});

test("解析 z=x^2+y^2 生成抛物面函数", () => {
  const r = parseMultivariateInput("z=x^2+y^2");
  assert.equal(r.ok, true);
  assert.equal(r.normalizedExpression, "x^2+y^2");
});

test("解析 z=x^2-y^2 生成马鞍面函数", () => {
  const r = parseMultivariateInput("z=x^2-y^2");
  assert.equal(r.ok, true);
});

test("解析 z=sin(x)+cos(y) 生成周期曲面函数", () => {
  const r = parseMultivariateInput("z=sin(x)+cos(y)");
  assert.equal(r.ok, true);
});

test("解析 z=x*y 隐式乘积形式", () => {
  const r = parseMultivariateInput("z=x*y");
  assert.equal(r.ok, true);
});

test("解析 f(x,y)=x^2+y^2 形式", () => {
  const r = parseMultivariateInput("f(x,y)=x^2+y^2");
  assert.equal(r.ok, true);
  assert.equal(r.normalizedExpression, "x^2+y^2");
});

test("上标写法 x²+y² 归一化后解析成功", () => {
  const r = parseMultivariateInput("z=x²+y²");
  assert.equal(r.ok, true);
  assert.equal(r.normalizedExpression, "x^2+y^2");
});

test("√ 与上标自然写法归一化", () => {
  const r = parseMultivariateInput("z=√(1-x²-y²)");
  assert.equal(r.ok, true);
  assert.equal(r.normalizedExpression, "sqrt(1-x^2-y^2)");
});

test("π 常量写法归一化", () => {
  const r = parseMultivariateInput("z=sin(π*x)");
  assert.equal(r.ok, true);
});

test("非法输入 z=abc 返回解析失败提示", () => {
  const r = parseMultivariateInput("z=abc");
  assert.equal(r.ok, false);
  assert.match(r.error ?? "", /无法解析该函数，请检查表达式/);
});

test("空输入返回解析失败提示", () => {
  const r = parseMultivariateInput("");
  assert.equal(r.ok, false);
  assert.match(r.error ?? "", /无法解析该函数，请检查表达式/);
});

test("等号右侧为空时返回解析失败提示", () => {
  const r = parseMultivariateInput("z=");
  assert.equal(r.ok, false);
  assert.match(r.error ?? "", /无法解析该函数，请检查表达式/);
});

test("不支持的符号 z 返回解析失败提示", () => {
  const r = parseMultivariateInput("z=x+z");
  assert.equal(r.ok, false);
  assert.match(r.error ?? "", /无法解析该函数，请检查表达式/);
});

test("不支持的函数返回解析失败提示", () => {
  const r = parseMultivariateInput("z=arcsin(x)");
  assert.equal(r.ok, false);
  assert.match(r.error ?? "", /无法解析该函数，请检查表达式/);
});
