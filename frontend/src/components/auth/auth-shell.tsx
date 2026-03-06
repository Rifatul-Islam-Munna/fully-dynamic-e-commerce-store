import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
  return (
    <main className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl items-center justify-center overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-12 h-56 w-56 rounded-full bg-emerald-500/12 blur-3xl" />
      <section className="relative z-10 grid w-full gap-8 lg:grid-cols-2">
        <div className="hidden rounded-2xl border border-border/55 bg-background/75 p-8 backdrop-blur lg:block">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Welcome Back
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">{description}</p>
          <div className="mt-8 space-y-3 text-sm text-muted-foreground">
            <p>Clean, trustworthy, and conversion-focused auth design.</p>
            <p>Works with your current API strategy and server actions.</p>
            <p>Polished with premium color harmony across themes.</p>
          </div>
        </div>
        <div className="w-full">{children}</div>
      </section>
    </main>
  );
}
