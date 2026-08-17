// Shows while data is loading — prevents layout shift and
// gives users visual feedback that something is happening.

interface Props { className?: string; count?: number }

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded-lg ${className}`} />;
}

export function Skeleton({ className = "", count = 1 }: Props) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBlock key={i} className={className} />
      ))}
    </>
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className="h-8 w-1/2 mb-2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}