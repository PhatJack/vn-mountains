"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMountainDetail } from "@/services/api";
import type { Mountain, MountainDetail } from "@/services/api";
import { formatLabel, formatValue, epochToDateTime } from "@/lib/utils";
import Image from "next/image";

interface MountainDetailDialogProps {
  mountainId: number | null;
  summary: Mountain | null;
  onOpenChange: (open: boolean) => void;
}

function DetailQuote({ mountain }: { mountain: MountainDetail }) {
  const fields = Object.entries(mountain).filter(([key, value]) => {
    // exclude image fields and createdAt; display updatedAt as formatted datetime
    if (
      key === "images" ||
      key === "imageUrl" ||
      key === "createdAt" ||
      key === "id" ||
      key === "nameAscii" ||
      key === "tags"
    )
      return false;
    if (key === "updatedAt") return epochToDateTime(value as number) !== null;
    return formatValue(value) !== null;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 max-h-80  gap-3 overflow-y-auto text-sm">
      {fields.map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {formatLabel(key)}
          </dt>
          <dd className="wrap-break-word text-foreground">
            {key === "updatedAt"
              ? epochToDateTime(value as number)
              : formatValue(value)}
          </dd>
        </div>
      ))}
    </div>
  );
}

export default function MountainDetailDialog({
  mountainId,
  summary,
  onOpenChange,
}: MountainDetailDialogProps) {
  const detailQuery = useMountainDetail(mountainId);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => setActiveSlide(carouselApi.selectedScrollSnap());
    onSelect();
    carouselApi.on("select", onSelect);

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  const mountain = detailQuery.data;
  const imageUrls = useMemo(() => {
    if (!mountain) return [];

    return Array.from(
      new Set(
        [
          mountain.imageUrl,
          ...(mountain.images ?? []).flatMap((image) => [
            image.imageUrl,
            image.url,
          ]),
        ].filter(
          (url): url is string => typeof url === "string" && url.length > 0,
        ),
      ),
    );
  }, [mountain]);

  const open = mountainId !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] max-w-6xl min-w-4xl w-full overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mountain?.name ?? summary?.name ?? "Mountain details"}
          </DialogTitle>
          <DialogDescription>
            {detailQuery.isLoading
              ? "Loading mountain information..."
              : detailQuery.isError
                ? "Mountain information could not be loaded."
                : "Mountain information and images"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 grid-cols-1">
          <div className="min-w-0 w-full">
            {detailQuery.isLoading && (
              <Skeleton className="aspect-4/3 w-full rounded-lg" />
            )}

            {!detailQuery.isLoading && imageUrls.length > 0 && (
              <div className="flex flex-col gap-3 px-12">
                <Carousel
                  setApi={(api) => {
                    setCarouselApi(api);
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {imageUrls.map((src) => (
                      <CarouselItem key={src}>
                        <div className="aspect-4/3 overflow-hidden rounded-lg bg-muted">
                          <Image
                            src={src}
                            alt={mountain?.name ?? "Mountain"}
                            className="size-full object-cover"
														fill
                          />
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
                <div
                  className="flex justify-center gap-1.5"
                  aria-label="Image slides"
                >
                  {imageUrls.map((src, index) => (
                    <Button
                      key={src}
                      type="button"
                      variant={index === activeSlide ? "default" : "outline"}
                      size="icon-xs"
                      aria-label={`Go to image ${index + 1}`}
                      onClick={() => carouselApi?.scrollTo(index)}
                    >
                      <span className="sr-only">Image {index + 1}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="min-w-0 w-full">
            {detailQuery.isError && (
              <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p>Unable to load the full mountain information.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => detailQuery.refetch()}
                >
                  Retry
                </Button>
              </div>
            )}

            {mountain ? (
              <DetailQuote mountain={mountain} />
            ) : (
              summary && (
                <blockquote className="flex flex-col gap-3 border-l-2 border-primary/30 pl-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Elevation:</span>{" "}
                    {summary.elevation ?? "N/A"} m
                  </div>
                  <div>
                    <span className="text-muted-foreground">Latitude:</span>{" "}
                    {summary.lat.toFixed(4)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Longitude:</span>{" "}
                    {summary.lng.toFixed(4)}
                  </div>
                </blockquote>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
