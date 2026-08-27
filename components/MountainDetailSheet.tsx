"use client";

import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface MountainDetailSheetProps {
  mountain: {
    name: string;
    elevation: number | null;
    lat: number;
    lng: number;
  } | null;
  onOpenChange: (open: boolean) => void;
}

const MOUNTAIN_IMAGES = [
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1462616200501-7b425ae2fe37?w=800&q=80&auto=format&fit=crop",
];

export default function MountainDetailSheet({
  mountain,
  onOpenChange,
}: MountainDetailSheetProps) {
  return (
    <Sheet open={!!mountain} onOpenChange={onOpenChange}>
      <SheetContent side="right" showCloseButton className="w-full overflow-y-auto sm:max-w-sm">
        <Carousel className="mx-auto w-full pt-2">
          <CarouselContent>
            {MOUNTAIN_IMAGES.map((src) => (
              <CarouselItem key={src}>
                <div className="relative aspect-[4/3] overflow-hidden rounded-md">
                  <Image
                    src={src}
                    alt="Mountain"
                    fill
                    sizes="(max-width: 640px) 100vw, 384px"
                    className="object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:inline-flex" />
          <CarouselNext className="hidden sm:inline-flex" />
        </Carousel>

        {mountain && (
          <>
            <SheetHeader>
              <SheetTitle>{mountain.name}</SheetTitle>
            </SheetHeader>

            <div className="flex flex-col gap-2 px-4 pb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Elevation</span>
                <span className="font-medium">
                  {mountain.elevation !== null ? `${mountain.elevation} m` : "N/A"}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Latitude</span>
                <span className="font-medium">{mountain.lat.toFixed(4)}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Longitude</span>
                <span className="font-medium">{mountain.lng.toFixed(4)}</span>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
