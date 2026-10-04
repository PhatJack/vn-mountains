"use client";

import { AlertCircleIcon, ImageUpIcon, XIcon } from "lucide-react";
import { useEffect, useRef } from "react";
import { useFormContext, useWatch, type FieldValues } from "react-hook-form";
import { useTranslations } from "next-intl";

import { useFileUpload, formatBytes } from "@/hooks/use-file-upload";

export default function InputImage() {
  const t = useTranslations("photo");
  const { control, setValue } = useFormContext<FieldValues>();
  const formFile = useWatch({ control, name: "file" });
  const previousFormFile = useRef<unknown>(formFile);
  const maxSizeMB = 5;
  const maxSize = maxSizeMB * 1024 * 1024;

  const [
    { files, isDragging, errors },
    {
      handleDragEnter,
      handleDragLeave,
      handleDragOver,
      handleDrop,
      openFileDialog,
      removeFile,
      clearFiles,
      getInputProps,
    },
  ] = useFileUpload({
    accept: "image/*",
    maxSize,
    getErrorMessage: (error, params) => {
      switch (error) {
        case "fileTooLarge":
          return t("fileTooLarge", { size: params.size ?? formatBytes(maxSize) });
        case "filesTooLarge":
          return t("filesTooLarge", { size: params.size ?? formatBytes(maxSize) });
        case "invalidType":
          return t("invalidFileType", { fileName: params.fileName ?? "" });
        case "maxFiles":
          return t("maxFiles", { count: params.maxFiles ?? 1 });
      }
    },
  });

  useEffect(() => {
    const file = files[0]?.file;
    const nextFile = file instanceof File ? file : undefined;

    // A form reset should also clear the uploader preview without writing back into the form.
    if (!formFile && previousFormFile.current instanceof File && files.length > 0) {
      clearFiles();
      previousFormFile.current = formFile;
      return;
    }

    if (formFile !== nextFile) {
      setValue("file", nextFile, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }

    previousFormFile.current = formFile;
  }, [clearFiles, files, formFile, setValue]);

  const previewUrl = files[0]?.preview || null;

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {/* Drop area */}
        <div
          className="relative flex min-h-52 flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-input p-4 transition-colors hover:bg-accent/50 has-disabled:pointer-events-none has-disabled:opacity-50 has-[img]:border-none has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
          data-dragging={isDragging || undefined}
          onClick={openFileDialog}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          role="button"
          tabIndex={-1}
        >
          <input {...getInputProps()} aria-label={t("uploadFile")} className="sr-only" />
          {previewUrl ? (
            <div className="absolute inset-0">
              <img
                alt={files[0]?.file?.name || t("uploadedImage")}
                className="size-full object-cover"
                src={previewUrl}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
              <div
                aria-hidden="true"
                className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
              >
                <ImageUpIcon className="size-4 opacity-60" />
              </div>
              <p className="mb-1.5 text-sm font-medium">{t("dropImageHere")}</p>
              <p className="text-xs text-muted-foreground">
                {t("maxSizeLabel", { size: maxSizeMB })}
              </p>
            </div>
          )}
        </div>
        {previewUrl && (
          <div className="absolute top-4 right-4">
            <button
              aria-label={t("removeImage")}
              className="z-50 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/60 text-white transition-[color,box-shadow] outline-none hover:bg-black/80 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              onClick={() => removeFile(files[0]?.id)}
              type="button"
            >
              <XIcon aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="flex items-center gap-1 text-xs text-destructive" role="alert">
          <AlertCircleIcon className="size-3 shrink-0" />
          <span>{errors[0]}</span>
        </div>
      )}

      <p
        aria-live="polite"
        className="mt-2 text-center text-xs text-muted-foreground"
        role="region"
      >
        {t("singleImageUploader")}
      </p>
    </div>
  );
}
