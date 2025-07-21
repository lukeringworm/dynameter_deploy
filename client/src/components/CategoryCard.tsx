import { Shield, Factory, Zap, Users, Gavel, Truck, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { TrendIndicator } from "./TrendIndicator";

interface CategoryCardProps {
  name: string;
  score: number;
  change: number;
  icon: string;
  color: string;
  categoryKey: string;
  onViewDetails: (categoryKey: string) => void;
}

const iconMap = {
  shield: Shield,
  factory: Factory,
  zap: Zap,
  users: Users,
  gavel: Gavel,
  truck: Truck,
};

const colorMap = {
  blue: {
    bg: "bg-blue-100",
    text: "text-blue-600",
    progress: "bg-blue-600"
  },
  orange: {
    bg: "bg-orange-100",
    text: "text-orange-600",
    progress: "bg-orange-600"
  },
  green: {
    bg: "bg-green-100",
    text: "text-green-600",
    progress: "bg-green-600"
  },
  purple: {
    bg: "bg-purple-100",
    text: "text-purple-600",
    progress: "bg-purple-600"
  },
  indigo: {
    bg: "bg-indigo-100",
    text: "text-indigo-600",
    progress: "bg-indigo-600"
  },
  red: {
    bg: "bg-red-100",
    text: "text-red-600",
    progress: "bg-red-600"
  },
};

export function CategoryCard({ name, score, change, icon, color, categoryKey, onViewDetails }: CategoryCardProps) {
  const IconComponent = iconMap[icon as keyof typeof iconMap] || Shield;
  const colors = colorMap[color as keyof typeof colorMap] || colorMap.blue;
  const isPositive = change > 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer hover:scale-105 group border border-slate-200 dark:border-slate-700 relative overflow-hidden">
      {/* Background hover effect */}
      <div className={`absolute inset-0 ${colors.bg} dark:bg-opacity-5 opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className={`w-12 h-12 ${colors.bg} dark:bg-opacity-20 rounded-lg flex items-center justify-center mr-3 shadow-sm group-hover:shadow-md transition-shadow`}>
              <IconComponent className={`${colors.text} text-xl`} />
            </div>
            <h4 className="text-lg font-semibold text-secondary dark:text-white">{name}</h4>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${colors.text}`}>{score}</div>
            <TrendIndicator value={change} size="sm" />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-3 overflow-hidden">
            <div 
              className={`${colors.progress} h-3 rounded-full transition-all duration-1000 ease-out relative`} 
              style={{ width: `${score}%` }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 animate-shimmer" />
            </div>
          </div>
          {/* Performance label */}
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Moderate" : "Needs Attention"}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <TrendIndicator value={change} size="sm" />
          <button 
            onClick={() => onViewDetails(categoryKey)}
            className="text-primary hover:text-blue-700 dark:hover:text-blue-400 font-medium transition-colors flex items-center gap-1 group"
          >
            View Details
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
