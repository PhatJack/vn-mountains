"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useUploadMountainPhoto } from "@/services/api";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];

const addPhotoSchema = z.object({
  file: z
    .any()
    .refine((file) => file instanceof File, "Please choose an image")
    .refine(
      (file) => !file || ACCEPTED_FILE_TYPES.includes(file.type),
      "Only JPEG, PNG, GIF, or WebP images are allowed",
    )
    .refine((file) => !file || file.size <= MAX_FILE_SIZE, "The image must be 5 MB or smaller"),
  caption: z.string().trim().max(500, "Caption must be 500 characters or fewer"),
  takenAt: z
    .string()
    .optional()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), "Please enter a valid date"),
});

type AddPhotoFormValues = z.infer<typeof addPhotoSchema>;

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
  const {
    isPending: isUploading,
    mutateAsync: uploadPhoto,
    reset: resetUpload,
  } = useUploadMountainPhoto();
  const form = useForm<AddPhotoFormValues>({
    resolver: zodResolver(addPhotoSchema),
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
      toast.success("Photo added successfully");
      form.reset();
      onOpenChange(false);
    } catch {
      toast.error("Could not add photo. Please try again.");
    }
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add your mountain photo</DialogTitle>
          <DialogDescription>
            Share a memory from your trip. Images must be 5 MB or smaller.
          </DialogDescription>
        </DialogHeader>

        <form id="submit-image-form" onSubmit={onSubmit}>
          <FieldGroup>
            <Controller
              name="file"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="submit-image-form-file">Photo</FieldLabel>
                  <Input
                    ref={field.ref}
                    name={field.name}
                    id="submit-image-form-file"
                    type="file"
                    accept={ACCEPTED_FILE_TYPES.join(",")}
                    aria-invalid={fieldState.invalid}
                    disabled={isUploading}
                    onBlur={field.onBlur}
                    onChange={(event) => {
                      field.onChange(event.target.files?.[0]);
                    }}
                  />
                  <FieldDescription>
                    JPEG, PNG, GIF, or WebP.Maximum <strong>5 MB</strong>
                  </FieldDescription>
                  {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                </Field>
              )}
            />

            <Controller
              name="caption"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="submit-image-form-caption">Caption</FieldLabel>
                  <Textarea
                    {...field}
                    id="submit-image-form-caption"
                    placeholder="What was this moment like?"
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
                  <FieldLabel htmlFor="submit-image-form-taken-at">Date taken</FieldLabel>
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
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? (
                <LoaderCircle data-icon="inline-start" className="animate-spin" />
              ) : (
                <ImagePlus data-icon="inline-start" />
              )}
              {isUploading ? "Uploading..." : "Add Photo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
