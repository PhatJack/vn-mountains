"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Send } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { difficultyValues } from "@/constant/difficulty";
import { toNullableNumber, toNullableString } from "@/lib/utils";
import { useCreateMountainRequest } from "@/services/api";
import { useTranslations } from "next-intl";
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
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
const DESCRIPTION_MAX_LENGTH = 1000;

type MountainRequestFormValues = {
  name: string;
  nameVi: string;
  latitude: string;
  longitude: string;
  elevationM: string;
  description: string;
  difficulty: string;
  averageClimbingDuration: string;
  recommendedClimbingPeriod: string;
  trailDistanceKm: string;
};

const requiredNumber = (message: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .refine((value) => {
      const number = Number(value);
      return value.length > 0 && Number.isFinite(number) && number >= min && number <= max;
    }, message);

const optionalNumber = (message: string, min?: number) =>
  z
    .string()
    .trim()
    .refine((value) => {
      if (!value) return true;
      const number = Number(value);
      return Number.isFinite(number) && (min === undefined || number >= min);
    }, message);

const mountainRequestSchema = (t: (key: string) => string) =>
  z.object({
    name: z
      .string()
      .trim()
      .min(1, t("validation.nameRequired"))
      .max(250, t("validation.nameLength")),
    nameVi: z.string().trim().max(250, t("validation.nameLength")),
    latitude: requiredNumber(t("validation.latitude"), -90, 90),
    longitude: requiredNumber(t("validation.longitude"), -180, 180),
    elevationM: optionalNumber(t("validation.invalidNumber"), 0),
    description: z.string().trim().max(DESCRIPTION_MAX_LENGTH, t("validation.descriptionLength")),
    difficulty: z.string(),
    averageClimbingDuration: z.string().trim().max(100, t("validation.durationLength")),
    recommendedClimbingPeriod: z.string().trim().max(250, t("validation.periodLength")),
    trailDistanceKm: optionalNumber(t("validation.invalidNumber"), 0),
  });

interface MountainRequestFormProps {
  onSuccess: () => void;
}

export default function MountainRequestForm({ onSuccess }: MountainRequestFormProps) {
  const t = useTranslations("mountainRequest");
  const tDifficulty = useTranslations("mountainRequest.difficulty");
  const { mutateAsync, isPending } = useCreateMountainRequest();
  const form = useForm<MountainRequestFormValues>({
    resolver: zodResolver(mountainRequestSchema(t)),
    defaultValues: {
      name: "",
      nameVi: "",
      latitude: "",
      longitude: "",
      elevationM: "",
      description: "",
      difficulty: "",
      averageClimbingDuration: "",
      recommendedClimbingPeriod: "",
      trailDistanceKm: "",
    },
  });

  useUnsavedChanges("mountain-request", form.formState.isDirty, () => form.reset());
  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await mutateAsync({
        name: values.name.trim(),
        nameVi: toNullableString(values.nameVi) ?? undefined,
        latitude: Number(values.latitude),
        longitude: Number(values.longitude),
        elevationM: toNullableNumber(values.elevationM) ?? undefined,
        description: toNullableString(values.description) ?? undefined,
        difficulty: values.difficulty
          ? (values.difficulty as (typeof difficultyValues)[number])
          : undefined,
        averageClimbingDuration: toNullableString(values.averageClimbingDuration) ?? undefined,
        recommendedClimbingPeriod: toNullableString(values.recommendedClimbingPeriod) ?? undefined,
        trailDistanceKm: toNullableNumber(values.trailDistanceKm) ?? undefined,
      });
      toast.success(t("success"));
      form.reset();
      onSuccess();
    } catch {
      toast.error(t("error"));
    }
  });

  const renderInput = (
    name: keyof MountainRequestFormValues,
    label: string,
    type = "text",
    requiredAtRisk = false,
  ) => (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`mountain-request-${name}`} requiredAtRisk={requiredAtRisk}>
            {label}
          </FieldLabel>
          <Input
            {...field}
            id={`mountain-request-${name}`}
            type={type}
            aria-invalid={fieldState.invalid}
            disabled={isPending}
          />
          {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
        </Field>
      )}
    />
  );

  return (
    <form id="mountain-request-form" onSubmit={onSubmit} className="flex flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-1 pb-4">
        <FieldGroup className="gap-4">
          {renderInput("name", t("fields.name"), "text", true)}
          {renderInput("nameVi", t("fields.nameVi"))}
          <div className="grid gap-4 sm:grid-cols-2">
            {renderInput("latitude", t("fields.latitude"), "number", true)}
            {renderInput("longitude", t("fields.longitude"), "number", true)}
            {renderInput("elevationM", t("fields.elevationM"), "number")}
            {renderInput("trailDistanceKm", t("fields.trailDistanceKm"), "number")}
          </div>
          <Controller
            name="difficulty"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="mountain-request-difficulty">
                  {t("fields.difficulty")}
                </FieldLabel>
                <Select
                  value={field.value || null}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  disabled={isPending}
                >
                  <SelectTrigger id="mountain-request-difficulty" className="w-full">
                    <SelectValue
                      placeholder={t("placeholders.difficulty")}
                      render={<span>{field.value ? tDifficulty(field.value) : ""}</span>}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {difficultyValues.map((value) => (
                      <SelectItem key={value} value={value}>
                        {tDifficulty(value)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="mountain-request-description">
                  {t("fields.description")}
                </FieldLabel>
                <Textarea
                  {...field}
                  id="mountain-request-description"
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
        </FieldGroup>
      </div>
      <div className="sticky bottom-0 flex justify-end border-t bg-background py-4">
        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <LoaderCircle data-icon="inline-start" className="animate-spin" />
          ) : (
            <Send data-icon="inline-start" />
          )}
          {isPending ? t("submitting") : t("submit")}
        </Button>
      </div>
    </form>
  );
}
