export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-center">
        <div className="flex items-end justify-center gap-4 text-4xl font-semibold">
          <span className="loader-float inline-block text-primary-500" style={{ animationDelay: "0s" }}>
            π
          </span>
          <span className="loader-float inline-block text-violet-500" style={{ animationDelay: "0.15s" }}>
            x²
          </span>
          <span className="loader-float inline-block text-primary-600" style={{ animationDelay: "0.3s" }}>
            ∫
          </span>
          <span className="loader-float inline-block text-emerald-500" style={{ animationDelay: "0.45s" }}>
            √
          </span>
        </div>
        <p className="mt-4 text-sm text-slate-500">正在加载模块…</p>
      </div>
    </div>
  );
}
