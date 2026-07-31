"use client";

import { useState } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { uid } from "@/store/useMathCanvasStore";
import { calculateGeometryObject } from "@/math-engine/middle-school/geometry/geometry";
import type { GeometryObject } from "@/types";
import { colorForIndex } from "@/constants/colors";

type FormMode = "point" | "line" | "segment" | "circle";

const MODES: { id: FormMode; label: string }[] = [
  { id: "point", label: "点" },
  { id: "line", label: "直线（两点）" },
  { id: "segment", label: "线段（两点）" },
  { id: "circle", label: "圆（圆心+半径）" },
];

export function GeometryPanel() {
  const geometryObjects = useMathCanvasStore((s) => s.geometryObjects);
  const addGeometryObject = useMathCanvasStore((s) => s.addGeometryObject);
  const removeGeometryObject = useMathCanvasStore((s) => s.removeGeometryObject);
  const toggleGeometryVisibility = useMathCanvasStore((s) => s.toggleGeometryVisibility);
  const selectObject = useMathCanvasStore((s) => s.selectObject);
  const selectedObjectId = useMathCanvasStore((s) => s.selectedObjectId);

  const [mode, setMode] = useState<FormMode>("point");
  const [label, setLabel] = useState("A");
  const [x, setX] = useState("2");
  const [y, setY] = useState("3");
  const [x1, setX1] = useState("0");
  const [y1, setY1] = useState("0");
  const [x2, setX2] = useState("4");
  const [y2, setY2] = useState("3");
  const [radius, setRadius] = useState("3");
  const [error, setError] = useState<string | null>(null);

  function addObject() {
    const num = (value: string): number | null => {
      const n = Number(value);
      return Number.isFinite(n) ? n : null;
    };

    if (!label.trim()) {
      setError("请输入对象名称");
      return;
    }

    let obj: GeometryObject | null = null;
    if (mode === "point") {
      const px = num(x);
      const py = num(y);
      if (px === null || py === null) {
        setError("点坐标必须是数字");
        return;
      }
      obj = { id: uid("geo"), type: "point", label: label.trim(), color: colorForIndex(geometryObjects.length), visible: true, x: px, y: py, createdAt: Date.now(), updatedAt: Date.now() };
    } else if (mode === "line" || mode === "segment") {
      const ax = num(x1);
      const ay = num(y1);
      const bx = num(x2);
      const by = num(y2);
      if (ax === null || ay === null || bx === null || by === null) {
        setError("两点坐标必须是数字");
        return;
      }
      obj = { id: uid("geo"), type: mode, label: label.trim(), color: colorForIndex(geometryObjects.length), visible: true, x1: ax, y1: ay, x2: bx, y2: by, createdAt: Date.now(), updatedAt: Date.now() };
    } else {
      const cx = num(x);
      const cy = num(y);
      const r = num(radius);
      if (cx === null || cy === null || r === null || r <= 0) {
        setError("圆心坐标与半径必须是有效数字（半径需大于 0）");
        return;
      }
      obj = { id: uid("geo"), type: "circle", label: label.trim(), color: colorForIndex(geometryObjects.length), visible: true, centerX: cx, centerY: cy, radius: r, createdAt: Date.now(), updatedAt: Date.now() };
    }

    addGeometryObject(obj);
    setError(null);
    selectObject(obj.id);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
      <div>
        <div className="flex flex-wrap items-center gap-1.5">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setMode(m.id);
                setError(null);
              }}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                mode === m.id
                  ? "bg-primary-600 text-white"
                  : "border border-slate-200 text-slate-600 hover:border-primary-300 hover:text-primary-700"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">名称</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-primary-500"
            />
          </div>

          {mode === "point" || mode === "circle" ? (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400">{mode === "circle" ? "圆心 X" : "X"}</label>
                <input
                  type="number"
                  value={x}
                  onChange={(e) => setX(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-primary-500"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400">{mode === "circle" ? "圆心 Y" : "Y"}</label>
                <input
                  type="number"
                  value={y}
                  onChange={(e) => setY(e.target.value)}
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-primary-500"
                />
              </div>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-slate-400">X₁</label>
                <input type="number" value={x1} onChange={(e) => setX1(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Y₁</label>
                <input type="number" value={y1} onChange={(e) => setY1(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400">X₂</label>
                <input type="number" value={x2} onChange={(e) => setX2(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-primary-500" />
              </div>
              <div>
                <label className="text-xs text-slate-400">Y₂</label>
                <input type="number" value={y2} onChange={(e) => setY2(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-primary-500" />
              </div>
            </div>
          )}

          {mode === "circle" ? (
            <div className="mt-3">
              <label className="text-xs text-slate-400">半径</label>
              <input
                type="number"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-primary-500"
              />
            </div>
          ) : null}

          {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}

          <button
            type="button"
            onClick={addObject}
            className="mt-3 rounded-md bg-primary-600 px-5 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            添加到画布
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          支持计算两点距离、线段中点、直线斜率与圆的面积、周长。示例：点 A(2,3)、点 B(6,5)、圆 O(0,0) 半径 3。
        </p>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">几何对象列表</p>
        {geometryObjects.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
            暂无几何对象
          </p>
        ) : (
          <ul className="space-y-2">
            {geometryObjects.map((obj) => {
              const calculations = calculateGeometryObject(obj);
              const isSelected = selectedObjectId === obj.id;
              return (
                <li
                  key={obj.id}
                  className={`rounded-lg border p-3 ${
                    isSelected ? "border-primary-400 bg-primary-50/60" : "border-slate-200 hover:border-slate-300"
                  }`}
                  onClick={() => selectObject(isSelected ? null : obj.id)}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: obj.color }} />
                    <span className="text-sm font-medium text-slate-700">{calculations.summary}</span>
                    <div className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleGeometryVisibility(obj.id);
                        }}
                        className="rounded px-1.5 py-0.5 text-xs text-slate-500 hover:bg-slate-100"
                      >
                        {obj.visible ? "隐藏" : "显示"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeGeometryObject(obj.id);
                        }}
                        className="rounded px-1.5 py-0.5 text-xs text-red-500 hover:bg-red-50"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                  <ul className="mt-2 space-y-0.5">
                    {calculations.items.map((item, index) => (
                      <li key={index} className="flex gap-2 text-xs text-slate-600">
                        <span className="shrink-0 text-slate-400">{item.label}：</span>
                        <span className="font-mono text-slate-700">{item.value}</span>
                      </li>
                    ))}
                  </ul>
                  {calculations.warning ? (
                    <p className="mt-1 text-xs text-amber-600">{calculations.warning}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
