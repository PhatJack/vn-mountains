import React, { useCallback } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { LANGUAGES } from "@/constant/languages";
import { useMap } from "./ui/map";

const LanguagesSelect = () => {
  const { map } = useMap();

  const handleOnChangeLanguage = useCallback(
    (language: string | null) => {
      map?.getStyle().layers?.forEach((layer) => {
        console.log(layer.id, layer.type);
      });
      // map?.setLayoutProperty("label_country_1", "text-field", [
      //   "get",
      //   `name:${language}`,
      // ]);
      // map?.setLayoutProperty("label_country_2", "text-field", [
      //   "get",
      //   `name:${language}`,
      // ]);
      // map?.setLayoutProperty("label_country_3", "text-field", [
      //   "get",
      //   `name:${language}`,
      // ]);
    },
    [map],
  );

  return (
    <Select items={LANGUAGES} onValueChange={handleOnChangeLanguage} defaultValue={"en"}>
      <SelectTrigger>
        <SelectValue placeholder={"Select Language..."} />
      </SelectTrigger>
      <SelectContent>
        {LANGUAGES.map((lang) => (
          <SelectItem key={`lang-${lang.value}`} value={lang.value}>
            {lang.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguagesSelect;
