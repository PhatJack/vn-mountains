"use client";

import { useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { Mountain, Search, MapPin, ArrowUpFromLine } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Mountain as MountainType } from "@/services/api";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface MountainSidebarProps {
  mountains: MountainType[];
  loading: boolean;
  onSelect: (lat: number, lng: number) => void;
  selectedId: string | null;
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
  "use no memo";
  const t = useTranslations("sidebar");
  const [search, setSearch] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return mountains;
    const q = search.toLowerCase();
    return mountains.filter((m) => m.name.toLowerCase().includes(q));
  }, [mountains, search]);

  const totalCount = mountains.length;
  const filteredCount = filtered.length;
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => viewportRef.current,
    estimateSize: () => 56,
    overscan: 8,
    getItemKey: (index) => filtered[index]?.id ?? index,
  });

  return (
    <Card className="flex h-full flex-col rounded-none border-0 border-r">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center justify-center">
          <Image
            src={"/logo.png"}
            alt={t("logoAlt")}
            width={70}
            height={70}
            className="aspect-square"
            loading="eager"
          />
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-3.5" />
          {loading ? (
            t("loading")
          ) : (
            <>{t("count", { filtered: filteredCount, total: totalCount })}</>
          )}
        </div>
      </CardHeader>
      <div className="px-4 pt-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("searchPlaceholder")}
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
            <p>{t("empty")}</p>
          </div>
        ) : (
          <ScrollArea className="h-full" viewportRef={viewportRef}>
            <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const mountain = filtered[virtualRow.index];
                return (
                  <div
                    key={mountain.id}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    className="absolute top-0 left-0 w-full"
                    style={{
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => onSelect(mountain.lat, mountain.lng)}
                      className={cn(
                        "flex w-full flex-col gap-1 px-4 py-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground",
                        selectedId === mountain.id && "bg-accent text-accent-foreground",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium">{mountain.name}</span>
                        {mountain.elevationM !== null ? (
                          <Badge variant="secondary" className="shrink-0">
                            <ArrowUpFromLine className="size-3" />
                            {mountain.elevationM} m
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
                    {virtualRow.index < filtered.length - 1 && <Separator />}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
