import { useQuery } from "@tanstack/react-query";
import { X, Calendar, Target, TrendingUp, TrendingDown, AlertCircle, CheckCircle } from "lucide-react";
import type { CategoryDetails, Milestone } from "@shared/schema";

interface CategoryDetailsModalProps {
  categoryKey: string;
  isOpen: boolean;
  onClose: () => void;
}

function MilestoneCard({ milestone }: { milestone: Milestone }) {
  const progress = (milestone.current / milestone.target) * 100;
  const isOverdue = new Date(milestone.targetDate) < new Date();
  
  const statusIcons = {
    "on-track": <CheckCircle className="w-5 h-5 text-green-500" />,
    "at-risk": <AlertCircle className="w-5 h-5 text-yellow-500" />,
    "behind": <AlertCircle className="w-5 h-5 text-red-500" />,
    "completed": <CheckCircle className="w-5 h-5 text-green-600" />
  };

  const statusColors = {
    "on-track": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    "at-risk": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
    "behind": "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
    "completed": "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
  };

  const progressColors = {
    "on-track": "bg-green-500",
    "at-risk": "bg-yellow-500",
    "behind": "bg-red-500",
    "completed": "bg-green-600"
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-secondary dark:text-white mb-2">{milestone.title}</h4>
          <p className="text-sm text-neutral dark:text-slate-300">{milestone.description}</p>
        </div>
        <div className="flex items-center ml-4">
          {statusIcons[milestone.status]}
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-secondary dark:text-white">
            {milestone.current.toLocaleString()} / {milestone.target.toLocaleString()} {milestone.unit}
          </span>
          <span className="text-sm text-neutral dark:text-slate-300">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${progressColors[milestone.status]}`}
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center">
          <Calendar className="w-4 h-4 mr-1 text-neutral dark:text-slate-400" />
          <span className={`${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-neutral dark:text-slate-300'}`}>
            Target: {new Date(milestone.targetDate).toLocaleDateString()}
          </span>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[milestone.status]}`}>
          {milestone.status.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
}

export function CategoryDetailsModal({ categoryKey, isOpen, onClose }: CategoryDetailsModalProps) {
  const { data: categoryDetails, isLoading } = useQuery<CategoryDetails>({
    queryKey: [`/api/category/${categoryKey}`],
    enabled: isOpen && !!categoryKey,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-secondary dark:text-white">
            {categoryDetails?.name || 'Loading...'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral dark:text-slate-400 hover:text-secondary dark:hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-neutral dark:text-slate-300">Loading category details...</p>
          </div>
        ) : categoryDetails ? (
          <div className="p-6">
            {/* Overview Section */}
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <div className="text-3xl font-bold text-primary mb-1">{categoryDetails.score}</div>
                  <div className="text-sm text-neutral dark:text-slate-300">Current Score</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <div className={`text-2xl font-bold mb-1 ${categoryDetails.change > 0 ? 'text-success' : 'text-danger'}`}>
                    {categoryDetails.change > 0 ? '+' : ''}{categoryDetails.change}%
                  </div>
                  <div className="text-sm text-neutral dark:text-slate-300">Weekly Change</div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                  <div className="text-2xl font-bold text-secondary dark:text-white mb-1">
                    {categoryDetails.milestones.length}
                  </div>
                  <div className="text-sm text-neutral dark:text-slate-300">Active Milestones</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-secondary dark:text-white mb-2">Description</h3>
                <p className="text-neutral dark:text-slate-300">{categoryDetails.description}</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-secondary dark:text-white mb-2">Current Status</h3>
                <p className="text-neutral dark:text-slate-300">{categoryDetails.currentStatus}</p>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">Key Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {categoryDetails.keyMetrics.map((metric, index) => (
                  <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-bold text-secondary dark:text-white">{metric.value}</div>
                        <div className="text-sm text-neutral dark:text-slate-300">{metric.label}</div>
                      </div>
                      <div className={`flex items-center text-sm font-medium ${
                        metric.trend.startsWith('+') ? 'text-success' : 
                        metric.trend.startsWith('-') ? 'text-danger' : 'text-neutral dark:text-slate-300'
                      }`}>
                        {metric.trend.startsWith('+') ? <TrendingUp className="w-4 h-4 mr-1" /> :
                         metric.trend.startsWith('-') ? <TrendingDown className="w-4 h-4 mr-1" /> : null}
                        {metric.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Milestones */}
            <div>
              <h3 className="text-lg font-semibold text-secondary dark:text-white mb-4">Progress Milestones</h3>
              <div className="space-y-4">
                {categoryDetails.milestones.map((milestone) => (
                  <MilestoneCard key={milestone.id} milestone={milestone} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-neutral dark:text-slate-300">Category details not found.</p>
          </div>
        )}
      </div>
    </div>
  );
}