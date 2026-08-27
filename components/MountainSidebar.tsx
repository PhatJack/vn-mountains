"use client";

import { useMemo, useState } from "react";
import { Mountain, Search, MapPin, ArrowUpFromLine } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Mountain as MountainType } from "@/lib/overpass";

interface MountainSidebarProps {
  mountains: MountainType[];
  loading: boolean;
  onSelect: (lat: number, lng: number) => void;
  selectedId: number | null;
}

function MountainSkeleton() {
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

export default function MountainSidebar({
  mountains,
  loading,
  onSelect,
  selectedId,
}: MountainSidebarProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return mountains;
    const q = search.toLowerCase();
    return mountains.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        (m.elevation !== null && String(m.elevation).includes(q))
    );
  }, [mountains, search]);

  const totalCount = mountains.length;
  const filteredCount = filtered.length;

  return (
    <Card className="flex h-full flex-col rounded-none border-0 border-r">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <Mountain className="size-5" data-icon="inline-start" />
          Vietnam Mountains
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {loading ? (
            "Loading peaks..."
          ) : (
            <>
              {filteredCount} of {totalCount} peaks
            </>
          )}
        </div>
      </CardHeader>

      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search mountains..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <CardContent className="flex-1 overflow-hidden px-0">
        {loading ? (
          <MountainSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
            <Mountain className="size-8 opacity-50" />
            <p>No mountains found</p>
          </div>
        ) : (
          <ScrollArea className="h-full">
            <div className="flex flex-col">
              {filtered.map((mountain, index) => (
                <div key={mountain.id}>
                  <button
                    type="button"
                    onClick={() => onSelect(mountain.lat, mountain.lng)}
                    className={cn(
                      "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground",
                      selectedId === mountain.id && "bg-accent text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {mountain.name}
                      </span>
                      {mountain.elevation !== null ? (
                        <Badge variant="secondary" className="shrink-0">
                          <ArrowUpFromLine className="size-3" />
                          {mountain.elevation} m
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="shrink-0">
                          N/A
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {mountain.lat.toFixed(4)}, {mountain.lng.toFixed(4)}
                    </span>
                  </button>
                  {index < filtered.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
