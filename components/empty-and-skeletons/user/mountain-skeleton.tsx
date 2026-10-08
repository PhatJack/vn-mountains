import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export default function MountainSkeleton() {
  return (
    <div className="flex flex-col gap-3 px-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          {i < 4 && <Separator />}
        </div>
      ))}
    </div>
  );
}
