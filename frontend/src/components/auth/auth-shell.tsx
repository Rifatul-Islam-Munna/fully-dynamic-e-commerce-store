import type { ReactNode } from "react";

type AuthShellProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="relative flex min-h-[calc(100vh-8rem)] items-center justify-center overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.08),transparent_30rem),linear-gradient(180deg,rgba(255,255,255,0.35),rgba(249,249,249,0.9))]" />
      <div className="storefront-panel-strong relative w-full max-w-[520px] rounded-[34px] p-3">
        <div className="rounded-[28px] border border-border/50 bg-white/84 p-8 sm:p-10">
          {children}
        </div>
      </div>
    </main>
  );
}
