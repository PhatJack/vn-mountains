"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Mountain, UserRound } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { AuthScene } from "@/components/auth/auth-scene";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { getApiErrorMessage } from "@/lib/utils";
import { login, loginWithGoogle, register } from "@/services/api/auth/auth.client";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (element: HTMLElement, options: Record<string, string>) => void;
        };
      };
    };
  }
}

type AuthMode = "login" | "register";

type AuthValues = {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function getSchema(mode: AuthMode, t: ReturnType<typeof useTranslations<"auth">>) {
  const base = z.object({
    displayName: z.string().trim().max(100, t("validation.displayNameMax")),
    email: z.email(t("validation.emailInvalid")).trim().min(1, t("validation.emailRequired")),
    password: z.string().min(8, t("validation.passwordMin")),
    confirmPassword: z.string(),
  });

  if (mode === "login") return base;

  return base
    .extend({ confirmPassword: z.string().min(1, t("validation.confirmPasswordRequired")) })
    .refine((values) => values.password === values.confirmPassword, {
      path: ["confirmPassword"],
      message: t("validation.passwordMismatch"),
    });
}

export function AuthForm({ mode }: { mode: AuthMode }) {
  const t = useTranslations("auth");
  const locale = useLocale();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const googleButtonRef = useRef<HTMLDivElement>(null);
  const schema = getSchema(mode, t);
  const form = useForm<AuthValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: "", email: "", password: "", confirmPassword: "" },
  });

  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || !googleButtonRef.current) return;

    const renderGoogleButton = () => {
      if (!window.google || !googleButtonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          try {
            await loginWithGoogle({ credential });
            toast.success(t("success.login"));
            router.push(`/${locale}`);
          } catch (error) {
            const message = getApiErrorMessage(error) ?? t("errors.request");
            form.setError("root.server", { message });
            toast.error(message);
          }
        },
      });
      googleButtonRef.current.replaceChildren();
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: mode === "login" ? "signin_with" : "signup_with",
        shape: "rectangular",
        width: "400",
      });
    };

    if (window.google) {
      renderGoogleButton();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = renderGoogleButton;
    document.head.appendChild(script);

    return () => {
      script.onload = null;
    };
  }, [locale, mode, router, t]);
  const submit = form.handleSubmit(async (values) => {
    form.clearErrors("root.server");
    try {
      if (mode === "login") {
        await login({ email: values.email, password: values.password });
      } else {
        await register({
          displayName: values.displayName || undefined,
          email: values.email,
          password: values.password,
        });
      }

      toast.success(t(mode === "login" ? "success.login" : "success.register"));
      router.push(`/${locale}`);
    } catch (error) {
      const message = getApiErrorMessage(error) ?? t("errors.request");
      form.setError("root.server", { message });
      toast.error(message);
    }
  });

  return (
    <AuthScene>
      <Card className="border-border/70 bg-card/85 shadow-2xl shadow-foreground/20 backdrop-blur-xl sm:[--card-spacing:--spacing(8)]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <Mountain className="size-6" aria-hidden="true" />
          </div>
          <p className="mb-2 text-xs font-semibold tracking-[0.28em] text-primary uppercase">
            VN Mountains
          </p>
          <CardTitle className="text-3xl tracking-tight">{t(`${mode}.title`)}</CardTitle>
          <CardDescription className="leading-6">{t(`${mode}.description`)}</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={submit} noValidate className="w-full">
            <FieldGroup className="gap-4">
              {mode === "register" && (
                <Controller
                  name="displayName"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="auth-display-name">{t("fields.displayName")}</FieldLabel>
                      <div className="relative">
                        <UserRound
                          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          {...field}
                          id="auth-display-name"
                          className="border-input bg-background/40 pl-10 text-foreground placeholder:text-muted-foreground"
                          placeholder={t("placeholders.displayName")}
                          aria-invalid={fieldState.invalid}
                          disabled={isSubmitting}
                        />
                      </div>
                      {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                    </Field>
                  )}
                />
              )}

              <Controller
                name="email"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="auth-email">{t("fields.email")}</FieldLabel>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <Input
                        {...field}
                        id="auth-email"
                        type="email"
                        className="border-input bg-background/40 pl-10 text-foreground placeholder:text-muted-foreground"
                        placeholder={t("placeholders.email")}
                        aria-invalid={fieldState.invalid}
                        disabled={isSubmitting}
                      />
                    </div>
                    {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <div className="flex items-center justify-between gap-4">
                      <FieldLabel htmlFor="auth-password">{t("fields.password")}</FieldLabel>
                      {mode === "login" && (
                        <Button type="button" variant="link" className="h-auto p-0 text-xs">
                          {t("forgotPassword")}
                        </Button>
                      )}
                    </div>
                    <div className="relative">
                      <LockKeyhole
                        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                        aria-hidden="true"
                      />
                      <Input
                        {...field}
                        id="auth-password"
                        type={showPassword ? "text" : "password"}
                        className="border-input bg-background/40 pr-10 pl-10 text-foreground placeholder:text-muted-foreground"
                        placeholder={t("placeholders.password")}
                        aria-invalid={fieldState.invalid}
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        onClick={() => setShowPassword((visible) => !visible)}
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" aria-hidden="true" />
                        ) : (
                          <Eye className="size-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                  </Field>
                )}
              />

              {mode === "register" && (
                <Controller
                  name="confirmPassword"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor="auth-confirm-password">
                        {t("fields.confirmPassword")}
                      </FieldLabel>
                      <div className="relative">
                        <LockKeyhole
                          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <Input
                          {...field}
                          id="auth-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          className="border-input bg-background/40 pr-10 pl-10 text-foreground placeholder:text-muted-foreground"
                          placeholder={t("placeholders.confirmPassword")}
                          aria-invalid={fieldState.invalid}
                          disabled={isSubmitting}
                        />
                        <button
                          type="button"
                          className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password confirmation"
                              : "Show password confirmation"
                          }
                          onClick={() => setShowConfirmPassword((visible) => !visible)}
                          disabled={isSubmitting}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="size-4" aria-hidden="true" />
                          ) : (
                            <Eye className="size-4" aria-hidden="true" />
                          )}
                        </button>
                      </div>
                      {fieldState.invalid && <FieldError>{fieldState.error?.message}</FieldError>}
                    </Field>
                  )}
                />
              )}
            </FieldGroup>

            <Button
              type="submit"
              className="mt-4 h-11 w-full font-semibold"
              disabled={isSubmitting}
            >
              {isSubmitting && <LoaderCircle className="animate-spin" aria-hidden="true" />}
              {t(mode === "login" ? "login.submit" : "register.submit")}
            </Button>

            {form.formState.errors.root?.server?.message && (
              <p role="alert" className="mt-3 text-center text-sm text-destructive">
                {form.formState.errors.root.server.message}
              </p>
            )}

            <div className="my-4 flex items-center gap-3 text-xs text-muted-foreground">
              <Separator className="flex-1" />
              <span>{t("or")}</span>
              <Separator className="flex-1" />
            </div>

            <div ref={googleButtonRef} className="flex min-h-11 justify-center overflow-hidden" />
          </form>

          <p className="mt-3 text-center text-sm text-muted-foreground">
            {t(mode === "login" ? "switch.noAccount" : "switch.hasAccount")}{" "}
            <Link
              className="font-semibold text-primary hover:text-primary/80"
              href={`/${locale}/${mode === "login" ? "register" : "login"}`}
            >
              {t(mode === "login" ? "switch.register" : "switch.login")}
            </Link>
          </p>
        </CardContent>
      </Card>
    </AuthScene>
  );
}
