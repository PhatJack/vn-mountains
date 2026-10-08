"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CloudHail, LoaderCircle, Send } from "lucide-react";
import { useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateMountainSuggestionEdit } from "@/services/api";
import type { MountainDetail } from "@/services/api";
import { useTranslations } from "next-intl";
import { ScrollArea } from "../ui/scroll-area";
import { difficultyValues } from "@/constant/difficulty";
import { toInputValue, toNullableNumber, toNullableString } from "@/lib/utils";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";

const DESCRIPTION_MAX_LENGTH = 1000;

type SuggestEditFormValues = {
  name: string;
  nameVi: string;
  elevationM: string;
  latitude: string;
  longitude: string;
  description: string;
  difficulty: string;
  averageClimbingDuration: string;
  recommendedClimbingPeriod: string;
  trailDistanceKm: string;
  userNote?: string;
};

const optionalNumber = (message: string, min?: number, max?: number) =>
  z.string().refine((value) => {
    if (!value.trim()) return true;
    const number = Number(value);
    return (
      Number.isFinite(number) &&
      (min === undefined || number >= min) &&
      (max === undefined || number <= max)
    );
  }, message);

const suggestionEditSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, t("validation.nameRequired"))
      .max(200, t("validation.nameLength")),
    nameVi: z.string().trim().max(200, t("validation.nameLength")),
    elevationM: optionalNumber(t("validation.invalidNumber"), 0),
    latitude: optionalNumber(t("validation.invalidLatitude"), -90, 90),
    longitude: optionalNumber(t("validation.invalidLongitude"), -180, 180),
    description: z.string().trim().max(DESCRIPTION_MAX_LENGTH, t("validation.descriptionLength")),
    difficulty: z.string(),
    averageClimbingDuration: z.string().trim().max(200, t("validation.textLength")),
    recommendedClimbingPeriod: z.string().trim().max(200, t("validation.textLength")),
    trailDistanceKm: optionalNumber(t("validation.invalidNumber"), 0),
    userNote: z.string().trim().max(1000, t("validation.noteLength")).optional(),
  });

interface SuggestEditFormProps {
  mountain: MountainDetail;
  onSuccess: () => void;
}

export default function SuggestEditForm({ mountain, onSuccess }: SuggestEditFormProps) {
  const t = useTranslations("suggestEdit");
  const tDifficulty = useTranslations("suggestEdit.difficulty");
  const { mutateAsync, isPending } = useCreateMountainSuggestionEdit();
  const values = {
    name: mountain.name,
    nameVi: toInputValue(mountain.nameVi),
    elevationM: toInputValue(mountain.elevationM),
    latitude: toInputValue(mountain.latitude),
    longitude: toInputValue(mountain.longitude),
    description: toInputValue(mountain.description),
    difficulty: mountain.difficulty ?? "",
    averageClimbingDuration: toInputValue(mountain.averageClimbingDuration),
    recommendedClimbingPeriod: toInputValue(mountain.recommendedClimbingPeriod),
    trailDistanceKm: toInputValue(mountain.trailDistanceKm),
    userNote: "",
  } satisfies SuggestEditFormValues;
  const form = useForm<SuggestEditFormValues>({
    resolver: zodResolver(suggestionEditSchema(t)),
    defaultValues: values,
  });

  useEffect(() => form.reset(values), [form, mountain]);
  useUnsavedChanges(`suggest-edit-${mountain.id}`, form.formState.isDirty, () => form.reset());

  const onSubmit = form.handleSubmit(async (formValues) => {
    try {
      await mutateAsync({
        mountainId: mountain.id,
        name: toNullableString(formValues.name),
        nameVi: toNullableString(formValues.nameVi),
        elevationM: toNullableNumber(formValues.elevationM),
        latitude: toNullableNumber(formValues.latitude),
        longitude: toNullableNumber(formValues.longitude),
        description: toNullableString(formValues.description),
        difficulty: formValues.difficulty
          ? (formValues.difficulty as (typeof difficultyValues)[number])
          : null,
        averageClimbingDuration: toNullableString(formValues.averageClimbingDuration),
        recommendedClimbingPeriod: toNullableString(formValues.recommendedClimbingPeriod),
        trailDistanceKm: toNullableNumber(formValues.trailDistanceKm),
        userNote: formValues.userNote ? toNullableString(formValues.userNote) : null,
      });
      toast.success(t("success"));
      form.reset();
      onSuccess();
    } catch {
      toast.error(t("error"));
    }
  });

  const renderInput = (
    name: keyof SuggestEditFormValues,
    label: string,
    type = "text",
    requiredAtRisk = false,
  ) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => {
        return (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={`suggest-edit-${name}`} requiredAtRisk={requiredAtRisk}>
              {label}
            </FieldLabel>
            <Input
              {...field}
              id={`suggest-edit-${name}`}
              type={type}
              aria-invalid={fieldState.invalid}
              disabled={isPending}
            />
            {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
          </Field>
        );
      }}
    />
  );

  return (
    <ScrollArea className={`min-h-0`}>
      <form id="suggest-edit-form" onSubmit={onSubmit} className="flex flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
          <FieldGroup className="gap-4">
            {renderInput("name", t("fields.name"), "text", true)}
            {renderInput("nameVi", t("fields.nameVi"))}
            <div className="grid gap-4 sm:grid-cols-2">
              {renderInput("elevationM", t("fields.elevationM"), "number")}
              {renderInput("trailDistanceKm", t("fields.trailDistanceKm"), "number")}
              {renderInput("latitude", t("fields.latitude"), "number")}
              {renderInput("longitude", t("fields.longitude"), "number")}
            </div>
            <Controller
              name="difficulty"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="suggest-edit-difficulty">
                    {t("fields.difficulty")}
                  </FieldLabel>
                  <Select
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value ?? "")}
                    disabled={isPending}
                  >
                    <SelectTrigger
                      id="suggest-edit-difficulty"
                      aria-invalid={fieldState.invalid}
                      className="w-full"
                    >
                      <SelectValue
                        placeholder={t("placeholders.difficulty")}
                        render={<span>{field.value ? tDifficulty(field.value) : ""}</span>}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyValues.map((value) => (
                        <SelectItem key={value} value={value}>
                          {t(`difficulty.${value}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                </Field>
              )}
            />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="suggest-edit-description">
                    {t("fields.description")}
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="suggest-edit-description"
                    maxLength={DESCRIPTION_MAX_LENGTH}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  <div className="text-right text-xs text-muted-foreground">
                    {field.value.length}/{DESCRIPTION_MAX_LENGTH}
                  </div>
                  {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                </Field>
              )}
            />
            {renderInput("averageClimbingDuration", t("fields.averageClimbingDuration"))}
            {renderInput("recommendedClimbingPeriod", t("fields.recommendedClimbingPeriod"))}
            <Controller
              name="userNote"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="suggest-edit-user-note">{t("fields.userNote")}</FieldLabel>
                  <Textarea
                    {...field}
                    id="suggest-edit-user-note"
                    placeholder={t("placeholders.userNote")}
                    aria-invalid={fieldState.invalid}
                    disabled={isPending}
                  />
                  {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                </Field>
              )}
            />
          </FieldGroup>
        </div>
        <div className="sticky bottom-0 flex justify-end border-t bg-background p-4">
          <Button type="submit" disabled={isPending} className={`w-full`}>
            {isPending ? (
              <LoaderCircle data-icon="inline-start" className="animate-spin" />
            ) : (
              <Send data-icon="inline-start" />
            )}
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </div>
      </form>
    </ScrollArea>
  );
}
