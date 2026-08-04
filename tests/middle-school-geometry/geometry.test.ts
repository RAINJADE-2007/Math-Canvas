import { describe, it } from "node:test";
import {
  isDegenerateTriangle, isValidTriangle, calcTriangleProps,
  areaTriangle, angleAtDeg, similarTriangle, dist2D, cross2D,
  calcCube, calcCylinder, calcCone, calcSphere
} from "@/math-engine/middle-school/geometry/triangle";

describe("Triangle validation", () => {
  it("valid triangle", () => {
    const valid = isValidTriangle({ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 4 });
    if (!valid) throw new Error("Expected valid triangle");
  });

  it("degenerate: two points coincide", () => {
    const d = isDegenerateTriangle({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 3, y: 4 });
    if (!d) throw new Error("Expected degenerate when two points coincide");
  });

  it("degenerate: three points collinear", () => {
    const d = isDegenerateTriangle({ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 });
    if (!d) throw new Error("Expected degenerate when collinear");
  });

  it("degenerate: triangle inequality fails", () => {
    const d = isDegenerateTriangle({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 10, y: 0 });
    if (!d) throw new Error("Expected degenerate when inequality fails");
  });

  it("area of 3-4-5 is 6", () => {
    const area = areaTriangle({ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 4 });
    if (Math.abs(area - 6) > 0.001) throw new Error(`Expected area 6, got ${area}`);
  });

  it("interior angles sum to ~180", () => {
    const props = calcTriangleProps({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 1, y: 3 });
    const sum = props.angles[0] + props.angles[1] + props.angles[2];
    if (Math.abs(sum - 180) > 1) throw new Error(`Expected sum ~180, got ${sum}`);
  });

  it("right triangle detection", () => {
    const props = calcTriangleProps({ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 4 });
    if (!props.isRight) throw new Error("3-4-5 should be right");
  });

  it("non-right triangle not detected as right", () => {
    const props = calcTriangleProps({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 1, y: 3 });
    if (props.isRight) throw new Error("Non-right should not be detected as right");
  });

  it("pythagorean check for right triangle", () => {
    const props = calcTriangleProps({ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 0, y: 4 });
    if (!props.pythagoreanCheck.holds) throw new Error("Pythagorean should hold for 3-4-5");
  });

  it("pythagorean check fails for non-right", () => {
    const props = calcTriangleProps({ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 3 });
    if (props.pythagoreanCheck.holds) throw new Error("Pythagorean should not hold for non-right");
  });

  it("isosceles detection", () => {
    const props = calcTriangleProps({ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 4 });
    if (!props.isIsosceles) throw new Error("Should detect isosceles");
  });

  it("equilateral detection", () => {
    const props = calcTriangleProps({ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 1, y: Math.sqrt(3) });
    if (!props.isEquilateral) throw new Error("Should detect equilateral");
  });
});

describe("Solid geometry formulas", () => {
  it("cube volume and surface area", () => {
    const c = calcCube(3);
    if (Math.abs(c.volume - 27) > 0.01) throw new Error(`Expected V=27, got ${c.volume}`);
    if (Math.abs(c.surfaceArea - 54) > 0.01) throw new Error(`Expected SA=54, got ${c.surfaceArea}`);
  });

  it("cylinder volume", () => {
    const c = calcCylinder(2, 5);
    if (Math.abs(c.volume - Math.PI * 20) > 0.01) throw new Error("Cylinder V=πr²h incorrect");
  });

  it("cone volume is 1/3 of cylinder", () => {
    const cone = calcCone(3, 4);
    if (Math.abs(cone.volume - Math.PI * 9 * 4 / 3) > 0.01) throw new Error("Cone V=πr²h/3 incorrect");
  });

  it("sphere volume", () => {
    const s = calcSphere(3);
    if (Math.abs(s.volume - Math.PI * 36) > 0.01) throw new Error("Sphere V=4πr³/3 incorrect");
  });
});

describe("Similar triangles", () => {
  it("similar triangle scaling", () => {
    const A = { x: 0, y: 0 }, B = { x: 3, y: 0 }, C = { x: 0, y: 4 };
    const k = 2;
    const sim = similarTriangle(A, B, C, k);
    const ab = dist2D(sim.A, sim.B), bc = dist2D(sim.B, sim.C);
    if (Math.abs(ab - 6) > 0.01) throw new Error(`Expected AB'=6, got ${ab}`);
    if (Math.abs(bc - 10) > 0.01) throw new Error(`Expected BC'=10, got ${bc}`);
  });
});

describe("No NaN or Infinity", () => {
  it("degenerate triangle props produce no NaN", () => {
    const props = calcTriangleProps({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 1, y: 1 });
    for (const s of props.sides) if (isNaN(s)) throw new Error("Side is NaN");
    for (const a of props.angles) if (isNaN(a)) throw new Error("Angle is NaN");
    if (isNaN(props.area)) throw new Error("Area is NaN");
  });

  it("random 1000 triangles produce no NaN", () => {
    for (let i = 0; i < 1000; i++) {
      const pts = Array(3).fill(0).map(() => ({ x: Math.random() * 10, y: Math.random() * 10 }));
      if (isValidTriangle(pts[0], pts[1], pts[2])) {
        const props = calcTriangleProps(pts[0], pts[1], pts[2]);
        if (isNaN(props.area)) throw new Error(`NaN area on iteration ${i}`);
        if (props.angles.some(a => isNaN(a))) throw new Error(`NaN angle on iteration ${i}`);
      }
    }
  });
});
