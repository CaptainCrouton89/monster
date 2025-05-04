import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "inherit";
}

export function Spinner({
  className,
  size = "md",
  variant = "default",
}: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
  };

  const variantClasses = {
    default: "border-white/30 border-t-white",
    inherit: "border-current/30 border-t-current",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border border-solid",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    />
  );
}
