"use client";

import { useTranslations } from "next-intl";
import { useFormGuard } from "use-form-guard";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useUnsavedChangesStore } from "@/stores/unsaved-changes-store";

export default function UnsavedChangesAlert() {
  const t = useTranslations("unsavedChanges");
  const hasUnsavedChanges = useUnsavedChangesStore((state) =>
    Object.values(state.forms).some((form) => form.isDirty),
  );
  const isOpen = useUnsavedChangesStore((state) => state.pendingClose !== null);
  const cancelClose = useUnsavedChangesStore((state) => state.cancelClose);
  const confirmClose = useUnsavedChangesStore((state) => state.confirmClose);

  useFormGuard(hasUnsavedChanges);

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && cancelClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription>{t("description")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("continueEditing")}</AlertDialogCancel>
          <AlertDialogAction onClick={confirmClose}>{t("discard")}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
