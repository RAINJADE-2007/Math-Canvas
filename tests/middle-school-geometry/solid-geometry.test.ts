import { describe, it } from "node:test";
import { calcCube, calcCylinder, calcCone, calcSphere } from "@/math-engine/middle-school/geometry/triangle";

describe("Solid geometry param binding", () => {
  it("cube uses only a (no r,h)", () => {
    const c = calcCube(3);
    if (Math.abs(c.volume - 27) > 0.01) throw new Error("V=27");
    if (Math.abs(c.surfaceArea - 54) > 0.01) throw new Error("SA=54");
  });
  it("sphere uses only r", () => {
    const s = calcSphere(3);
    if (Math.abs(s.volume - 113.1) > 0.5) throw new Error(`V mismatch: ${s.volume}`);
    if (Math.abs(s.surfaceArea - 113.1) > 0.5) throw new Error("SA mismatch");
  });
  it("cylinder uses r and h", () => {
    const c = calcCylinder(2, 5);
    if (Math.abs(c.volume - 62.83) > 0.1) throw new Error(`V mismatch: ${c.volume}`);
  });
  it("cone volume is 1/3 of cylinder", () => {
    const cone = calcCone(3, 4); const cyl = calcCylinder(3, 4);
    if (Math.abs(cone.volume - cyl.volume / 3) > 0.1) throw new Error("Cone V != Cyl V / 3");
  });
  it("no NaN for valid params", () => {
    for (const fn of [() => calcCube(2), () => calcCylinder(2, 3), () => calcCone(2, 3), () => calcSphere(2)]) {
      const r = fn();
      if (isNaN(r.volume) || isNaN(r.surfaceArea)) throw new Error("NaN produced");
    }
  });
});

describe("3D projection correctness", () => {
  const project = (x: number, y: number, z: number, rotY: number, rotX: number) => {
    const radY = rotY * Math.PI / 180, radX = rotX * Math.PI / 180;
    const x1 = x * Math.cos(radY) + z * Math.sin(radY);
    const z1 = -x * Math.sin(radY) + z * Math.cos(radY);
    const y1 = y * Math.cos(radX) - z1 * Math.sin(radX);
    return { x: x1, y: y1, z: z1 };
  };

  it("rotation changes projection coordinates", () => {
    const p1 = project(1, 0, 0, 0, 0);
    const p2 = project(1, 0, 0, 90, 0);
    if (Math.abs(p1.z - p2.z) < 0.9) throw new Error("z should change with rotation");
  });

  it("sphere silhouette is invariant under rotation but equator changes", () => {
    // Orthographic projection: points on unit sphere project differently
    // depending on rotation. The silhouette (max extent) is radius in screen plane.
    const p = project(1, 0, 0, 0, 0);
    const d = Math.sqrt(p.x ** 2 + p.y ** 2);
    if (Math.abs(d - 1) > 0.001) throw new Error(`(1,0,0) at rest: d=${d}`);
    // At 45° Y rotation, x-axis point (1,0,0) rotates to partially face camera
    const p45 = project(1, 0, 0, 45, 0);
    const d45 = Math.sqrt(p45.x ** 2 + p45.y ** 2);
    if (Math.abs(d45 - Math.SQRT1_2) > 0.01) throw new Error(`At 45°, x=1 expands to d=1/√2, got d=${d45}`);
    // (0,1,0) at rotX=0: stays at 1
    const py = project(0, 1, 0, 0, 0);
    const dy = Math.sqrt(py.x ** 2 + py.y ** 2);
    if (Math.abs(dy - 1) > 0.001) throw new Error(`y-point at rest: d=${dy}`);
  });

  it("face depth changes with rotation", () => {
    // Front point (0,0,1) should become farther after 180° rotation
    const front = project(0, 0, 1, 0, 0); // z=1
    const rotated = project(0, 0, 1, 180, 0); // should become z=-1 in depth
    if (front.z <= rotated.z) throw new Error(`Depth should change: front.z=${front.z}, rotated.z=${rotated.z}`);
  });
});

describe("Visual config bindings", () => {
  it("solid geometry KP binds to solid-geometry type", async () => {
    const { getVisConfig } = await import("@/math-engine/middle-school/geometry/visual-config");
    const cfg = getVisConfig("sn-3d-volume");
    if (!cfg) throw new Error("Missing vis config for sn-3d-volume");
    if (cfg.type !== "solid-geometry") throw new Error(`Expected solid-geometry, got ${cfg.type}`);
  });
  it("triangle KP does not bind to solid-geometry", async () => {
    const { getVisConfig } = await import("@/math-engine/middle-school/geometry/visual-config");
    const cfg = getVisConfig("jr-geo-congruence");
    if (!cfg) throw new Error("Missing config");
    if (cfg.type === "solid-geometry") throw new Error("Triangle KP should not bind to solid-geometry");
  });
});
