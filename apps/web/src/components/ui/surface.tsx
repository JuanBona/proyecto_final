import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const surfaceVariants = cva("rounded-2xl border text-card-foreground transition-all", {
  variants: {
    tone: {
      soft: "border-border/70 bg-card/85 shadow-[0_10px_35px_rgba(2,6,23,0.06)]",
      elevated: "border-border/80 bg-card shadow-[0_16px_44px_rgba(2,6,23,0.1)]",
      inset: "border-border/60 bg-background/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]",
    },
  },
  defaultVariants: {
    tone: "soft",
  },
});

export interface SurfaceProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceVariants> {}

export const Surface = React.forwardRef<HTMLDivElement, SurfaceProps>(
  ({ className, tone, ...props }, ref) => (
    <div ref={ref} className={cn(surfaceVariants({ tone }), className)} {...props} />
  ),
);
Surface.displayName = "Surface";
