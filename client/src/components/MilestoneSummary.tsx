import { useQuery } from "@tanstack/react-query";
import { Target, TrendingUp, AlertTriangle, Clock } from "lucide-react";
import type { ADIndexData } from "@shared/schema";

export function MilestoneSummary() {
  const { data: adData } = useQuery<ADIndexData>({
    queryKey: ["/api/score"],
  });

  if (!adData?.categoryDetails) {
    return null;
  }

  // Calculate summary statistics from all milestones
  const allMilestones = Object.values(adData.categoryDetails).flatMap(category => category.milestones);
  const totalMilestones = allMilestones.length;
  const onTrack = allMilestones.filter(m => m.status === "on-track" || m.status === "completed").length;
  const atRisk = allMilestones.filter(m => m.status === "at-risk").length;
  const behind = allMilestones.filter(m => m.status === "behind").length;

  // Calculate overall progress percentage
  const totalProgress = allMilestones.reduce((sum, milestone) => {
    return sum + (milestone.current / milestone.target) * 100;
  }, 0);
  const avgProgress = totalProgress / totalMilestones;

  // Find upcoming deadlines (next 6 months)
  const sixMonthsFromNow = new Date();
  sixMonthsFromNow.setMonth(sixMonthsFromNow.getMonth() + 6);
  const upcomingDeadlines = allMilestones.filter(m => 
    new Date(m.targetDate) <= sixMonthsFromNow && new Date(m.targetDate) >= new Date()
  ).length;

  return (
    <section className="mb-12">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-secondary dark:text-white">Milestone Progress Overview</h3>
          <Target className="text-primary text-xl" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-success mb-1">{onTrack}</div>
            <div className="text-sm text-neutral dark:text-slate-300">On Track</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 mb-1">{atRisk}</div>
            <div className="text-sm text-neutral dark:text-slate-300">At Risk</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-danger mb-1">{behind}</div>
            <div className="text-sm text-neutral dark:text-slate-300">Behind</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary mb-1">{totalMilestones}</div>
            <div className="text-sm text-neutral dark:text-slate-300">Total</div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-secondary dark:text-white">Overall Progress</span>
            <span className="text-sm text-neutral dark:text-slate-300">{Math.round(avgProgress)}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(avgProgress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center text-neutral dark:text-slate-300">
            <Clock className="w-4 h-4 mr-2" />
            <span>{upcomingDeadlines} milestones due in next 6 months</span>
          </div>
          {atRisk > 0 || behind > 0 ? (
            <div className="flex items-center text-yellow-600">
              <AlertTriangle className="w-4 h-4 mr-1" />
              <span>Attention needed</span>
            </div>
          ) : (
            <div className="flex items-center text-success">
              <TrendingUp className="w-4 h-4 mr-1" />
              <span>Making good progress</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}