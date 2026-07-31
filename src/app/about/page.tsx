import { APP_NAME, APP_NAME_ZH, GITHUB_REPO_URL, PROJECT_VERSION, TAGLINE } from "@/constants/app";

const SECTIONS = [
  {
    title: "项目背景",
    content: [
      "数学学习中，图像、计算与解题步骤往往相互分离：课本讲方法、练习册给答案、图形计算器画图像。学生难以在同一处把“图像长什么样”“结果是多少”“步骤怎么走”三者对应起来。",
      "数学画布项目面向初中生、高中生和刚接触大学数学的学生，尝试把这些环节整合到一个网页中，让数学学习更直观、可验证、可探索。",
    ],
  },
  {
    title: "项目意义",
    content: [
      "以中学数学为核心、以导数可视化为延伸，构建一个低门槛的数学学习工具，帮助学生在动手操作中建立函数、方程与导数的直观认识。",
      "同时作为大学生课程设计项目，展示如何将前端工程、数学引擎与教学场景结合。",
    ],
  },
  {
    title: "用户需求",
    content: [
      "学生需要一个可以自由输入函数、快速看到图像、拖动参数观察规律、逐步查看解题过程的工具；",
      "教师需要一个可以在课堂演示、无安装成本、可二次修改的教学辅助平台；",
      "初版不需要账号、云同步等复杂能力，本地即可运行。",
    ],
  },
  {
    title: "核心功能",
    content: [
      "函数画布：JSXGraph 交互式二维坐标系，支持拖拽、缩放、多函数同屏与间断点正确处理；",
      "表达式与参数：math.js 解析、KaTeX 公式预览、参数滑块实时联动；",
      "函数性质分析：一次、二次、反比例、三角函数的性质自动提取；",
      "计算与求解：科学计算器，一元一次、一元二次方程与一元一次不等式的分步求解；",
      "导数入门：符号求导、数值导数、切线动态展示、割线逼近、单调性与极值分析；",
      "几何与统计：基础平面几何与描述统计；",
      "本地保存、撤销与重做。",
    ],
  },
  {
    title: "技术路线",
    content: [
      "基于 Next.js（App Router）+ React + TypeScript 构建；",
      "Tailwind CSS 负责界面样式；JSXGraph 负责二维坐标画布；",
      "math.js 负责表达式解析、计算与化简；KaTeX 负责公式渲染；",
      "Zustand 管理全局状态，localStorage 负责本地持久化；",
      "数学引擎与 React 组件分层解耦，便于测试与扩展。",
    ],
  },
  {
    title: "系统架构",
    content: [
      "学科模块层（subjects）：统一 SubjectModule 接口，中学数学与导数入门已启用，其余学科预留；",
      "数学引擎层（math-engine）：解析、验证、计算、求解、分析逻辑与界面完全分离；",
      "状态层（store）：Zustand 统一管理表达式、参数、导数结果、历史与画布设置；",
      "视图层（components）：画布、面板与页面组件，通过状态层与引擎层交互。",
    ],
  },
  {
    title: "项目创新点",
    content: [
      "将函数图像、数学计算与分步解题整合到同一平台；",
      "使用参数滑块动态展示函数变化；",
      "函数性质分析与图像联动；",
      "使用割线逼近切线直观展示导数思想；",
      "将导数值、切线斜率与函数变化趋势结合；",
      "面向中学生与高等数学初学者；",
      "采用模块化学科架构，后续可独立扩展完整大学数学模块；",
      "公益开源，便于教师与学生二次开发。",
    ],
  },
  {
    title: "当前限制",
    content: [
      "初版聚焦中学数学与导数入门，不实现极限证明、积分、多元函数、偏导数、微分方程、泰勒级数等高等数学内容；",
      "不包含矩阵、概率分布、复数函数等学科内容；",
      "不支持 AI 自动解题、图片识题与手写公式识别；",
      "无用户系统与云同步；",
      "符号求导初版以中学常见函数为主，复杂表达式自动切换为数值导数并明确标注。",
    ],
  },
  {
    title: "开源公益价值",
    content: [
      "项目完全免费、开源、无广告与商业服务，适合校园课堂与自学场景；",
      "数学引擎与组件分层清晰，代码可读性好，便于学生贡献与教师按需改造；",
      "欢迎以 PR 或 issue 的方式参与功能完善与文档改进。",
    ],
  },
  {
    title: "后续规划",
    content: [
      "高等数学：极限、一元与多元微积分、微分方程；",
      "线性代数：矩阵、线性方程组、行列式与线性变换；",
      "概率论：概率计算、随机变量与常见分布；",
      "复变函数：复数运算、复变函数与基本映射；",
      "交互增强：输入容错提示、更多示例库与练习题集。",
    ],
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[900px] px-6 py-10">
      <header className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">关于 {APP_NAME_ZH}</h1>
        <p className="mt-2 text-sm text-slate-500">
          {APP_NAME} · {TAGLINE} · 版本 {PROJECT_VERSION}
        </p>
      </header>

      <div className="mt-8 space-y-6">
        {SECTIONS.map((section) => (
          <section key={section.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-card">
            <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
            <div className="mt-3 space-y-2">
              {section.content.map((paragraph, index) => (
                <p key={index} className="text-sm leading-relaxed text-slate-600">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-8 text-center text-sm text-slate-500">
        了解更多或参与贡献：
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noreferrer"
          className="ml-1 text-primary-600 hover:underline"
        >
          GitHub 仓库（占位）↗
        </a>
      </p>
    </div>
  );
}
