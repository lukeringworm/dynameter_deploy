import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface AnimatedScoreProps {
  value: number;
  maxValue?: number;
  className?: string;
  duration?: number;
}

export function AnimatedScore({ value, maxValue = 100, className, duration = 1000 }: AnimatedScoreProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;
    const change = endValue - startValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (ease-out)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (change * easeOut);
      
      setDisplayValue(Math.round(currentValue));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className={cn("relative", className)}>
      <span 
        className={cn(
          "text-6xl font-bold transition-all duration-300",
          getScoreColor(displayValue),
          isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}
      >
        {displayValue}
      </span>
      {/* Pulse animation for significant changes */}
      {Math.abs(value - displayValue) > 5 && (
        <div className="absolute inset-0 rounded-full bg-current opacity-20 animate-ping"></div>
      )}
    </div>
  );
}