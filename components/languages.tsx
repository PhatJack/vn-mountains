import React, { useCallback } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LANGUAGES } from "@/constant/languages";
import { US, VN } from "country-flag-icons/react/3x2";

const LanguagesSelect = () => {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("language");

  const handleOnChangeLanguage = useCallback(
    (language: string | null) => {
      if (!language || language === locale) return;
      const pathnameWithoutLocale = pathname.replace(/^\/(vi|en)(?=\/|$)/, "") || "/";
      router.replace(`/${language}${pathnameWithoutLocale}`);
    },
    [locale, pathname, router],
  );

  return (
    <Select items={LANGUAGES} onValueChange={handleOnChangeLanguage} value={locale}>
      <SelectTrigger aria-label={t("label")}>
        <SelectValue placeholder={t("select")} />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={`lang-${lang.value}`} value={lang.value}>
            {lang.value === "en" ? <US /> : <VN />} {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguagesSelect;
