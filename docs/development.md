# 开发说明

## 环境要求

- Node.js 18.18 及以上
- npm 9 及以上

## 常用命令

```bash
npm install      # 安装依赖
npm run dev      # 开发服务器（http://localhost:3000）
npm run lint     # ESLint 检查
npm run build    # 生产构建（含类型检查）
npm run start    # 运行生产构建
```

## 目录约定

```
src/
├─ app/              # App Router 页面
├─ components/       # React 组件
│  ├─ canvas/        #   画布、工具栏、属性面板
│  ├─ expressions/   #   表达式输入与列表
│  ├─ parameters/    #   参数滑块
│  ├─ calculator/    #   计算器
│  ├─ solver/        #   方程与不等式求解
│  ├─ derivative/    #   导数、切线、割线、单调性
│  ├─ geometry/      #   平面几何
│  ├─ statistics/    #   描述统计
│  └─ common/        #   通用组件
├─ math-engine/      # 数学引擎（纯 TS，无 UI）
│  ├─ core/          #   解析 / 验证 / 求值 / 采样
│  ├─ middle-school/ #   函数分析 / 方程 / 不等式 / 几何 / 统计 / 求解
│  └─ calculus-intro/#   求导 / 切线 / 割线 / 单调性 / 验证
├─ subjects/         # 学科模块接口与注册表
├─ store/            # Zustand 状态
├─ types/            # 共享类型
└─ constants/        # 常量
```

## 开发约定

1. 数学逻辑放在 `src/math-engine/`，组件只负责展示与交互；
2. 新增类型先定义在 `src/types/index.ts`；
3. 学科相关能力必须实现 `SubjectModule` 接口；
4. 禁止 `eval()`、`new Function()`；
5. 所有用户输入经过解析器与校验器后再使用；
6. 提交前运行 `npm run lint` 与 `npm run build`。

## 测试方式

项目不依赖浏览器自动化测试，可手动验证，也可以在 Node 中直接调用数学引擎做单元验证，例如：

```ts
// 临时脚本示例
import { solveLinearEquationFromInput } from "@/math-engine/middle-school/solver/solveLinearEquation";
solveLinearEquationFromInput("2*x+3=7");
```

## 常见问题

### JSXGraph 相关

- JSXGraph 样式：`src/styles/jsxgraph.css` 为官方样式文件的本地副本（包内 exports 字段未暴露 CSS 路径，故复制到项目内）；
- 画布组件为客户端组件，JSXGraph 在 `useEffect` 内动态导入，避免 SSR 访问 `document`。

### 数学表达式

- `log(x)` 表示自然对数，`log10(x)` 表示常用对数；
- `sqrt(-1)`、`log(-1)` 等会产生复数，绘制时统一视为无效值（NaN）处理；
- 隐式乘法可用：`2x` 等价于 `2*x`。
