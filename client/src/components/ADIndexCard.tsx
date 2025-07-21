import { TrendingUp, Activity } from "lucide-react";
import { AnimatedScore } from "./AnimatedScore";
import { TrendIndicator } from "./TrendIndicator";

interface ADIndexCardProps {
  score: number;
  weeklyChange: number;
}

export function ADIndexCard({ score, weeklyChange }: ADIndexCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 max-w-md mx-auto transition-all duration-300 hover:shadow-xl hover:scale-105 border border-slate-200 dark:border-slate-700">
      {/* Header with icon */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            AD Index
          </h3>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
          LIVE
        </div>
      </div>
      
      {/* Animated Score */}
      <div className="text-center mb-6">
        <AnimatedScore value={score} className="mb-2" />
        <div className="text-lg text-slate-600 dark:text-slate-400">out of 100</div>
      </div>
      
      {/* Trend Indicator */}
      <div className="flex items-center justify-center">
        <TrendIndicator value={weeklyChange} size="lg" />
        <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">
          this week
        </span>
      </div>
      
      {/* Progress bar visualization */}
      <div className="mt-6 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
        <div 
          className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
