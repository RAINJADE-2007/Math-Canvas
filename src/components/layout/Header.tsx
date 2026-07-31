import Link from "next/link";
import { APP_NAME, APP_NAME_ZH, TAGLINE } from "@/constants/app";

const NAV_LINKS = [
  { href: "/", label: "首页" },
  { href: "/canvas", label: "数学画布" },
  { href: "/subjects", label: "学科模块" },
  { href: "/about", label: "项目说明" },
];

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            ∫
          </span>
          <span className="text-base font-semibold text-slate-800">
            {APP_NAME} · {APP_NAME_ZH}
          </span>
          <span className="hidden text-xs text-slate-400 md:inline">{TAGLINE}</span>
        </Link>
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
