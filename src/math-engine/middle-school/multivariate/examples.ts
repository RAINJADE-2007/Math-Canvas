// Multi-variable function module
// Support z=f(x,y)
// 内置典型多元函数案例库，点击后可自动填充公式并绘制。

export interface MultivariateExample {
  id: string;
  name: string;
  expression: string;
  type: string;
  description: string;
}

export const MULTIVARIATE_EXAMPLES: MultivariateExample[] = [
  {
    id: "plane",
    name: "平面",
    expression: "x+y",
    type: "平面",
    description: "z = x + y，一个倾斜的线性平面",
  },
  {
    id: "paraboloid",
    name: "抛物面",
    expression: "x^2+y^2",
    type: "抛物面",
    description: "z = x² + y²，开口向上的旋转抛物面",
  },
  {
    id: "saddle",
    name: "马鞍面",
    expression: "x^2-y^2",
    type: "马鞍面",
    description: "z = x² − y²，双曲抛物面，鞍点位于原点",
  },
  {
    id: "saddle-product",
    name: "双曲抛物面",
    expression: "x*y",
    type: "马鞍面",
    description: "z = x·y，另一类鞍面",
  },
  {
    id: "wave",
    name: "波浪曲面",
    expression: "sin(x)+cos(y)",
    type: "波浪曲面",
    description: "z = sin(x) + cos(y)，周期起伏曲面",
  },
  {
    id: "dome",
    name: "半球面",
    expression: "sqrt(1-x^2-y^2)",
    type: "圆域",
    description: "z = √(1−x²−y²)，定义域为 x²+y²≤1",
  },
];
