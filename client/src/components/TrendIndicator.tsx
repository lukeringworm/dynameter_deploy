import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
  value: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function TrendIndicator({ value, className, size = "md" }: TrendIndicatorProps) {
  const isPositive = value > 0;
  const isNeutral = value === 0;
  
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  const getColor = () => {
    if (isNeutral) return "text-gray-500";
    return isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  };

  const getIcon = () => {
    if (isNeutral) return <Minus className={sizeClasses[size]} />;
    return isPositive ? 
      <ArrowUpRight className={sizeClasses[size]} /> : 
      <ArrowDownRight className={sizeClasses[size]} />;
  };

  return (
    <div className={cn("flex items-center gap-1", getColor(), className)}>
      {getIcon()}
      <span className="text-sm font-medium">
        {isNeutral ? "0" : `${isPositive ? "+" : ""}${value.toFixed(1)}`}
      </span>
    </div>
  );
}