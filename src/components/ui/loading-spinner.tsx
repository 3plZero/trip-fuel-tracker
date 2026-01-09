import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: { dot: "h-2 w-2", gap: "gap-1" },
  md: { dot: "h-4 w-4", gap: "gap-2" },
  lg: { dot: "h-5 w-5", gap: "gap-2.5" },
};

export const LoadingSpinner = ({ className, size = "md" }: LoadingSpinnerProps) => {
  const config = sizeClasses[size];
  
  return (
    <div className={cn("flex items-center justify-center", config.gap, className)}>
      {[0, 1, 2, 3, 4].map((index) => (
        <span
          key={index}
          className={cn(
            "rounded-full animate-loading-dot",
            config.dot,
            // First 3 dots are dark, last 2 are primary (DOST blue)
            index < 3 ? "bg-foreground" : "bg-primary"
          )}
          style={{
            animationDelay: `${(index + 1) * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
