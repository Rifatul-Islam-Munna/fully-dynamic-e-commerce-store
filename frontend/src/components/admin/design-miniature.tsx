import { cn } from "@/lib/utils";

type Props = { active?: boolean; dense?: boolean };

export function DesignMiniature({ active, dense }: Props) {
  return (
    <div className={cn("h-24 rounded-lg border bg-muted/40 p-2", active && "border-primary ring-2 ring-primary/15")}>
      <div className="flex h-full gap-2">
        <div className="flex-1 bg-primary/15" />
        <div className="w-1/3 space-y-2 bg-background p-2">
          <div className="h-2 bg-foreground/20" />
          <div className="h-1.5 bg-foreground/10" />
          <div className={cn("bg-primary", dense ? "h-2" : "h-3")} />
        </div>
      </div>
    </div>
  );
}
