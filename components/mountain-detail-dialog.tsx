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
import { useMountainDetail, mountainPhotoUrl } from "@/services/api";
import type { Mountain, MountainDetail } from "@/services/api";
import {
  epochToDateTime,
  coordinateToDMS,
  formatNumber,
  hasValue,
  metersToFeet,
} from "@/lib/utils";
import Image from "next/image";
import { CircleAlertIcon, ImagePlus, PencilSparkles } from "lucide-react";
import AddMountainPhotoDialog from "@/components/add-mountain-photo-dialog";
import { useLocale, useTranslations } from "next-intl";
import { StarRating } from "./customs/star-rating";
import { Alert, AlertAction, AlertTitle } from "./reui/alert";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { DialogRootChangeEventDetails } from "@base-ui/react";
import SuggestEditForm from "./detail-dialog/suggest-edit-form";
import { useUnsavedChangesStore } from "@/stores/unsaved-changes-store";

interface MountainDetailDialogProps {
  mountainId: string | null;
  summary: Mountain | null;
  onOpenChange: (open: boolean, eventDetails: DialogRootChangeEventDetails) => void;
}

function DetailQuote({ mountain }: { mountain: MountainDetail }) {
  const t = useTranslations();
  const difficultyRating: Record<NonNullable<MountainDetail["difficulty"]>, number> = {
    beginner: 1,
    basic: 2,
    advanced: 3,
    challenging: 4,
    extremely_hard: 5,
  };

  return (
    <div className="grid max-h-80 grid-cols-1 gap-3 overflow-y-auto text-sm md:grid-cols-3">
      {hasValue(mountain.description) && (
        <div className="flex flex-col gap-1 md:col-span-3">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("mountainDetail.fields.description")}
          </dt>
          <dd className="wrap-break-word text-foreground">{mountain.description}</dd>
        </div>
      )}
      {mountain.difficulty && (
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("mountainDetail.fields.difficulty")}
          </dt>
          <dd className="flex items-center gap-2 text-foreground">
            <StarRating rating={difficultyRating[mountain.difficulty]} />
            <span>{t(`mountainDetail.difficulty.${mountain.difficulty}`)}</span>
          </dd>
        </div>
      )}
      {hasValue(mountain.elevationM) && (
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("mountainDetail.fields.elevationM")}
          </dt>
          <dd className="text-foreground">
            {formatNumber(mountain.elevationM!)} m | {metersToFeet(mountain.elevationM!)} ft
          </dd>
        </div>
      )}
      {hasValue(mountain.trailDistanceKm) && (
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("mountainDetail.fields.trailDistanceKm")}
          </dt>
          <dd className="text-foreground">
            {t("mountainDetail.approximately")} {mountain.trailDistanceKm} km
          </dd>
        </div>
      )}
      {hasValue(mountain.averageClimbingDuration) && (
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("mountainDetail.fields.averageClimbingDuration")}
          </dt>
          <dd className="text-foreground">{mountain.averageClimbingDuration}</dd>
        </div>
      )}
      {hasValue(mountain.recommendedClimbingPeriod) && (
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("mountainDetail.fields.recommendedClimbingPeriod")}
          </dt>
          <dd className="text-foreground">{mountain.recommendedClimbingPeriod}</dd>
        </div>
      )}
      <div className="flex flex-col gap-1">
        <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("mountainDetail.fields.lat")}
        </dt>
        <dd className="text-foreground">{coordinateToDMS(mountain.latitude, "latitude")}</dd>
      </div>
      <div className="flex flex-col gap-1">
        <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          {t("mountainDetail.fields.lng")}
        </dt>
        <dd className="text-foreground">{coordinateToDMS(mountain.longitude, "longitude")}</dd>
      </div>
      {hasValue(mountain.updatedAt) && (
        <div className="flex flex-col gap-1">
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {t("mountainDetail.fields.updatedAt")}
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
  const locale = useLocale();
  const detailQuery = useMountainDetail(mountainId);
  const [addPhotoOpen, setAddPhotoOpen] = useState<boolean>(false);
  const [editSuggestOpen, setEditSuggestOpen] = useState(false);
  const requestClose = useUnsavedChangesStore((state) => state.requestClose);
  const mountain = detailQuery.data;
  const photos = useMemo(
    () =>
      (mountain?.photos ?? []).map((photo) => ({
        ...photo,
        url: mountainPhotoUrl(photo.storageKey),
      })),
    [mountain],
  );
  const open = mountainId !== null;

  // const handleOpenChange = (isOpen: boolean, eventDetails: DialogRootChangeEventDetails) => {
  //   setEditSuggestOpen(isOpen);
  // };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] w-full overflow-y-auto md:min-w-2xl">
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
                              ? new Date(photo.takenAt).toLocaleDateString(
                                  locale === "vi" ? "vi-VN" : "en-US",
                                )
                              : null}
                          </div>
                        )}
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious className="left-0" />
                  <CarouselNext className="right-0" />
                </Carousel>
              </div>
            )}
          </div>
          <div className="w-full min-w-0 space-y-2">
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
            <Sheet
              open={editSuggestOpen}
              onOpenChange={(nextOpen) => {
                if (nextOpen) {
                  setEditSuggestOpen(true);
                  return;
                }

                if (mountain) {
                  requestClose(`suggest-edit-${mountain.id}`, () => setEditSuggestOpen(false));
                } else {
                  setEditSuggestOpen(false);
                }
              }}
            >
              <Alert variant="info">
                <CircleAlertIcon />
                <AlertTitle>Phát hiện sai sót thông tin? Hãy góp ý cho chúng tôi.</AlertTitle>
                <AlertAction>
                  <SheetTrigger
                    render={
                      <Button variant="outline">
                        <PencilSparkles />
                        Góp ý
                      </Button>
                    }
                  />
                </AlertAction>
              </Alert>
              <SheetContent
                className="w-full data-[side=right]:sm:max-w-lg"
                overlaySheetProps={{
                  forceRender: true,
                }}
              >
                <SheetHeader>
                  <SheetTitle>{t("suggestEdit.title")}</SheetTitle>
                  <SheetDescription>{t("suggestEdit.description")}</SheetDescription>
                </SheetHeader>
                {mountain ? (
                  <SuggestEditForm
                    mountain={mountain}
                    onSuccess={() => setEditSuggestOpen(false)}
                  />
                ) : (
                  <div className="px-4 text-sm text-muted-foreground">
                    {t("mountainDetail.loading")}
                  </div>
                )}
              </SheetContent>
            </Sheet>
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
