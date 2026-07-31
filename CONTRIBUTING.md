# Contributing 参与贡献

感谢你愿意参与 Math Canvas 数学画布项目。这是一个公益、开源、非商业的教学辅助项目，欢迎学生、教师与开发者共同改进。

## 如何参与

- 反馈问题：在 GitHub 仓库提出 issue，说明复现步骤、期望行为与实际行为；
- 提交功能：遵循下方流程提交 Pull Request；
- 完善文档：项目文档、使用说明与答辩材料同样重要；
- 教学反馈：教师可提供课堂使用中的真实需求与示例。

## 开发环境

需要 Node.js 18.18+ 与 npm。

```bash
npm install
npm run dev
npm run lint
npm run build
```

## 提交规范

- 分支名：`feature/xxx`、`fix/xxx`、`docs/xxx`
- 提交信息：简洁描述改动，如 `feat: 支持二次函数因式分解步骤`
- 合并前请确保 `npm run lint` 与 `npm run build` 通过

## 代码约定

- TypeScript 严格模式；
- 数学逻辑一律放入 `src/math-engine/`，不得写在 React 组件中；
- 新增学科遵循 `src/subjects/types.ts` 中的 `SubjectModule` 接口；
- 禁止使用 `eval()` 与 `new Function()`；
- 新增的表达式能力必须通过表达式安全校验（函数白名单、符号白名单）；
- 对“暂不支持”的内容返回明确提示，而不是给出错误结果。

## 新增学科模块的步骤

1. 在 `src/subjects/` 下创建学科目录与模块文件，实现 `SubjectModule` 接口；
2. 在 `src/subjects/registry.ts` 中注册模块；
3. 在 `src/constants/subjects.ts` 中添加学科元数据；
4. 将 `enabled` 设为 `false`，直到功能完整并经过测试后再开放；
5. 在 `src/app/subjects/[subjectId]/page.tsx` 对应的占位页中补充计划功能说明。

## 行为准则

- 保持交流友善、尊重他人；
- 不提交无关的商业化内容；
- 本项目面向教学，避免加入超出初版范围的复杂功能，优先保证简单、稳定、可运行。
