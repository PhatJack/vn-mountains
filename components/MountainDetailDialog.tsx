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
import { formatLabel, formatValue, epochToDateTime, coordinateToDMS } from "@/lib/utils";
import { mountainPhotoUrl } from "@/services/api";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import AddMountainPhotoDialog from "@/components/AddMountainPhotoDialog";

interface MountainDetailDialogProps {
  mountainId: string | null;
  summary: Mountain | null;
  onOpenChange: (open: boolean) => void;
}

function DetailQuote({ mountain }: { mountain: MountainDetail }) {
  const fields = Object.entries(mountain).filter(([key, value]) => {
    // Photos are rendered in the gallery; timestamps are handled separately.
    if (
      key === "slug" ||
      key === "photos" ||
      key === "createdAt" ||
      key === "id" ||
      key === "nameVi"
    )
      return false;
    if (key === "updatedAt") return epochToDateTime(value as number) !== null;
    return formatValue(value) !== null;
  });

  return (
    <div className="grid max-h-80 grid-cols-1 gap-3 overflow-y-auto text-sm md:grid-cols-3">
      {fields.map(([key, value]) => (
        <div key={key} className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {formatLabel(key)}
          </dt>
          <dd className="wrap-break-word text-foreground">
            {key === "updatedAt"
              ? epochToDateTime(value as number)
              : key === "lat" || key === "lng"
                ? coordinateToDMS(value as number, key === "lat" ? "latitude" : "longitude")
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
  const [addPhotoOpen, setAddPhotoOpen] = useState(false);

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
  const photos = useMemo(() => {
    if (!mountain) return [];

    return (mountain.photos ?? []).map((photo) => ({
      ...photo,
      url: mountainPhotoUrl(photo.storageKey),
    }));
  }, [mountain]);

  const open = mountainId !== null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-full max-w-6xl min-w-4xl overflow-y-auto">
        <DialogHeader className="sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <DialogTitle>{mountain?.name ?? summary?.name ?? "Mountain details"}</DialogTitle>
            <DialogDescription>
              {detailQuery.isLoading
                ? "Loading mountain information..."
                : detailQuery.isError
                  ? "Mountain information could not be loaded."
                  : "Mountain information and images"}
            </DialogDescription>
          </div>
        </DialogHeader>
        {mountainId && (
          <Button type="button" onClick={() => setAddPhotoOpen(true)}>
            <ImagePlus data-icon="inline-start" />
            Add Photo
          </Button>
        )}
        <div className="grid grid-cols-1 gap-6">
          <div className="w-full min-w-0">
            {detailQuery.isLoading && <Skeleton className="aspect-4/3 w-full rounded-lg" />}

            {!detailQuery.isLoading && photos.length > 0 && (
              <div className="flex w-full flex-col items-center gap-3 overflow-hidden">
                <Carousel
                  setApi={(api) => {
                    setCarouselApi(api);
                  }}
                  className="w-full"
                >
                  <CarouselContent>
                    {photos.map((photo) => (
                      <CarouselItem key={photo.id}>
                        <div className="relative aspect-video overflow-hidden rounded-lg">
                          <Image
                            src={photo.url}
                            alt={mountain?.name ?? "Mountain"}
                            className="size-full object-contain"
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        </div>
                        {(photo.caption || photo.takenAt) && (
                          <div className="mt-2 text-center text-sm text-muted-foreground">
                            {photo.caption}
                            {photo.caption && photo.takenAt ? " · " : ""}
                            {photo.takenAt
                              ? new Date(photo.takenAt).toLocaleDateString("vi-VN")
                              : null}
                          </div>
                        )}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className={"left-0"} />
                  <CarouselNext className={"right-0"} />
                </Carousel>
              </div>
            )}
          </div>

          <div className="w-full min-w-0">
            {detailQuery.isError && (
              <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                <p>Unable to load the full mountain information.</p>
                <Button type="button" variant="outline" onClick={() => detailQuery.refetch()}>
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
                    {summary.elevationM ?? "N/A"} m
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
      {mountainId && (
        <AddMountainPhotoDialog
          mountainId={mountainId}
          open={addPhotoOpen}
          onOpenChange={setAddPhotoOpen}
        />
      )}
    </Dialog>
  );
}
