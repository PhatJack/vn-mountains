"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  type FieldValues,
  type Resolver,
} from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import InputImage from "@/components/ui/input-image";
import { useUploadMountainPhoto } from "@/services/api";
import { useTranslations } from "next-intl";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

type AddPhotoFormValues = FieldValues & {
  file: File;
  caption: string;
  takenAt?: string;
};

const addPhotoSchema = (t: (key: string) => string) =>
  z.object({
    file: z
      .any()
      .refine((file) => file instanceof File, t("photo.fileRequired"))
      .refine((file) => !file || ACCEPTED_FILE_TYPES.includes(file.type), t("photo.fileTypes"))
      .refine((file) => !file || file.size <= MAX_FILE_SIZE, t("photo.fileSize")),
    caption: z.string().trim().max(500, t("photo.captionLength")),
    takenAt: z
      .string()
      .optional()
      .refine((value) => !value || !Number.isNaN(Date.parse(value)), t("photo.invalidDate")),
  });

interface AddMountainPhotoDialogProps {
  mountainId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddMountainPhotoDialog({
  mountainId,
  open,
  onOpenChange,
}: AddMountainPhotoDialogProps) {
  const t = useTranslations();
  const {
    isPending: isUploading,
    mutateAsync: uploadPhoto,
    reset: resetUpload,
  } = useUploadMountainPhoto();
  const form = useForm<AddPhotoFormValues>({
    resolver: zodResolver(addPhotoSchema(t) as never) as unknown as Resolver<AddPhotoFormValues>,
    defaultValues: { file: undefined, caption: "", takenAt: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      resetUpload();
    }
  }, [open, form, resetUpload]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await uploadPhoto({
        mountainId,
        input: {
          file: values.file,
          caption: values.caption,
          takenAt: values.takenAt || undefined,
        },
      });
      toast.success(t("photo.success"));
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error(t("photo.error"));
    }
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("photo.title")}</DialogTitle>
          <DialogDescription>{t("photo.description")}</DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form id="submit-image-form" onSubmit={onSubmit}>
            <FieldGroup>
              <Controller
                name="file"
                control={form.control}
                render={({ fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="submit-image-form-file">{t("photo.file")}</FieldLabel>
                    <InputImage />
                    {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                  </Field>
                )}
              />

              <Controller
                name="caption"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="submit-image-form-caption">
                      {t("photo.caption")}
                    </FieldLabel>
                    <Textarea
                      {...field}
                      id="submit-image-form-caption"
                      placeholder={t("photo.captionPlaceholder")}
                      aria-invalid={fieldState.invalid}
                      disabled={isUploading}
                    />
                    {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                  </Field>
                )}
              />

              <Controller
                name="takenAt"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="submit-image-form-taken-at">
                      {t("photo.dateTaken")}
                    </FieldLabel>
                    <Input
                      {...field}
                      id="submit-image-form-taken-at"
                      type="datetime-local"
                      aria-invalid={fieldState.invalid}
                      disabled={isUploading}
                    />
                    {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                  </Field>
                )}
              />
            </FieldGroup>

            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isUploading}
              >
                {t("common.cancel")}
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <LoaderCircle data-icon="inline-start" className="animate-spin" />
                ) : (
                  <ImagePlus data-icon="inline-start" />
                )}
                {isUploading ? t("photo.uploading") : t("mountainDetail.addPhoto")}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
