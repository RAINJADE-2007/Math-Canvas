"use client";

import { useRef } from "react";
import { useMathCanvasStore } from "@/store/useMathCanvasStore";
import { PROJECT_VERSION, SCHEMA_VERSION } from "@/constants/app";
import type { MathCanvasData, SavedMathCanvasDocument } from "@/types";

export function DocumentBar() {
  const documentName = useMathCanvasStore((s) => s.documentName);
  const setDocumentName = useMathCanvasStore((s) => s.setDocumentName);
  const restoreDocument = useMathCanvasStore((s) => s.restoreDocument);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  function exportDocument() {
    const s = useMathCanvasStore.getState();
    const { past: _past, future: _future, ...data } = s;
    const doc: SavedMathCanvasDocument = {
      schemaVersion: SCHEMA_VERSION,
      projectVersion: PROJECT_VERSION,
      savedAt: Date.now(),
      subjectId: data.currentSubject,
      data: data as MathCanvasData,
    };
    const blob = new Blob([JSON.stringify(doc, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "math-canvas-document.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function importDocument(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<SavedMathCanvasDocument>;
      if (parsed.schemaVersion === SCHEMA_VERSION && parsed.data && Array.isArray(parsed.data.expressions)) {
        restoreDocument(parsed.data);
      } else {
        window.alert("文件格式不正确，导入失败。");
      }
    } catch {
      window.alert("文件解析失败，无法导入。");
    }
  }

  return (
    <div className="mb-2 flex flex-wrap items-center gap-2">
      <label className="flex items-center gap-1.5 text-sm">
        <span className="text-xs text-slate-400">文档名称：</span>
        <input
          type="text"
          value={documentName}
          onChange={(e) => setDocumentName(e.target.value)}
          className="w-40 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-primary-500"
        />
      </label>
      <span className="text-xs text-green-600">本地自动保存中</span>
      <div className="ml-auto flex items-center gap-2">
        <button
          type="button"
          onClick={exportDocument}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:border-primary-300 hover:text-primary-700"
        >
          导出 JSON
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600 hover:border-primary-300 hover:text-primary-700"
        >
          导入 JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void importDocument(file);
            e.target.value = "";
          }}
        />
      </div>
    </div>
  );
}
