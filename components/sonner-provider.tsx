"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export default function SonnerProvider() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      richColors
      closeButton
      position="bottom-right"
    />
  );
}
