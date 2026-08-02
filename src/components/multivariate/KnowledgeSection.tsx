"use client";

import { useState } from "react";

// Multi-variable function module
// Support z=f(x,y)
// 多元函数基础知识讲解（学习内容）。

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3">
      <h4 className="text-sm font-medium text-slate-700">{title}</h4>
      <div className="mt-1.5 space-y-1.5 text-xs leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

export function KnowledgeSection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-slate-700 hover:text-primary-700"
      >
        <span>多元函数知识讲解</span>
        <span className="text-slate-400">{open ? "收起 ▲" : "展开 ▼"}</span>
      </button>
      {open ? (
        <div className="space-y-2 border-t border-slate-200 p-3">
          <Block title="1. 什么是多元函数">
            <p>
              一元函数 <span className="font-mono">y = f(x)</span>：输入一个变量 x，输出一个变量 y，
              图像是一条平面曲线。
            </p>
            <p>
              多元函数 <span className="font-mono">z = f(x, y)</span>：输入两个变量 x、y，输出一个高度 z，
              图像是一个空间曲面。
            </p>
            <p>
              从一元到多元，是从「曲线」到「曲面」的自然过渡，也是高等数学中偏导数、多重积分、
              梯度等概念的基础。
            </p>
          </Block>

          <Block title="2. 函数表示方式">
            <p>
              <span className="text-slate-500">表达式：</span>
              <span className="font-mono">z = x² + y²</span>，明确自变量与函数关系。
            </p>
            <p>
              <span className="text-slate-500">三维曲面：</span>把每个 (x, y) 处的高度 z 画成空间中的点，
              构成曲面（画布右上角切到「3D」查看）。
            </p>
            <p>
              <span className="text-slate-500">等高线：</span>把 z 取相同值的点连成等值线，类似地图上的
              海拔线（画布 3D 视图下切换到「等高线」查看）。
            </p>
          </Block>

          <Block title="3. 定义域">
            <p>
              定义域是使函数有意义的 (x, y) 集合。例如：
            </p>
            <p>
              <span className="font-mono">f(x,y) = √(1−x²−y²)</span> 要求根号内非负，即{" "}
              <span className="font-mono">x² + y² ≤ 1</span>，定义域是单位圆盘。
            </p>
            <p>
              分母不为 0、根号内 ≥ 0、对数真数 &gt; 0 等限制共同决定了定义域。
            </p>
          </Block>

          <Block title="4. 典型函数案例">
            <p>平面：z = x + y</p>
            <p>抛物面：z = x² + y²</p>
            <p>马鞍面：z = x² − y²</p>
            <p>波浪曲面：z = sin(x) + cos(y)</p>
            <p>点击上方「示例函数」即可自动填充并绘制。</p>
          </Block>
        </div>
      ) : null}
    </div>
  );
}
