"use client";

import { useMemo, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
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
import { epochToDateTime, coordinateToDMS, formatNumber } from "@/lib/utils";
import { mountainPhotoUrl } from "@/services/api";
import Image from "next/image";
import { ImagePlus } from "lucide-react";
import AddMountainPhotoDialog from "@/components/AddMountainPhotoDialog";
import { useTranslations } from "next-intl";
import { StarRating } from "./customs/star-rating";

interface MountainDetailDialogProps {
  mountainId: string | null;
  summary: Mountain | null;
  onOpenChange: (open: boolean) => void;
}

function DetailQuote({ mountain }: { mountain: MountainDetail }) {
  const difficultyRating: Record<NonNullable<MountainDetail["difficulty"]>, number> = {
    beginner: 1,
    basic: 2,
    advanced: 3,
    challenging: 4,
    extremely_hard: 5,
  };

  const hasValue = (value: unknown) => value !== null && value !== undefined && value !== "";

  return (
    <div className="grid max-h-80 grid-cols-1 gap-3 overflow-y-auto text-sm md:grid-cols-3">
      {hasValue(mountain.description) && (
        <div className="flex flex-col gap-1 md:col-span-3">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Mô tả
          </dt>
          <dd className="wrap-break-word text-foreground">{mountain.description}</dd>
        </div>
      )}

      {mountain.difficulty && (
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Độ khó
          </dt>
          <dd className="flex items-center gap-2 text-foreground">
            <StarRating rating={difficultyRating[mountain.difficulty]} />
            <span>{mountain.difficulty}</span>
          </dd>
        </div>
      )}

      {hasValue(mountain.elevationM) && (
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Độ cao
          </dt>
          <dd className="text-foreground">{formatNumber(mountain.elevationM!)} m</dd>
        </div>
      )}

      {hasValue(mountain.trailDistanceKm) && (
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Độ dài cung đường
          </dt>
          <dd className="text-foreground">Khoảng {mountain.trailDistanceKm} km</dd>
        </div>
      )}

      {hasValue(mountain.averageClimbingDuration) && (
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Thời gian leo núi trung bình
          </dt>
          <dd className="text-foreground">{mountain.averageClimbingDuration}</dd>
        </div>
      )}

      {hasValue(mountain.recommendedClimbingPeriod) && (
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Thời gian leo núi thích hợp
          </dt>
          <dd className="text-foreground">{mountain.recommendedClimbingPeriod}</dd>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Vĩ độ</dt>
        <dd className="text-foreground">{coordinateToDMS(mountain.latitude, "latitude")}</dd>
      </div>

      <div className="flex flex-col gap-1">
        <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Kinh độ
        </dt>
        <dd className="text-foreground">{coordinateToDMS(mountain.longitude, "longitude")}</dd>
      </div>

      {hasValue(mountain.updatedAt) && (
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Cập nhật cuối
          </dt>
          <dd className="text-foreground">{epochToDateTime(mountain.updatedAt!)}</dd>
        </div>
      )}
    </div>
  );
}

export default function MountainDetailDialog({
  mountainId,
  summary,
  onOpenChange,
}: MountainDetailDialogProps) {
  const t = useTranslations();
  const detailQuery = useMountainDetail(mountainId);
  const [addPhotoOpen, setAddPhotoOpen] = useState(false);

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
            <DialogTitle>
              {mountain?.name ?? summary?.name ?? t("mountainDetail.title")}
            </DialogTitle>
            <DialogDescription>
              {detailQuery.isLoading
                ? t("mountainDetail.loading")
                : detailQuery.isError
                  ? t("mountainDetail.error")
                  : t("mountainDetail.description")}
            </DialogDescription>
          </div>
        </DialogHeader>
        {mountainId && (
          <Button type="button" onClick={() => setAddPhotoOpen(true)}>
            <ImagePlus data-icon="inline-start" />
            {t("mountainDetail.addPhoto")}
          </Button>
        )}
        <div className="grid grid-cols-1 gap-6">
          <div className="w-full min-w-0">
            {detailQuery.isLoading && <Skeleton className="aspect-4/3 w-full rounded-lg" />}

            {!detailQuery.isLoading && photos.length > 0 && (
              <div className="flex w-full flex-col items-center gap-3 overflow-hidden">
                <Carousel className="w-full">
                  <CarouselContent>
                    {photos.map((photo) => (
                      <CarouselItem key={photo.id}>
                        <div className="relative aspect-video overflow-hidden rounded-lg">
                          <Image
                            src={photo.url}
                            alt={mountain?.name ?? t("mountainDetail.imageAlt")}
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
                <p>{t("mountainDetail.loadError")}</p>
                <Button type="button" variant="outline" onClick={() => detailQuery.refetch()}>
                  {t("common.retry")}
                </Button>
              </div>
            )}

            {mountain ? (
              <DetailQuote mountain={mountain} />
            ) : (
              summary && (
                <blockquote className="flex flex-col gap-3 border-l-2 border-primary/30 pl-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">{t("mountainDetail.elevation")}:</span>{" "}
                    {summary.elevationM ?? t("common.notAvailable")} m
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("mountainDetail.latitude")}:</span>{" "}
                    {summary.latitude.toFixed(4)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">{t("mountainDetail.longitude")}:</span>{" "}
                    {summary.longitude.toFixed(4)}
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
