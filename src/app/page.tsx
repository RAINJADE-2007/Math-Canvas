import Link from "next/link";
import { APP_NAME, APP_NAME_ZH, GITHUB_REPO_URL, PROJECT_VERSION } from "@/constants/app";
import { SUBJECT_META, SUBJECT_ORDER } from "@/constants/subjects";
import { LatexView } from "@/components/common/LatexView";

const FEATURE_CARDS = [
  {
    title: "函数可视化",
    description: "输入表达式即可在二维坐标画布中绘制函数图像，支持多函数同屏显示。",
    examples: ["x^2", "sin(x)", "1/x"],
    href: "/canvas",
  },
  {
    title: "参数动态探索",
    description: "识别表达式中的参数并生成滑块，拖动滑块即可观察图像与性质的实时变化。",
    examples: ["a*x+b", "a*x^2+b*x+c"],
    href: "/canvas",
  },
  {
    title: "数学计算",
    description: "内置基础科学计算器，支持四则运算、乘方、三角函数、对数与平方根等。",
    examples: ["2+3*4", "sin(pi/2)"],
    href: "/canvas",
  },
  {
    title: "方程分步求解",
    description: "一元一次方程、一元二次方程与一元一次不等式，分步展示求解过程并自动验证。",
    examples: ["2*x+3=7", "x^2-5*x+6=0"],
    href: "/canvas",
  },
  {
    title: "平面几何",
    description: "通过表单创建点、直线、线段与圆，自动计算两点距离、中点与斜率。",
    examples: ["点 A(2,3)", "圆 O(0,0) r=3"],
    href: "/canvas",
  },
  {
    title: "统计分析",
    description: "输入一组数据，计算平均数、中位数、众数与极差，并绘制基础统计图。",
    examples: ["12,15,15,18,20"],
    href: "/canvas",
  },
  {
    title: "导数与切线",
    description: "对函数求导，在曲线上移动切点观察切线方程实时变化，用割线逼近理解导数几何意义。",
    examples: ["f(x)=x^2", "割线逼近切线"],
    href: "/canvas",
  },
];

export default function HomePage() {
  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <section className="text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-4 py-1 text-xs text-primary-700">
          公益 · 开源 · 非商业项目 · 版本 {PROJECT_VERSION}
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-slate-900">
          {APP_NAME} <span className="text-primary-600">{APP_NAME_ZH}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-slate-600">
          一个集<strong>数学表达式输入</strong>、<strong>函数图像绘制</strong>、<strong>参数调节</strong>、<strong>基础计算</strong>、<strong>函数性质分析</strong>、<strong>导数可视化</strong>与<strong>分步解题</strong>于一体的交互式数学学习网站。
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
          以中学数学为核心，适当加入导数入门作为连接高中函数与大学高等数学的拓展模块。
        </p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link
            href="/canvas"
            className="rounded-lg bg-primary-600 px-8 py-3 text-lg font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
          >
            进入数学画布
          </Link>
          <Link
            href="/subjects"
            className="rounded-lg border border-slate-300 px-8 py-3 text-lg font-medium text-slate-700 transition-colors hover:border-primary-400 hover:text-primary-700"
          >
            浏览学科模块
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-semibold text-slate-900">功能总览</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_CARDS.map((card) => (
            <Link
              key={card.title}
              href={card.href}
              className="group rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-md"
            >
              <h3 className="flex items-center gap-2 font-semibold text-slate-800 group-hover:text-primary-700">
                <span className="h-2 w-2 rounded-full bg-primary-500" />
                {card.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{card.description}</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {card.examples.map((example) => (
                  <span
                    key={example}
                    className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600"
                  >
                    {example}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900">适用学段与范围</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
            <li>初中数学：一次函数、二次函数、反比例函数、方程、不等式、几何与统计；</li>
            <li>高中数学：函数图像与性质、三角函数、指数与对数函数；</li>
            <li>导数入门：基础符号求导、切线动态展示、割线逼近与单调性分析；</li>
            <li>不面向高等数学的完整体系，逐步扩展。</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-lg font-semibold text-slate-900">核心理念</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-slate-600">
            <li>用图像辅助理解；</li>
            <li>用计算辅助验证；</li>
            <li>用步骤辅助学习；</li>
            <li>用参数变化展示数学规律；</li>
            <li>用动态切线帮助理解导数；</li>
            <li>免费、开源、便于师生使用与二次开发。</li>
          </ul>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center text-2xl font-semibold text-slate-900">学科模块状态</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECT_ORDER.map((id) => {
            const meta = SUBJECT_META[id];
            return (
              <Link
                key={id}
                href={`/subjects/${id}`}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-slate-800">{meta.name}</h3>
                  <span
                    className={
                      meta.enabled
                        ? "rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700"
                        : "rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500"
                    }
                  >
                    {meta.statusLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">{meta.description}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-16 rounded-xl border border-primary-100 bg-primary-50/50 p-8">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">公益开源项目</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
              {APP_NAME_ZH}是面向学生与教师的教学辅助项目，不含登录、支付、广告或商业服务。
              欢迎参与二次开发与教学反馈。后续将逐步开放高等数学、线性代数、概率论与复变函数模块。
            </p>
          </div>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-primary-400 hover:text-primary-700"
          >
            GitHub 仓库（占位）↗
          </a>
        </div>
        <div className="mt-6 border-t border-primary-100 pt-4 text-xs text-slate-500">
          项目不对“解决所有数学问题”作承诺，而是通过交互式图形、计算验证与分步说明，辅助学生理解中学函数与基础导数概念。
        </div>
      </section>

      <section className="mt-16 text-center text-sm text-slate-400">
        <LatexView latex="y = ax^2 + bx + c" displayMode className="block text-lg" />
        <p className="mt-2">用图像与步骤，让数学变得可见。</p>
      </section>
    </div>
  );
}
