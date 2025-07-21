import { Clock, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface NewsCardProps {
  category: string;
  title: string;
  description: string;
  impactScore: number;
  timestamp: string;
  link: string;
  isLast?: boolean;
}

const categoryColors = {
  defense: "bg-blue-100 text-blue-600",
  manufacturing: "bg-orange-100 text-orange-600",
  energy: "bg-green-100 text-green-600",
  workforce: "bg-purple-100 text-purple-600",
  techPolicy: "bg-indigo-100 text-indigo-600",
  supplyChain: "bg-red-100 text-red-600",
};

const categoryLabels = {
  defense: "Defense",
  manufacturing: "Manufacturing",
  energy: "Energy",
  workforce: "Workforce",
  techPolicy: "Tech Policy",
  supplyChain: "Supply Chain",
};

export function NewsCard({ 
  category, 
  title, 
  description, 
  impactScore, 
  timestamp, 
  link, 
  isLast = false 
}: NewsCardProps) {
  const isPositive = impactScore > 0;
  const impactLevel = Math.abs(impactScore) >= 4 ? "High Impact" : 
                     Math.abs(impactScore) >= 2 ? "Medium Impact" : 
                     "Low Impact";
  
  const categoryColor = categoryColors[category as keyof typeof categoryColors] || "bg-gray-100 text-gray-600";
  const categoryLabel = categoryLabels[category as keyof typeof categoryLabels] || category;

  const getSentimentIcon = (score: number) => {
    if (score > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getSentimentBorder = (score: number) => {
    if (score > 0) return "border-l-4 border-green-500 bg-green-50/30 dark:bg-green-950/20";
    if (score < 0) return "border-l-4 border-red-500 bg-red-50/30 dark:bg-red-950/20";
    return "border-l-4 border-gray-500 bg-gray-50/30 dark:bg-gray-950/20";
  };

  return (
    <div className={`
      p-6 transition-all duration-300 hover:bg-slate-50 dark:hover:bg-slate-800/50
      ${getSentimentBorder(impactScore)}
      ${!isLast ? 'border-b border-slate-200 dark:border-slate-600' : ''}
    `}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColor} mr-3`}>
              {categoryLabel}
            </span>
            <div className="flex items-center">
              {getSentimentIcon(impactScore)}
              <div className={`w-6 h-6 rounded-full ${isPositive ? 'bg-success' : impactScore < 0 ? 'bg-danger' : 'bg-gray-500'} text-white text-xs font-bold flex items-center justify-center mr-2 ml-1`}>
                {impactScore === 0 ? '0' : `${isPositive ? '+' : ''}${impactScore}`}
              </div>
              <span className={`text-xs ${isPositive ? 'text-success' : impactScore < 0 ? 'text-danger' : 'text-gray-600'} font-medium`}>
                {impactLevel}
              </span>
            </div>
          </div>
          <h4 className="text-lg font-semibold text-secondary dark:text-white mb-2 hover:text-primary transition-colors">
            {title}
          </h4>
          <p className="text-neutral dark:text-slate-300 text-sm mb-3">{description}</p>
          <div className="flex items-center text-xs text-neutral dark:text-slate-400">
            <Clock className="mr-1 w-3 h-3" />
            <span>{timestamp}</span>
            <span className="mx-2">•</span>
            <a 
              href={link} 
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline dark:hover:text-blue-400 transition-colors hover:text-blue-700"
            >
              Read full article
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
