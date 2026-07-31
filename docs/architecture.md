# 系统架构

## 分层结构

```
┌────────────────────────────────────────────────────────┐
│ 视图层（src/app + src/components）                       │
│  页面、画布、面板、组件                                  │
├────────────────────────────────────────────────────────┤
│ 状态层（src/store/useMathCanvasStore.ts）                │
│  Zustand 全局状态：表达式、参数、导数结果、几何、         │
│  数据集、计算历史、解题记录、撤销/重做、画布设置          │
│  持久化：localStorage（SavedMathCanvasDocument v1）      │
├────────────────────────────────────────────────────────┤
│ 学科模块层（src/subjects）                               │
│  统一 SubjectModule 接口 + 注册表                        │
│  中学数学 / 导数入门 已启用；其余学科占位（enabled=false）│
├────────────────────────────────────────────────────────┤
│ 数学引擎层（src/math-engine）                            │
│  core / middle-school / calculus-intro                  │
│  解析、验证、求值、采样、分析、求解（纯函数，无 UI 依赖）│
└────────────────────────────────────────────────────────┘
```

## 关键设计

### 1. 学科模块统一接口

`src/subjects/types.ts` 定义 `SubjectModule`：

- `canHandle(input)`：判断模块是否可处理输入；
- `analyze(expression)`：返回函数/对象分析结果；
- `solve(problem)`：返回分步求解结果；
- `enabled`：控制模块是否开放。

新增学科只需实现该接口并在注册表中登记，无需重构现有代码。

### 2. 表达式安全流程

```
用户输入
→ 去除 y=、f(x)= 前缀
→ 长度检查（≤200）
→ 字符白名单
→ math.js parse（语法检查）
→ AST 节点校验（函数白名单、符号白名单、禁止赋值/访问/构造）
→ 受控作用域求值
→ 采样 → 绘制/分析
```

禁止 `eval()` 与 `new Function()`。非有限值、复数、除零、定义域外统一以 `NaN` 处理，不会导致页面崩溃。

### 3. 函数采样与间断点处理

`src/math-engine/core/evaluator/sampler.ts`：

- 固定步长采样；
- 非有限值（NaN/Infinity）直接断开；
- 相邻采样点纵坐标跳变过大（渐近线跨越）时主动断开；
- 输出按连续区间切分成多个 `chunk`，JSXGraph 中每个 chunk 独立绘制，保证不跨越间断点连接。

### 4. 导数与可视化

- 符号求导：AST 递归求导 + math.js simplify 化简，输出分步规则；
- 数值导数：中心差分 `f'(x) ≈ [f(x+h)-f(x-h)]/(2h)`，`h=0.0001`；
- 无法符号求导时自动降级为数值导数并明确标注“数值近似”；
- 切线：曲线上创建可拖动点（glider），拖动时实时重算并更新切线/割线；
- 画布采用“签名缓存”避免无意义重建：仅当参数、表达式等变化时才重建曲线。

### 5. 状态与持久化

- 全部状态集中于 Zustand store；
- 撤销/重做：对变更前的数据做快照（上限 50 条），参数滑动不计入历史以避免记录爆炸；
- 持久化格式：

```ts
interface SavedMathCanvasDocument {
  schemaVersion: 1;
  projectVersion: string;
  savedAt: number;
  subjectId: SubjectId;
  data: MathCanvasState; // 不含 past/future
}
```

- 加载时校验版本与基本结构，异常数据回退到默认状态。

## 依赖关系

- 视图层 → 状态层 → 学科模块层 → 数学引擎层（单向）；
- 数学引擎不依赖任何 React 或 Next.js API，可独立测试与复用。
