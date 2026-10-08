"use client";

import { useGlobalStore } from "@/stores/global-store";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTranslations } from "next-intl";
import MountainRequestForm from "./mountain-request-form";
import { useUnsavedChangesStore } from "@/stores/unsaved-changes-store";

export default function MountainRequestDialog() {
  const t = useTranslations("mountainRequest");
  const open = useGlobalStore((state) => state.isDialogOpen);
  const setOpen = useGlobalStore((state) => state.setIsDialogOpen);

  const requestClose = useUnsavedChangesStore((state) => state.requestClose);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOpen(true);
      return;
    }

    requestClose("mountain-request", () => setOpen(false));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="no-scrollbar max-h-[90dvh] overflow-y-auto px-6 pt-6 pb-0 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>
          <MountainRequestForm
            onSuccess={() => {
              setOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
