import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonLinkCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#222222] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex-1 min-w-0 space-y-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-full max-w-md" />
      </div>
      <div className="flex items-center gap-6 md:gap-8 justify-between md:justify-end border-t border-[#222222] md:border-t-0 pt-4 md:pt-0">
        <Skeleton className="h-8 w-20" />
        <div className="hidden sm:block space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonAnalyticsCard() {
  return (
    <div className="bg-[#0a0a0a] border border-[#222222] rounded-xl p-6 flex flex-col items-center justify-center gap-4">
      <Skeleton className="h-12 w-12 rounded-full" />
      <Skeleton className="h-12 w-24" />
      <Skeleton className="h-5 w-32" />
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="bg-[#0a0a0a] border border-[#222222] rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-6 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-20 rounded-lg" />
          <Skeleton className="h-10 w-20 rounded-lg" />
        </div>
      </div>
      <Skeleton className="h-[300px] w-full" />
    </div>
  );
}
