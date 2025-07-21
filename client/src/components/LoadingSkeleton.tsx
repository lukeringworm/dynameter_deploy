import { Skeleton } from "@/components/ui/skeleton";

export function CategoryCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Skeleton className="w-12 h-12 rounded-lg mr-3" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="text-right">
          <Skeleton className="h-8 w-12 mb-1" />
          <Skeleton className="h-4 w-8" />
        </div>
      </div>
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

export function ADIndexCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 max-w-md mx-auto border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-4 w-8 rounded-full" />
      </div>
      <div className="text-center mb-6">
        <Skeleton className="h-16 w-24 mx-auto mb-2" />
        <Skeleton className="h-5 w-16 mx-auto" />
      </div>
      <div className="flex items-center justify-center mb-6">
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-2 w-full rounded-full" />
    </div>
  );
}

export function NewsCardSkeleton() {
  return (
    <div className="p-6 border-b border-slate-200 dark:border-slate-600">
      <div className="flex items-center mb-2">
        <Skeleton className="h-5 w-20 rounded-full mr-3" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}