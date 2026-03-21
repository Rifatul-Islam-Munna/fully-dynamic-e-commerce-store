import type { ReactNode } from "react";

type AuthShellProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-surface px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-[420px] bg-surface-container-lowest rounded-xl p-10 sm:p-12">
        {children}
      </div>
    </main>
  );
}
