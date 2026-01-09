import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-4 w-0.5",
  md: "h-8 w-1",
  lg: "h-12 w-1.5",
};

const containerSizeClasses = {
  sm: "gap-0.5",
  md: "gap-1",
  lg: "gap-1.5",
};

export const LoadingSpinner = ({ className, size = "md" }: LoadingSpinnerProps) => {
  return (
    <div className={cn("flex items-center justify-center", containerSizeClasses[size], className)}>
      {[0, 1, 2, 3, 4].map((index) => (
        <span
          key={index}
          className={cn(
            "bg-primary rounded-sm animate-loading-bar",
            sizeClasses[size]
          )}
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
