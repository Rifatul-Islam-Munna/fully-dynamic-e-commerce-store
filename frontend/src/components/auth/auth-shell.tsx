import type { ReactNode } from "react";

type AuthShellProps = {
  title?: string;
  description?: string;
  children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
  return (
    <main className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-[400px]">{children}</div>
    </main>
  );
}
